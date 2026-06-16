from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any


class IntakeChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User input message")
    thread_id: int = Field(1, ge=1, description="Conversation thread identifier")


class IntakeChatResponse(BaseModel):
    thread_id: int = Field(..., description="Conversation thread identifier")
    is_complete: bool = Field(..., description="True if all fields are collected and summary is generated")
    intent: str = Field(..., description="Detected user intent: user_answer, user_question")
    project_context: Dict[str, Optional[str]] = Field(..., description="Current extracted project context fields")
    missing_fields: List[str] = Field(..., description="List of missing project context fields")
    #intent: str = Field(..., description="Detected user intent: user_answer, user_question")
    #intent_confidence: Optional[float] = Field(None, description="Classification confidence for the detected intent")
    response: Any = Field(..., description="Assistant response — string for text, dict for structured question data")
    guardrails_result: Dict[str, Any] = Field(..., description="Results of the guardrails check")
    
