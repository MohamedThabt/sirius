from pydantic import BaseModel
from typing import List , Optional
from models.usage import UsageMetrics


# ============================================================
# Module-Based Feature Generation Models (New Flow)
# ============================================================

class ModuleContext(BaseModel):
    """Module context information for feature generation"""
    name: str
    description: str
    metrics: Optional[str] = None
    erd: Optional[str] = None


class ExistingFeature(BaseModel):
    """Existing feature info for context"""
    name: str
    description: Optional[str] = None
    order_of_implementation: int


class FeatureItem(BaseModel):
    """A single feature suggestion"""
    name: str
    description: str


class FeatureGenerationRequest(BaseModel):
    """Request model for generating feature suggestions for a module"""
    module_context: ModuleContext
    existing_features: List[ExistingFeature] = []


class FeatureAnalysisChain(BaseModel):
    """Chain of Thought reasoning output from feature generation"""
    erd_analysis: str
    identified_user_needs: List[str]
    feature_grouping_logic: str


class FeatureSuggestionList(BaseModel):
    """Response model containing feature suggestions"""
    analysis_chain: FeatureAnalysisChain
    features: List[FeatureItem]
    usage: Optional[UsageMetrics] = None


class FeatureRegenerationRequest(BaseModel):
    """Request model for regenerating features with user feedback"""
    module_context: ModuleContext
    previous_features: List[FeatureItem]
    user_notes: str
    existing_features: List[ExistingFeature] = []


class RegenerateFeatureAnalysisChain(BaseModel):
    """Chain of Thought reasoning for feature regeneration"""
    feedback_analysis: str
    erd_analysis: str
    identified_user_needs: List[str]
    feature_grouping_logic: str


class RegeneratedFeatureList(BaseModel):
    """Response model for regenerated features"""
    analysis_chain: RegenerateFeatureAnalysisChain
    features: List[FeatureItem]
    usage: Optional[UsageMetrics] = None


class FeatureBasicInfo(BaseModel):
    """Basic feature info for enrichment"""
    name: str
    description: str


class FeatureDetailsRequest(BaseModel):
    """Request model for enriching feature details"""
    module_context: ModuleContext
    features: List[FeatureBasicInfo]
    existing_features: List[ExistingFeature] = []


class DetailsAnalysisChain(BaseModel):
    """Chain of Thought reasoning for feature details"""
    dependency_analysis: str
    implementation_order_rationale: str
    acceptance_criteria_approach: str


class EnrichedFeature(BaseModel):
    """A feature enriched with detailed information"""
    name: str
    summary: str
    description: str
    acceptance_criteria: str
    user_flows: Optional[str] = None
    metrics: Optional[str] = None
    priority: str
    order_of_implementation: int
    datamodel: Optional[str] = None  # Mermaid ERD subset for features requiring DB entities


class FeatureDetailsResponse(BaseModel):
    """Response model containing enriched features"""
    analysis_chain: DetailsAnalysisChain
    features: List[EnrichedFeature]
    usage: Optional[UsageMetrics] = None


class SingleFeatureRequest(BaseModel):
    """Request model for generating a single feature with context"""
    module_context: ModuleContext
    new_feature_name: str
    new_feature_description: str
    existing_features: List[ExistingFeature] = []


class SingleFeatureAnalysisChain(BaseModel):
    """Chain of Thought reasoning for single feature generation"""
    erd_context_analysis: str
    existing_features_analysis: str
    dependency_identification: str
    implementation_position_rationale: str


class SingleFeatureResponse(BaseModel):
    """Response model for single enriched feature"""
    analysis_chain: SingleFeatureAnalysisChain
    feature: EnrichedFeature
    usage: Optional[UsageMetrics] = None


# ============================================================
# Legacy Models (For Flow Diagram and Other Controllers)
# ============================================================

class FeatureList(BaseModel):
    """Legacy model for feature list used in flow diagrams"""
    features: List[FeatureItem]
