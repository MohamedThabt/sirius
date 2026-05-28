"""Project Context extraction controller and LangGraph node using Gemini via proxy."""
import asyncio
import json
import logging
import re
from typing import Optional

from fastapi import HTTPException

from controllers.llm_proxy import proxy
from models.project_context import (
    ProjectContext,
    ProjectContextAnalysis,
    ProjectContextExtractionResponse,
    ProjectContextRequest,
)
from models.usage import UsageMetrics
from utils.json_utils import extract_json_from_response

logger = logging.getLogger(__name__)


proxy_model = "gem2.5f"

_PHASE1_FIELDS = (
    "project_purpose",
    "target_audience",
    "value_proposition",
    "features",
    "platforms",
    "constraints",
    "integrations",
)

_FIELD_QUESTIONS = {
    "project_purpose": "What is the project purpose?",
    "target_audience": "Who is the target audience?",
    "value_proposition": "What value proposition is explicitly stated?",
    "features": "What features are explicitly mentioned?",
    "platforms": "Which platforms are explicitly mentioned?",
    "constraints": "What constraints are explicitly mentioned?",
    "integrations": "Which integrations are explicitly mentioned?",
}


def _normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def _filter_string_list(values: object, source_text: str) -> list[str]:
    if not isinstance(values, list):
        return []

    filtered: list[str] = []
    seen: set[str] = set()
    source_norm = _normalize_text(source_text)
    for item in values:
        if not isinstance(item, str):
            continue
        cleaned = item.strip()
        if not cleaned:
            continue
        normalized = _normalize_text(cleaned)
        if normalized in seen:
            continue
        if normalized in source_norm:
            filtered.append(cleaned)
            seen.add(normalized)
    return filtered


def _filter_optional_string(value: object, source_text: str) -> Optional[str]:
    if not isinstance(value, str):
        return None
    cleaned = value.strip()
    if not cleaned:
        return None
    return cleaned if _normalize_text(cleaned) in _normalize_text(source_text) else None


def _build_phase1_prompt(text: str) -> str:
    return (
        "You are a strict information extraction engine.\n"
        "Extract ONLY information explicitly stated in the user input.\n"
        "Do NOT infer, guess, paraphrase, enrich, or add product strategy.\n"
        "If a field is not explicitly stated, return null for strings or [] for arrays.\n"
        "For string fields, copy only exact spans from the input when possible.\n"
        "Return JSON ONLY with this exact schema:\n"
        "{\n"
        '  "project_purpose": string | null,\n'
        '  "target_audience": string[],\n'
        '  "value_proposition": string | null,\n'
        '  "features": string[],\n'
        '  "platforms": string[],\n'
        '  "constraints": string[],\n'
        '  "integrations": string[]\n'
        "}\n\n"
        "Rules:\n"
        "- Do not add missing value propositions.\n"
        "- Do not enrich features.\n"
        "- Do not hallucinate integrations.\n"
        "- Do not include analysis, missing_info, clarifying_questions, or confidence.\n\n"
        f"Input text:\n{text.strip()}\n\n"
        "JSON:" 
    )


def _build_analysis(project_context: ProjectContext, source_text: str) -> ProjectContextAnalysis:
    missing_info: list[str] = []
    clarifying_questions: list[str] = []

    for field_name in _PHASE1_FIELDS:
        value = getattr(project_context, field_name)
        is_missing = value is None or value == []
        if is_missing:
            missing_info.append(field_name)
            clarifying_questions.append(_FIELD_QUESTIONS[field_name])

    required_fields = ("project_purpose", "target_audience", "value_proposition", "features")
    required_missing = sum(
        1
        for field_name in required_fields
        if getattr(project_context, field_name) in (None, [])
    )

    confidence = max(0.0, 1.0 - (0.2 * required_missing) - (0.05 * max(0, len(missing_info) - required_missing)))

    # If the text is very short, reduce confidence slightly because explicit evidence is limited.
    if len(source_text.strip()) < 50:
        confidence = max(0.0, confidence - 0.1)

    return ProjectContextAnalysis(
        missing_info=missing_info,
        clarifying_questions=clarifying_questions,
        confidence=round(confidence, 2),
    )


# --- LangChain-style lightweight wrappers for Layer1 and Layer2 ---


_EXTRACTION_CACHE: dict[str, ProjectContext] = {}


class ExtractionChain:
    async def run(self, text: str) -> tuple[ProjectContext, UsageMetrics]:
        key = text.strip()
        if key in _EXTRACTION_CACHE:
            logger.info("ExtractionChain: cache hit")
            # Return zeroed usage for cache hits
            return _EXTRACTION_CACHE[key], UsageMetrics(model_name=proxy_model, input_tokens=0, output_tokens=0, cost=0.0)

        project_context, usage = await extract_project_context_async(text)
        _EXTRACTION_CACHE[key] = project_context
        return project_context, usage


