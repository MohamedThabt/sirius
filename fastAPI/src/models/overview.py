from pydantic import BaseModel, Field
from typing import List, Optional
from models.usage import UsageMetrics


class RequirementsRequest(BaseModel):
    project_description: str = Field(
        ...,
        min_length=10,
        description="A brief description of the project"
    )

class SystemOverview(BaseModel):
    Overview: str
    usage: Optional[UsageMetrics] = None

class EditOverviewRequest(BaseModel):
    system_overview: str
    engineer_notes: str