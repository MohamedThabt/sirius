"""Chat Controller using LangGraph with SQLite checkpoints."""

from pathlib import Path
from typing import Annotated, Optional, TypedDict
import asyncio
import logging
import os
import sqlite3

from dotenv import load_dotenv
from fastapi import HTTPException
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, StateGraph, add_messages

from controllers.llm_proxy import proxy
from models.chat import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

load_dotenv()


class BasicChatState(TypedDict):
    messages: Annotated[list, add_messages]
    project_overview: Optional[str]
    project_brief: Optional[str]


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
) -> str:
    """Convert LangGraph message history into a prompt for LiteLLM proxy."""
    sections = []

    if project_overview or project_brief:
        sections.append("=== PROJECT CONTEXT ===")
        if project_overview:
            sections.append(f"PROJECT OVERVIEW:\n{project_overview.strip()}")
        if project_brief:
            sections.append(f"PROJECT BRIEF/BRD:\n{project_brief.strip()}")
        sections.append(
            "Use the project context above to answer questions accurately. "
            "If the user asks about the project, refer to this information."
        )
        sections.append("=" * 22)

    sections.append("=== CONVERSATION ===")
    for message in messages:
        role = "assistant" if getattr(message, "type", "") == "ai" else "user"
        sections.append(f"{role}: {message.content}")

    sections.append("assistant:")
    return "\n\n".join(sections)


def chatbot(state: BasicChatState):
    prompt = _format_messages_for_proxy(
        state["messages"],
        project_overview=state.get("project_overview"),
        project_brief=state.get("project_brief"),
    )
    response_text, _usage = asyncio.run(proxy(prompt, model=proxy_model))
    return {
        "messages": [AIMessage(content=response_text)]
    }


graph = StateGraph(BasicChatState)
graph.add_node("chatbot", chatbot)
graph.add_edge("chatbot", END)
graph.set_entry_point("chatbot")
app = graph.compile(checkpointer=memory)


async def generate_langgraph_chat_response(request: ChatRequest) -> ChatResponse:
    """Generate a response using LangGraph and persist context by thread_id."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    config = {"configurable": {"thread_id": request.thread_id}}

    try:
        result = await asyncio.to_thread(
            app.invoke,
            {
                "messages": [HumanMessage(content=request.message)],
                "project_overview": request.project_overview,
                "project_brief": request.project_brief,
            },
            config,
        )
        ai_message = result["messages"][-1].content
        return ChatResponse(response=ai_message, thread_id=request.thread_id)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("LangGraph chat generation failed: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate chat response")