class ReasoningChain:
    async def run(self, project_context: ProjectContext, source_text: str) -> tuple[dict, UsageMetrics]:
        missing = []
        for field in _PHASE1_FIELDS:
            val = getattr(project_context, field)
            if val in (None, []):
                missing.append(field)

        if not missing:
            return ({"missing_fields": [], "questions": [], "summary_confidence": 1.0}, UsageMetrics(model_name=proxy_model, input_tokens=0, output_tokens=0, cost=0.0))

        prompt_parts = [
            "You are a helpful assistant creating clarifying questions for missing project fields.",
            "Use ONLY the extracted context and the original user text to ground your suggestions.",
            "Do NOT introduce new features or external knowledge.",
            "For each missing field, create one simple clarifying question and three realistic suggested answers grounded in the provided context.",
            "Return JSON only with this shape:\n{\n  \"missing_fields\": [...],\n  \"questions\": [{\"field\": \"...\", \"question\": \"...\", \"suggested_answers\": [\"..\",\"..\",\"..\"]}],\n  \"summary_confidence\": 0.0-1.0\n}\n",
            "Extracted context (JSON):",
            json.dumps(project_context.dict(), ensure_ascii=False, indent=2),
            "Original user text:",
            source_text.strip(),
        ]

        prompt = "\n\n".join(prompt_parts)

        try:
            response_text, usage = await proxy(prompt, model=proxy_model, temperature=0.2, top_p=0.95)
        except Exception as exc:
            logger.error("ReasoningChain LLM call failed: %s", str(exc), exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to call LLM for reasoning")

        extracted_json = extract_json_from_response(response_text)
        parsed = None
        try:
            parsed = json.loads(extracted_json or response_text)
        except Exception:
            parsed = None

        if parsed is None:
            logger.error("ReasoningChain: unparsable JSON from LLM: %s", response_text[:400])
            raise HTTPException(status_code=500, detail="LLM returned unparsable reasoning output")

        missing_fields = parsed.get("missing_fields") or []
        questions = parsed.get("questions") or []
        summary_confidence = float(parsed.get("summary_confidence") or 0.0)

        for q in questions:
            sa = q.get("suggested_answers") or []
            q["suggested_answers"] = [s for s in sa if isinstance(s, str)][:3]

        output = {
            "missing_fields": missing_fields,
            "questions": questions,
            "summary_confidence": summary_confidence,
        }

        return output, usage



async def _call_extraction(prompt: str) -> tuple[str, UsageMetrics]:
    return await proxy(prompt, model=proxy_model, temperature=0.0, top_p=1.0)


async def extract_project_context_async(text: str) -> tuple[ProjectContext, UsageMetrics]:
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")

    prompt = _build_phase1_prompt(text)
    try:
        response_text, usage = await _call_extraction(prompt)
    except Exception as exc:
        logger.error("Project context extraction failed: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to call LLM for extraction")

    body = response_text.strip()
    extracted_json = extract_json_from_response(body)
    parsed = None
    try:
        parsed = json.loads(extracted_json or body)
    except Exception:
        parsed = None

    if parsed is None:
        logger.error("Failed to parse JSON from LLM output: %s", body[:400])
        raise HTTPException(status_code=500, detail="LLM returned unparsable output")

    # Normalize/ensure keys exist and remove anything not explicitly present in the input text.
    ctx_dict = {
        "project_purpose": _filter_optional_string(parsed.get("project_purpose"), text),
        "target_audience": _filter_string_list(parsed.get("target_audience"), text),
        "value_proposition": _filter_optional_string(parsed.get("value_proposition"), text),
        "features": _filter_string_list(parsed.get("features"), text),
        "platforms": _filter_string_list(parsed.get("platforms"), text),
        "constraints": _filter_string_list(parsed.get("constraints"), text),
        "integrations": _filter_string_list(parsed.get("integrations"), text),
    }

    project_context = ProjectContext(**ctx_dict)
    return project_context, usage


def extract_project_context_node(state: dict):
    """LangGraph-compatible node: extracts `project_context` from state and returns it to be stored."""
    # Prefer incoming_brief, fall back to messages joined
    text = state.get("incoming_brief")
    if not text:
        messages = state.get("messages") or []
        lines = []
        for m in messages:
            role = "assistant" if getattr(m, "type", "") == "ai" else "user"
            lines.append(f"{role}: {m.content}")
        text = "\n".join(lines)

    if not text:
        return {"project_context": None}

    try:
        project_context, _usage = asyncio.run(extract_project_context_async(text))
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("LangGraph node extraction failed: %s", str(exc), exc_info=True)
        return {"project_context": None}

    return {"project_context": project_context}


async def extract_project_context_endpoint(request: ProjectContextRequest):
    """Run Layer 1 (extraction) then Layer 2 (reasoning) and return both results."""
    extractor = ExtractionChain()
    reasoner = ReasoningChain()

    project_context, usage1 = await extractor.run(request.text)
    ai_questions, usage2 = await reasoner.run(project_context, request.text)

    # Aggregate usage metrics
    try:
        total_input = (usage1.input_tokens or 0) + (usage2.input_tokens or 0)
        total_output = (usage1.output_tokens or 0) + (usage2.output_tokens or 0)
        total_cost = (usage1.cost or 0.0) + (usage2.cost or 0.0)
        usage = UsageMetrics(model_name=proxy_model, input_tokens=total_input, output_tokens=total_output, cost=total_cost)
    except Exception:
        usage = usage1 or usage2

    # Build response compatible with new full response model
    response = {
        "project_context": project_context,
        "ai_questions": ai_questions,
        "usage": usage,
    }
    return response
