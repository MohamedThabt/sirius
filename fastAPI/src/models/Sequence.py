from pydantic import BaseModel
from typing import Optional
from models.usage import UsageMetrics

class Feature(BaseModel):
    name: str
    description: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    user_flows: Optional[str] = None
    metrics: Optional[str] = None
    datamodel: Optional[str] = None  # Feature-specific ERD subset

class Module(BaseModel):
    name: str
    description: Optional[str] = None
    erd: Optional[str] = None  # Module-level ERD

class FeatureSequence(BaseModel):
    sequence: str
    usage: Optional[UsageMetrics] = None

class SequenceRequest(BaseModel):
    module: Module  # Changed from prd to module
    feature: Feature

class EditSequenceRequest(BaseModel):
    FeatureSequence: str
    engineer_notes: str
