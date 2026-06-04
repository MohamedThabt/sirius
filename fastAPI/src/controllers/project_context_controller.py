"""Project Context extraction controller and LangGraph node using Gemini via proxy."""
import json
import logging
import re
from typing import Optional

from fastapi import HTTPException
from pydantic import ValidationError

from controllers.llm_proxy import proxy
from models.project_context import (
    ProjectContext,
    ProjectContextRequest,
)
from models.usage import UsageMetrics
from utils.json_utils import extract_json_from_response

logger = logging.getLogger(__name__)


proxy_model = "gem2.5f"

REQUIRED_FIELDS = (
    "project_purpose",
    "target_audience",
    "value_proposition",
    "features",
    "platforms",
    "integrations",
)

OPTIONAL_FIELDS = (
    "constraints",
)

# All fields present in phase 1 extraction




def _normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def is_grounded(value: str, source_text: str) -> bool:
    """Validate if the extracted value is grounded in the source text.
    
    Allows:
    - Exact matches (case-insensitive, normalized spaces)
    - Normalized containment
    - Direct semantic reductions (e.g. 'mobile app' -> 'mobile')
    - Word/stem prefix overlap (e.g. 'students' -> 'study')
    
    Rejects completely unrelated values.
    """
    # Reject empty values immediately
    if not value or not source_text:
        return False

    # Normalize both strings (lowercase, collapse whitespace)
    norm_val = _normalize_text(value)
    norm_source = _normalize_text(source_text)

    # Step 1: Check for exact match or direct substring containment
    if norm_val in norm_source:
        return True

    # Step 2: Extract individual words of length >= 2 to inspect overlap
    val_words = [w for w in re.findall(r"\w+", norm_val) if len(w) >= 2]
    source_words = set(re.findall(r"\w+", norm_source))

    # If the normalized value contains no words of length >= 2, fall back to simple containment check
    if not val_words:
        return norm_val in norm_source

    # Step 3: Check if any normalized word in the extracted value exists exactly in the source text
    for vw in val_words:
        if vw in source_words:
            return True

    # Step 4: Check for word-stem/prefix similarity (e.g., "studying" matches "students")
    # We compare the first 4 characters (or shorter if the word is less than 4 letters, min 3)
    for vw in val_words:
        prefix_len = min(4, len(vw))
        if prefix_len >= 3:
            prefix_vw = vw[:prefix_len]
            for sw in source_words:
                # If a source word starts with the prefix of the value word, or vice versa, accept it
                if sw.startswith(prefix_vw) or vw.startswith(sw[:min(4, len(sw))]):
                    return True

    # Step 5: Check for direct semantic reductions and platform synonyms (e.g., "iOS" -> "mobile")
    platform_keywords = {
        "mobile": {"ios", "android", "iphone", "ipad", "phone", "mobile", "app store", "play store", "cordova", "flutter", "react native"},
        "web": {"web", "website", "browser", "chrome", "safari", "firefox", "saas", "frontend", "desktop web", "online"},
        "desktop": {"desktop", "windows", "mac", "macos", "linux", "electron", "pc"},
    }
    
    # Iterate through defined platforms and their corresponding synonym lists
    for key, synonyms in platform_keywords.items():
        # If the extracted value contains the platform key (e.g. "mobile")
        if key in norm_val:
            # check if any synonym (e.g. "ios") is in the source text
            if any(syn in norm_source for syn in synonyms):
                return True
        # If the extracted value contains a platform synonym (e.g. "ios")
        if any(syn in norm_val for syn in synonyms):
            # check if the platform key (e.g. "mobile") is in the source text
            if key in norm_source:
                return True

    # If none of the safety/grounding checks matched, reject the value as ungrounded/hallucinated
    return False


