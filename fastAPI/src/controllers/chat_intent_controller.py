"""Chat Controller using LangGraph with intent routing and SQLite checkpoints."""

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
from controllers.overview_controller import edit_system_overview
from models.chat import ChatRequest, ChatResponse
from models.overview import EditOverviewRequest

logger = logging.getLogger(__name__)

load_dotenv()


class IntentChatState(TypedDict):
    messages: Annotated[list, add_messages]
    mode: Optional[str]
    project_overview: Optional[str]
    project_brief: Annotated[Optional[str], lambda x, y: y if y is not None else x]
    incoming_brief: Optional[str]
    summary: Optional[str]
    intent: Optional[str]
    engineer_notes: Optional[str]


def _resolve_checkpoint_path() -> str:
    """Store checkpoints next to src for predictable persistence path."""
    return str(Path(__file__).resolve().parent.parent / "checkpoint_intent.sqlite")


sqlite_conn = sqlite3.connect(_resolve_checkpoint_path(), check_same_thread=False)
memory = SqliteSaver(sqlite_conn)

proxy_model = os.getenv("LANGGRAPH_PROXY_MODEL", "gem2.5f")


def _normalize_mode(raw_mode: Optional[str]) -> str:
    normalized = (raw_mode or "").strip().lower()
    if normalized in {"ask", "qna", "question", "qa"}:
        return "ask"
    return "agent"


def _normalize_intent(raw_intent: str) -> str:
    normalized = (raw_intent or "").strip().lower()
    if normalized in {"ask", "normal", "ask_llm", "ask llm", "discuss", "chat"}:
        return "ask"
    if normalized in {"suggest", "suggestion", "recommend", "recommendation"}:
        return "suggest"
    if normalized in {"execute", "apply", "edit", "approve"}:
        return "execute"
    return "ask"


def _route_intent_with_llm(
    latest_user_message: str,
    project_overview: Optional[str] = None,
    project_brief: Optional[str] = None,
) -> str:
    router_prompt_parts = [
        "Classify the user intent into exactly one label: ask, suggest, execute.",
        "",
        "Definitions:",
        "- ask: user only wants to discuss or ask questions.",
        "- suggest: user asks for suggestions to improve/create project overview based on brief.",
        "- execute: user asks to apply edits on overview, or approves prior suggestions to apply.",
        "",
        "Respond with only one label: ask OR suggest OR execute.",
        "",
        f"User message:\n{latest_user_message.strip()}",
    ]

    if project_overview:
        router_prompt_parts.extend(["", f"Current project overview:\n{project_overview.strip()}"])
    if project_brief:
        router_prompt_parts.extend(["", f"Current project brief:\n{project_brief.strip()}"])

    router_response, _usage = asyncio.run(proxy("\n".join(router_prompt_parts), model=proxy_model))
    return _normalize_intent(router_response)


def mode_router(state: IntentChatState):
    mode = _normalize_mode(state.get("mode"))
    logger.info("[MODE ROUTER] mode=%s", mode)
    return {"mode": mode}


def route_after_mode(state: IntentChatState) -> str:
    mode = _normalize_mode(state.get("mode"))
    if mode == "ask":
        return "ask_chatbot"
    return "intent_router"


def intent_router(state: IntentChatState):
    messages = state["messages"]
    latest_user_message = ""

    for message in reversed(messages):
        if getattr(message, "type", "") == "human":
            latest_user_message = str(message.content)
            break

    routed_intent = _route_intent_with_llm(
        latest_user_message,
        project_overview=state.get("project_overview"),
        project_brief=state.get("project_brief") or state.get("incoming_brief"),
    )

    logger.info(
        "[INTENT ROUTER] messages=%s routed_intent=%s",
        len(messages),
        routed_intent,
    )
    return {"intent": routed_intent}


def route_after_intent(state: IntentChatState) -> str:
    """Route to extraction only for execute intent."""
    intent = _normalize_intent(state.get("intent") or "ask")
    if intent == "execute":
        return "extract_engineer_notes"
    return "chatbot"


