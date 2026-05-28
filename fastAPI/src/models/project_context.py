from pydantic import BaseModel, Field
from typing import List, Optional

from models.usage import UsageMetrics


class ProjectContext(BaseModel):
    project_purpose: Optional[str] = None
    target_audience: List[str] = Field(default_factory=list)
    value_proposition: Optional[str] = None
    features: List[str] = Field(default_factory=list)

    # Optional enrichment
    platforms: List[str] = Field(default_factory=list)
    constraints: List[str] = Field(default_factory=list)
    integrations: List[str] = Field(default_factory=list)


class ProjectContextAnalysis(BaseModel):
    missing_info: List[str] = Field(default_factory=list)
    clarifying_questions: List[str] = Field(default_factory=list)
    confidence: float = 0.0


class ProjectContextExtractionResponse(BaseModel):
    project_context: ProjectContext
    analysis: ProjectContextAnalysis
    usage: Optional[UsageMetrics] = None


class QuestionItem(BaseModel):
    field: str
    question: str
    suggested_answers: List[str]


class AiQuestions(BaseModel):
    missing_fields: List[str]
    questions: List[QuestionItem]
    summary_confidence: float


class ProjectContextFullResponse(BaseModel):
    project_context: ProjectContext
    ai_questions: AiQuestions
    usage: Optional[UsageMetrics] = None


class ProjectContextRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Input text to extract project context from")
