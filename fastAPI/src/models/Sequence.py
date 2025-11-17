from pydantic import BaseModel
from typing import Optional, List
from models.prd import SystemPRD
from models.usage import UsageMetrics

class Feature(BaseModel):
    name: str  # varchar
    acceptance_criteria: Optional[str] = None  # longtext
    user_flows: Optional[str] = None  # varchar
    metrics: Optional[str] = None  # longtext
    description: Optional[str] = None  # longtext

class FeatureSequence(BaseModel):
    sequence: str
    usage: Optional[UsageMetrics] = None

class SequenceRequest(BaseModel):
    prd: SystemPRD
    feature: Feature

class EditSequenceRequest(BaseModel):
    FeatureSequence: str
    engineer_notes: str
