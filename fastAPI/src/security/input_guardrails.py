"""Input guardrails for chat endpoints.

This module applies pre-LLM checks to reduce unsafe or irrelevant requests.
"""

from dataclasses import dataclass
import re
from typing import Optional


_PROMPT_INJECTION_PATTERNS = [
    re.compile(r"\bignore\s+(all\s+)?(previous|prior|above)\s+instructions?\b", re.IGNORECASE),
    re.compile(r"\bdisregard\s+(the\s+)?(system|developer|previous)\s+instructions?\b", re.IGNORECASE),
    re.compile(r"\breveal\s+(the\s+)?(system|developer)\s+prompt\b", re.IGNORECASE),
    re.compile(r"\b(give|show|share|send|provide|tell)\s+(me\s+)?(your\s+)?prompt\b", re.IGNORECASE),
    re.compile(r"\bwhat\s+is\s+(your\s+)?prompt\b", re.IGNORECASE),
    re.compile(r"\bshow\s+(me\s+)?(your\s+)?(hidden|internal)\s+instructions?\b", re.IGNORECASE),
    re.compile(r"\b(internal|hidden|private)\s+(policy|policies|rules?|guidelines|instructions?)\b", re.IGNORECASE),
    re.compile(r"\b(show|print|dump|export|display|list)\s+(the\s+)?(system|developer|internal)\s+(prompt|instructions?|rules?|policy|policies)\b", re.IGNORECASE),
    re.compile(r"\b(what|which)\s+(are\s+)?(your\s+)?(decision|routing|classification)\s+(rules?|logic|criteria)\b", re.IGNORECASE),
    re.compile(r"\b(for\s+)?(qa|audit|debug|testing)\b.{0,80}\b(show|share|reveal|print)\b.{0,80}\b(internal|hidden|system|developer)\b", re.IGNORECASE),
    re.compile(r"\b(show|reveal|provide)\s+(your\s+)?(chain[-\s]?of[-\s]?thought|reasoning trace|deliberation)\b", re.IGNORECASE),
    re.compile(r"\bjailbreak\b", re.IGNORECASE),
    re.compile(r"\bact\s+as\s+(a\s+)?(different|unrestricted)\b", re.IGNORECASE),
    re.compile(r"\bDAN\b", re.IGNORECASE),
]

# Redaction patterns for common sensitive data.
_EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
_BEARER_PATTERN = re.compile(r"\bBearer\s+[A-Za-z0-9\-._~+/]+=*", re.IGNORECASE)
_API_KEY_PATTERN = re.compile(r"\b(?:sk|pk|api|token|secret)[_-]?[A-Za-z0-9]{10,}\b", re.IGNORECASE)
_JWT_PATTERN = re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+\b")
_GENERIC_SECRET_ASSIGNMENT = re.compile(
    r"\b(password|passwd|secret|api[_-]?key|token)\s*[:=]\s*['\"]?[^\s'\"]+['\"]?",
    re.IGNORECASE,
)

_OUT_OF_SCOPE_KEYWORDS = {
    "joke",
    "recipe",
    "football",
    "soccer",
    "movie",
    "horoscope",
    "weather",
    "celebrity",
    "bitcoin price",
    "stock price",
    "song",
    "poem",
}

_PROJECT_CONTEXT_KEYWORDS = {
    "project",
    "overview",
    "brief",
    "brd",
    "requirement",
    "feature",
    "scope",
    "module",
    "system",
    "architecture",
    "business",
    "roadmap",
    "edit",
    "update",
    "analysis",
    "workflow",
}


@dataclass
class InputGuardrailResult:
    allow: bool
    sanitized_message: str
    safe_response: Optional[str] = None
    intent_override: Optional[str] = None
    reason: Optional[str] = None


def _contains_prompt_injection(text: str) -> bool:
    return any(pattern.search(text) for pattern in _PROMPT_INJECTION_PATTERNS)


def _is_out_of_scope(text: str) -> bool:
    lowered = text.lower()
    has_oos_keyword = any(keyword in lowered for keyword in _OUT_OF_SCOPE_KEYWORDS)
    has_project_keyword = any(keyword in lowered for keyword in _PROJECT_CONTEXT_KEYWORDS)
    return has_oos_keyword and not has_project_keyword


def redact_sensitive_text(text: Optional[str]) -> Optional[str]:
    if text is None:
        return None

    redacted = text
    redacted = _EMAIL_PATTERN.sub("[REDACTED_EMAIL]", redacted)
    redacted = _BEARER_PATTERN.sub("Bearer [REDACTED_TOKEN]", redacted)
    redacted = _JWT_PATTERN.sub("[REDACTED_JWT]", redacted)
    redacted = _API_KEY_PATTERN.sub("[REDACTED_KEY]", redacted)
    redacted = _GENERIC_SECRET_ASSIGNMENT.sub(r"\1=[REDACTED_SECRET]", redacted)
    return redacted


def evaluate_input_guardrails(
    user_message: str,
) -> InputGuardrailResult:
    raw_message = (user_message or "").strip()

    if not raw_message:
        return InputGuardrailResult(
            allow=False,
            sanitized_message="",
            safe_response="Please provide a non-empty project-related message.",
            intent_override="out_of_scope",
            reason="empty_message",
        )

    if _contains_prompt_injection(raw_message):
        return InputGuardrailResult(
            allow=False,
            sanitized_message="",
            safe_response=(
                "I cannot follow requests that override system instructions. "
                "Please ask a project-related question or request overview improvements."
            ),
            intent_override="out_of_scope",
            reason="prompt_injection_detected",
        )

    if _is_out_of_scope(raw_message):
        return InputGuardrailResult(
            allow=False,
            sanitized_message="",
            safe_response=(
                "That looks outside this assistant's project-analysis scope. "
                "Please ask about project overview, scope, requirements, or feature planning."
            ),
            intent_override="out_of_scope",
            reason="out_of_scope_detected",
        )

    sanitized_message = redact_sensitive_text(raw_message) or ""

    if not sanitized_message.strip():
        return InputGuardrailResult(
            allow=False,
            sanitized_message="",
            safe_response="I could not process the message safely. Please rephrase without secrets.",
            intent_override="out_of_scope",
            reason="empty_after_redaction",
        )

    return InputGuardrailResult(
        allow=True,
        sanitized_message=sanitized_message,
        reason="allowed",
    )