def extract_engineer_notes(state: IntentChatState):
    """Extract actionable edit notes for execute intent from full chat context."""
    intent = _normalize_intent(state.get("intent") or "normal")
    if intent != "execute":
        return {"engineer_notes": None}

    messages = state["messages"]
    summary = state.get("summary")
    current_overview = state.get("project_overview")

    conversation_lines = []
    for message in messages:
        role = "assistant" if getattr(message, "type", "") == "ai" else "user"
        conversation_lines.append(f"{role}: {message.content}")

    extraction_prompt_sections = [
        "You are extracting engineering edit instructions from a chat conversation.",
        "Task: produce concise engineer_notes describing what to edit in the project overview.",
        "Include only requested changes. Do not include explanations or markdown.",
        "If no clear edit instructions exist, return exactly: NO_EDIT_NOTES",
    ]

    if current_overview:
        extraction_prompt_sections.extend([
            "",
            "Current project overview:",
            current_overview.strip(),
        ])

    if summary:
        extraction_prompt_sections.extend([
            "",
            "Conversation summary:",
            summary.strip(),
        ])

    extraction_prompt_sections.extend(
        [
            "",
            "Conversation:",
            "\n".join(conversation_lines),
            "",
            "engineer_notes:",
        ]
    )

    extracted_text, _usage = asyncio.run(
        proxy("\n".join(extraction_prompt_sections), model=proxy_model)
    )
    cleaned_notes = (extracted_text or "").strip()

    if cleaned_notes.upper() == "NO_EDIT_NOTES":
        cleaned_notes = None

    logger.info(
        "[ENGINEER NOTES] intent=%s extracted=%s length=%s",
        intent,
        bool(cleaned_notes),
        len(cleaned_notes or ""),
    )
    return {"engineer_notes": cleaned_notes}


def _format_messages_for_proxy(
    messages: list,
    project_overview: Optional[str] = None,
    project_brief: Optional[str] = None,
    summary: Optional[str] = None,
    intent: Optional[str] = None,
) -> str:
    """Convert LangGraph message history into a prompt for LiteLLM proxy."""
    sections = []

    if intent:
        sections.append("=== ROUTED INTENT ===")
        sections.append(intent)

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

    if intent == "suggest":
        sections.extend(
            [
                "",
                "=== INSTRUCTION ===",
                "Provide concrete and actionable suggestions for improving the project overview based on the brief.",
                "If overview is missing, suggest a strong first draft structure and key content points.",
                "Ask the user if he want you to apply the suggestions after providing them.",
            ]
        )

    if intent == "execute":
        sections.extend(
            [
                "",
                "=== INSTRUCTION ===",
                "Apply the requested edits to the current project overview.",
                "Return valid JSON only with this shape:",
                '{"assistant_response": "...", "updated_project_overview": "..."}',
            ]
        )

    sections.append("assistant:")
    return "\n\n".join(sections)


def ask_chatbot(state: IntentChatState):
    messages = state["messages"]
    project_brief = state.get("project_brief")
    incoming = state.get("incoming_brief")
    summary = state.get("summary")

    logger.info(
        "[ASK GRAPH] messages=%s state_has_brief=%s incoming_brief=%s has_summary=%s",
        len(messages),
        bool(project_brief),
        bool(incoming),
        bool(summary),
    )

    if project_brief is None and incoming:
        logger.info("[ASK GRAPH] First message detected. Saving project_brief into state.")
        project_brief = incoming

    prompt = _format_messages_for_proxy(
        messages,
        project_overview=state.get("project_overview"),
        project_brief=project_brief,
        summary=summary,
        intent=None,
    )

    logger.info(
        "[ASK PROMPT] brief_in_prompt=%s prompt_length=%s",
        bool(project_brief),
        len(prompt),
    )
    logger.info("[ASK PROMPT PREVIEW]\n%s", prompt)

    response_text, _usage = asyncio.run(proxy(prompt, model=proxy_model))

    return {
        "messages": [AIMessage(content=response_text)],
        "project_brief": project_brief,
    }


