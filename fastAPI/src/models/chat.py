from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User input message")
    thread_id: int = Field(1, ge=1, description="Conversation thread identifier")
    mode: Optional[str] = Field("agent", description="Chat mode: ask or agent")
    project_overview: Optional[str] = Field(None, description="Project system overview for chatbot context")
    project_brief: Optional[str] = Field(None, description="Project BRD/brief for chatbot context")


class ChatResponse(BaseModel):
    response: str
    thread_id: int
    intent: Optional[str] = None
    updated_project_overview: Optional[str] = None
