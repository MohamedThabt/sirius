from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User input message")
    thread_id: int = Field(1, ge=1, description="Conversation thread identifier")
    project_overview: Optional[str] = Field(None, description="Project system overview for chatbot context")
    project_brief: Optional[str] = Field(None, description="Project BRD/brief for chatbot context")


class ChatResponse(BaseModel):
    response: str
    thread_id: int