def _build_phase1_prompt(text: str) -> str:
    return (
        "You are an expert information extraction engine specializing in software project requirements.\n"
        "Your task is to extract structured data from user input based on the principle of **Grounded Inference**.\n\n"
        "**Grounded Inference Rules:**\n"
        "- Do not invent features, business logic, or requirements.\n"
        "- Use only information explicitly stated or clearly implied by the text.\n"
        "- If information is missing, return null or [].\n"
        "- Prefer grounded inference over omission when the implication is obvious.\n\n"
        "**Example Behavior:**\n"
        "Input:\n"
        "\"I want a mobile app for students to study online\"\n\n"
        "Valid extraction:\n"
        "{\n"
        '  "project_purpose": "help students study online",\n'
        '  "target_audience": ["students"],\n'
        '  "platforms": ["mobile"]\n'
        "}\n\n"
        "Invalid extraction:\n"
        "{\n"
        '  "features": ["AI tutor", "gamification"]\n'
        "}\n\n"
        "**Output Schema (JSON ONLY):**\n"
        "{\n"
        '  "project_purpose": string | null,\n'
        '  "target_audience": string[],\n'
        '  "value_proposition": string | null,\n'
        '  "features": string[],\n'
        '  "platforms": string[],\n'
        '  "constraints": string[],\n'
        '  "integrations": string[]\n'
        "}\n\n"
        f"Input text:\n{text.strip()}\n\n"
        "JSON:"
    )


 


# --- LangChain-style lightweight wrappers for Layer1 and Layer2 ---


class ExtractionChain:
    async def run(self, text: str) -> tuple[ProjectContext, UsageMetrics]:
        return await extract_project_context_async(text)


class ReasoningChain:
    async def run(self, project_context: ProjectContext, source_text: str) -> tuple[dict, UsageMetrics]:
        # Only consider REQUIRED_FIELDS when generating clarifying questions
        missing_required: list[str] = []
        for field in REQUIRED_FIELDS:
            val = getattr(project_context, field)
            if val in (None, []):
                missing_required.append(field)

        if not missing_required:
            return ({"missing_fields": [], "questions": [], "summary_confidence": 1.0}, UsageMetrics(model_name=proxy_model, input_tokens=0, output_tokens=0, cost=0.0))

        prompt_parts = [
            "You are a helpful assistant creating clarifying questions for missing project fields.",
            "Your task is to generate realistic suggested answers based on the existing project context and original user text.",
            "Rules for suggestions:",
            "- Generate realistic suggested answers grounded in the existing project context and user's intent.",
            "- Do NOT generate random features or unrelated requirements.",
            "- Keep suggestions generic and high-level when the context is limited.",
            "- You MUST provide exactly 3 suggested answers for each clarifying question.",
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

        # Defensive filtering: only keep required fields in the final reasoning output.
        missing_fields = [field for field in missing_fields if field in REQUIRED_FIELDS]
        questions = [q for q in questions if q.get("field") in REQUIRED_FIELDS]

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

    try:
        # Let Pydantic handle all validation. It's more robust.
        project_context = ProjectContext.model_validate(parsed)
    except ValidationError as e:
        logger.error("LLM output failed Pydantic validation: %s\nData: %s", e, parsed)
        raise HTTPException(
            status_code=400, detail="Invalid structured output from LLM after parsing."
        )

    # Post-validation filtering using the lightweight is_grounded helper.
    project_context.project_purpose = (
        project_context.project_purpose
        if project_context.project_purpose
        and is_grounded(project_context.project_purpose, text)
        else None
    )
    project_context.value_proposition = (
        project_context.value_proposition
        if project_context.value_proposition
        and is_grounded(project_context.value_proposition, text)
        else None
    )

    project_context.target_audience = [
        item for item in project_context.target_audience if is_grounded(item, text)
    ]
    project_context.features = [
        item for item in project_context.features if is_grounded(item, text)
    ]
    project_context.platforms = [
        item for item in project_context.platforms if is_grounded(item, text)
    ]
    project_context.constraints = [
        item for item in project_context.constraints if is_grounded(item, text)
    ]
    project_context.integrations = [
        item for item in project_context.integrations if is_grounded(item, text)
    ]

    return project_context, usage


async def extract_project_context_node(state: dict):
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
        project_context, _usage = await extract_project_context_async(text)
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
