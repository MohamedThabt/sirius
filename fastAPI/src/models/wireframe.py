from pydantic import BaseModel
from typing import Optional
from models.usage import UsageMetrics


class Feature(BaseModel):
    name: str  # varchar
    acceptance_criteria: Optional[str] = None  # longtext
    user_flows: Optional[str] = None  # varchar
    metrics: Optional[str] = None  # longtext
    description: Optional[str] = None  # longtext


class FeatureERD(BaseModel):
    """ERD data for wireframe generation"""
    ERD: str


class FeatureWireframe(BaseModel):
    wireframe: str
    usage: Optional[UsageMetrics] = None


class WireframeRequest(BaseModel):
    erd: FeatureERD
    feature: Feature


class EditWireframeRequest(BaseModel):
    FeatureWireframe: str
    engineer_notes: str
