"""Modules Models - Pydantic models for DDD System Modules generation (Stage S2)"""
from pydantic import BaseModel
from typing import List, Optional
from models.usage import UsageMetrics


class AnalysisChain(BaseModel):
    """Chain of Thought reasoning output from AI analysis"""
    identified_personas: List[str]
    user_journey_summary: str
    grouping_logic: str


class ModuleItem(BaseModel):
    """A single module/bounded context in the DDD approach"""
    name: str
    description: str


class ModuleList(BaseModel):
    """Response model containing analysis chain and generated modules"""
    analysis_chain: AnalysisChain
    modules: List[ModuleItem]
    usage: Optional[UsageMetrics] = None


class ModuleGenerationRequest(BaseModel):
    """Request model for generating system modules"""
    project_description: str
