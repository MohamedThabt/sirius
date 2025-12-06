from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Union, Any
from models.usage import UsageMetrics

class OverviewRequest(BaseModel):
    overview: str = Field(..., min_length=10, description="System overview document")
    author: str = Field(..., description="Author of the PRD")
    date: str = Field(..., description="Date of PRD creation")
    version: str = Field(..., description="PRD version")
    project_name: str = Field(..., description="Project name")

class SystemPRD(BaseModel):
    PRD: str
    usage: Optional[UsageMetrics] = None

class EditPRDRequest(BaseModel):
    system_PRD: str
    engineer_notes: str
    
class Feature(BaseModel):
    name: str
    description: str
       
class PRDWithFlowRequest(BaseModel):
    overview: str
    project_name: str
    author: str
    date: str
    version: str
    features: Union[List[Feature], Any]
    
    @field_validator('features', mode='before')
    @classmethod
    def validate_features(cls, v):
        """Handle both direct list and nested object formats"""
        # If it's a dict with 'features' key (nested format from client)
        if isinstance(v, dict) and 'features' in v:
            return v['features']
        # If it's already a list, return as is
        return v

class PRDWithFlowResponse(BaseModel):
    combined_file: str
    usage: Optional[UsageMetrics] = None