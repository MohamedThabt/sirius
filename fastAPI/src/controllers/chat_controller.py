"""Chat Controller using LangGraph with SQLite checkpoints."""

from pathlib import Path
from typing import Annotated, Optional, TypedDict
import asyncio
import logging
import os
import sqlite3

from dotenv import load_dotenv
from fastapi import HTTPException
from langchain_core.messages import AIMessage, HumanMessage, RemoveMessage
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, StateGraph, add_messages

from controllers.llm_proxy import proxy
from models.chat import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

load_dotenv()


class BasicChatState(TypedDict):
    messages: Annotated[list, add_messages]
    project_overview: Optional[str]
    project_brief: Annotated[Optional[str], lambda x, y: y if y is not None else x]
    incoming_brief: Optional[str]
    summary: Optional[str]


def _resolve_checkpoint_path() -> str:
    """Store checkpoints next to src for predictable persistence path."""
    return str(Path(__file__).resolve().parent.parent / "checkpoint.sqlite")


sqlite_conn = sqlite3.connect(_resolve_checkpoint_path(), check_same_thread=False)
memory = SqliteSaver(sqlite_conn)

proxy_model = os.getenv("LANGGRAPH_PROXY_MODEL", "gem2.5f")


def _format_messages_for_proxy(
    messages: list,
    project_overview: Optional[str] = None,
    project_brief: Optional[str] = None,
    summary: Optional[str] = None,
) -> str:
    """Convert LangGraph message history into a prompt for LiteLLM proxy."""
    sections = []

    if project_overview or project_brief:
        sections.append("=== PROJECT CONTEXT ===")
        if project_overview:
            sections.append(f"PROJECT OVERVIEW:\n{project_overview.strip()}")
        if project_brief:
            sections.append(f"PROJECT BRIEF/BRD:\n{project_brief.strip()}")

    if summary:
        sections.append("=== SUMMARY ===")
        sections.append(summary.strip())

    sections.append("=== CONVERSATION ===")
    for message in messages:
        role = "assistant" if getattr(message, "type", "") == "ai" else "user"
        sections.append(f"{role}: {message.content}")

    sections.append("assistant:")
    return "\n\n".join(sections)


def chatbot(state: BasicChatState):
    messages = state["messages"]
    project_brief = state.get("project_brief")
    incoming = state.get("incoming_brief")
    summary = state.get("summary")

    logger.info(
        "[GRAPH] messages=%s state_has_brief=%s incoming_brief=%s has_summary=%s",
        len(messages),
        bool(project_brief),
        bool(incoming),
        bool(summary),
    )

    if project_brief is None and incoming:
        logger.info("[GRAPH] First message detected. Saving project_brief into state.")
        project_brief = incoming

    prompt = _format_messages_for_proxy(
        messages,
        project_overview=state.get("project_overview"),
        project_brief=project_brief,
        summary=summary,
    )

    logger.info(
        "[PROMPT] brief_in_prompt=%s prompt_length=%s",
        bool(project_brief),
        len(prompt),
    )
    logger.info("[PROMPT PREVIEW]\n%s", prompt)

    response_text, _usage = asyncio.run(proxy(prompt, model=proxy_model))
    return {
        "messages": [AIMessage(content=response_text)],
        "project_brief": project_brief,
    }


def summarize_messages(state: BasicChatState):
    messages = state["messages"]
    if len(messages) <= 10:
        logger.info("[SUMMARY] Skipping summarization. messages=%s", len(messages))
        return {}

    logger.info("[SUMMARY] Triggered summarization. messages=%s", len(messages))

    conversation_lines = []
    for message in messages:
        role = "assistant" if getattr(message, "type", "") == "ai" else "user"
        conversation_lines.append(f"{role}: {message.content}")

    summary_prompt_sections = [
        "Summarize the conversation so far while preserving important context.",
    ]
    if state.get("summary"):
        summary_prompt_sections.extend(
            [
                "",
                "Existing summary:",
                state["summary"].strip(),
            ]
        )
    summary_prompt_sections.extend(
        [
            "",
            "Conversation:",
            "\n".join(conversation_lines),
        ]
    )
    summary_prompt = "\n".join(summary_prompt_sections)

    summary_text, _usage = asyncio.run(proxy(summary_prompt, model=proxy_model))
    logger.info(
        "[SUMMARY] Saved summary_length=%s and trimming messages to last 4",
        len(summary_text),
    )

    return {
        "summary": summary_text,
        "messages": [RemoveMessage(id=message.id) for message in messages[:-4]],
    }


graph = StateGraph(BasicChatState)
graph.add_node("chatbot", chatbot)
graph.add_node("summarize_messages", summarize_messages)
graph.add_edge("chatbot", "summarize_messages")
graph.add_edge("summarize_messages", END)
graph.set_entry_point("chatbot")
app = graph.compile(checkpointer=memory)


async def generate_langgraph_chat_response(request: ChatRequest) -> ChatResponse:
    """Generate a response using LangGraph and persist context by thread_id."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    config = {"configurable": {"thread_id": request.thread_id}}

    try:
        logger.info(
            "[CHAT ENDPOINT] thread=%s incoming_brief=%s",
            request.thread_id,
            bool(request.project_brief),
        )
        graph_input = {
            "messages": [HumanMessage(content=request.message)]
        }

        if request.project_overview:
            graph_input["project_overview"] = request.project_overview

        if request.project_brief:
            graph_input["incoming_brief"] = request.project_brief

        result = await asyncio.to_thread(
            app.invoke,
            graph_input,
            config,
        )
        ai_message = result["messages"][-1].content
        return ChatResponse(response=ai_message, thread_id=request.thread_id)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("LangGraph chat generation failed: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate chat response")