def chatbot(state: IntentChatState):
    messages = state["messages"]
    intent = _normalize_intent(state.get("intent") or "ask")
    project_brief = state.get("project_brief")
    incoming = state.get("incoming_brief")
    summary = state.get("summary")

    logger.info(
        "[GRAPH] messages=%s intent=%s state_has_brief=%s incoming_brief=%s has_summary=%s",
        len(messages),
        intent,
        bool(project_brief),
        bool(incoming),
        bool(summary),
    )

    if project_brief is None and incoming:
        logger.info("[GRAPH] First message detected. Saving project_brief into state.")
        project_brief = incoming

    if intent == "execute":
        current_overview = state.get("project_overview")
        extracted_engineer_notes = state.get("engineer_notes")
        latest_user_message = ""
        for message in reversed(messages):
            if getattr(message, "type", "") == "human":
                latest_user_message = str(message.content)
                break

        engineer_notes = extracted_engineer_notes or latest_user_message

        if not current_overview:
            assistant_text = "I need the current project overview before I can apply edits."
            return {
                "messages": [AIMessage(content=assistant_text)],
                "project_brief": project_brief,
                "project_overview": current_overview,
            }

        revised_overview, _usage = asyncio.run(
            edit_system_overview(
                EditOverviewRequest(
                    system_overview=current_overview,
                    engineer_notes=engineer_notes,
                )
            )
        )
#------------------------------------------------------------- look here -------------------------------------------------------------
        assistant_text = "Applied your requested changes to the project overview."
        return {
            "messages": [AIMessage(content=assistant_text)],
            "project_brief": project_brief,
            "project_overview": revised_overview,
        }

    prompt = _format_messages_for_proxy(
        messages,
        project_overview=state.get("project_overview"),
        project_brief=project_brief,
        summary=summary,
        intent=intent,
    )

    logger.info(
        "[PROMPT] intent=%s brief_in_prompt=%s prompt_length=%s",
        intent,
        bool(project_brief),
        len(prompt),
    )
    logger.info("[PROMPT PREVIEW]\n%s", prompt)

    response_text, _usage = asyncio.run(proxy(prompt, model=proxy_model))

    return {
        "messages": [AIMessage(content=response_text)],
        "project_brief": project_brief,
    }


def summarize_messages(state: IntentChatState):
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


graph = StateGraph(IntentChatState)
graph.add_node("mode_router", mode_router)
graph.add_node("ask_chatbot", ask_chatbot)
graph.add_node("intent_router", intent_router)
graph.add_node("extract_engineer_notes", extract_engineer_notes)
graph.add_node("chatbot", chatbot)
graph.add_node("summarize_messages", summarize_messages)
graph.add_conditional_edges(
    "mode_router",
    route_after_mode,
    {
        "ask_chatbot": "ask_chatbot",
        "intent_router": "intent_router",
    },
)
graph.add_conditional_edges(
    "intent_router",
    route_after_intent,
    {
        "extract_engineer_notes": "extract_engineer_notes",
        "chatbot": "chatbot",
    },
)
graph.add_edge("ask_chatbot", "summarize_messages")
graph.add_edge("extract_engineer_notes", "chatbot")
graph.add_edge("chatbot", "summarize_messages")
graph.add_edge("summarize_messages", END)
graph.set_entry_point("mode_router")
app = graph.compile(checkpointer=memory)


async def generate_langgraph_intent_chat_response(request: ChatRequest) -> ChatResponse:
    """Generate a response using LangGraph + intent routing, persisted by thread_id."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    config = {"configurable": {"thread_id": request.thread_id}}

    try:
        logger.info(
            "[CHAT ENDPOINT] thread=%s mode=%s incoming_brief=%s",
            request.thread_id,
            _normalize_mode(request.mode),
            bool(request.project_brief),
        )
        graph_input = {
            "messages": [HumanMessage(content=request.message)],
            "mode": _normalize_mode(request.mode),
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
        routed_intent = _normalize_intent(result.get("intent") or "ask")
        updated_overview = result.get("project_overview")
        should_return_updated_overview = (
            routed_intent == "execute"
            and isinstance(updated_overview, str)
            and bool(updated_overview.strip())
            and updated_overview != (request.project_overview or "")
        )
        return ChatResponse(
            response=ai_message,
            thread_id=request.thread_id,
            intent=routed_intent,
            updated_project_overview=updated_overview if should_return_updated_overview else "",
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("LangGraph intent chat generation failed: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate chat response")
