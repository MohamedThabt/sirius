"""Modules Models - Pydantic models for DDD System Modules generation (Stage S2)"""
from pydantic import BaseModel
from typing import List, Optional
from models.usage import UsageMetrics


class AnalysisChain(BaseModel):
    """Chain of Thought reasoning output from AI analysis"""
    identified_personas: List[str]
    user_journey_summary: str
    grouping_logic: str


class RegenerateAnalysisChain(BaseModel):
    """Chain of Thought reasoning output from AI regeneration analysis"""
    feedback_analysis: str
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


class RegeneratedModuleList(BaseModel):
    """Response model containing regenerated modules with feedback analysis"""
    analysis_chain: RegenerateAnalysisChain
    modules: List[ModuleItem]
    usage: Optional[UsageMetrics] = None


class ModuleGenerationRequest(BaseModel):
    """Request model for generating system modules"""
    project_description: str


class ModuleRegenerationRequest(BaseModel):
    """Request model for regenerating system modules with user feedback"""
    project_description: str
    previous_modules: List[ModuleItem]
    user_notes: str


# ============================================================
# Module Details Generation Models (Stage S2.5)
# ============================================================

class TechnicalIntake(BaseModel):
    """Technical intake information for the project"""
    platform_targets: Optional[str] = None
    frontend_tech: Optional[str] = None
    backend_tech: Optional[str] = None
    database_tech: Optional[str] = None
    ai_usage: Optional[str] = None
    external_services: Optional[str] = None


class ModuleBasicInfo(BaseModel):
    """Basic module info for details generation request"""
    name: str
    description: str
    metrics: Optional[str] = None


class ModuleDetailsRequest(BaseModel):
    """Request model for generating detailed module information"""
    project_description: str
    modules: List[ModuleBasicInfo]
    technical_intake: Optional[TechnicalIntake] = None


class DetailsAnalysisChain(BaseModel):
    """Chain of Thought reasoning output from module details analysis"""
    dependency_analysis: str
    implementation_order_rationale: str
    metrics_approach: str


class EnrichedModule(BaseModel):
    """A module enriched with detailed information"""
    name: str
    description: str
    metrics: str
    order_of_implementation: int


class ModuleDetailsResponse(BaseModel):
    """Response model containing enriched modules with details"""
    analysis_chain: DetailsAnalysisChain
    modules: List[EnrichedModule]
    usage: Optional[UsageMetrics] = None


# ============================================================
# Single Module Generation Models (Stage S2.6)
# ============================================================

class ExistingModuleInfo(BaseModel):
    """Basic info about existing modules for context"""
    name: str
    description: str
    order_of_implementation: int


class SingleModuleRequest(BaseModel):
    """Request model for generating a single module with context"""
    project_description: str
    new_module_name: str
    new_module_description: str
    existing_modules: List[ExistingModuleInfo] = []


class SingleModuleAnalysisChain(BaseModel):
    """Chain of Thought reasoning for single module generation"""
    context_analysis: str
    integration_points: str
    metrics_rationale: str
    order_rationale: str


class SingleModuleResponse(BaseModel):
    """Response model for single module generation"""
    analysis_chain: SingleModuleAnalysisChain
    module: EnrichedModule
    usage: Optional[UsageMetrics] = None
