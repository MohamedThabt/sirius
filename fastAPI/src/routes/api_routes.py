"""
Consolidated Routes Module
All API routes are centralized here for better organization and maintainability.
"""

from fastapi import APIRouter

# Import all controller functions directly
from controllers.overview_controller import generate_system_overview as ov_generate, edit_system_overview as ov_edit
from controllers.features_controller import generate_features, generate_detailed_features, generate_single_feature_details
from controllers.brd_controller import generate_brd, edit_brd
from controllers.prd_controller import generate_prd_with_flow, edit_prd
from controllers.erd_controller import generate_feature_erd, edit_feature_erd, merge_feature_erds
from controllers.wireframe_controller import generate_feature_wireframe, edit_feature_wireframe
from controllers.sequence_controller import generate_feature_sequence, edit_feature_sequence
from controllers.c4_controller import generate_c4, edit_c4
from controllers.flow_diagram_controller import generate_flow

# Import all models
from models.overview import RequirementsRequest, SystemOverview, EditOverviewRequest
from models.features import FeatureList, DetailedFeatureList, DetailedFeatureRequest, Feature,DetailedFeature,SingleDetailedFeatureRequest,DetailedSingleFeature
from models.BRD import BRDRequest, SystemBRD, EditBRDRequest
from models.prd import SystemPRD, EditPRDRequest, PRDWithFlowRequest, PRDWithFlowResponse
from models.ERD import ERDrequest, FeatureERD, EditERDRequest, MergeERDRequest, ProjectERD
from models.wireframe import WireframeRequest, FeatureWireframe, EditWireframeRequest
from models.Sequence import SequenceRequest, FeatureSequence, EditSequenceRequest
from models.C4 import C4Request, SystemC4, EditC4Request

from utils.logger import get_logger

logger = get_logger(__name__)

# Create main API router
router = APIRouter()

# ============================================================================
# OVERVIEW ROUTES (v1/Overview)
# ============================================================================

overview_router = APIRouter(prefix="/v1/Overview", tags=["Overview"])


@overview_router.post("/generate", response_model=SystemOverview)
async def generate_system_overview_endpoint(request: RequirementsRequest):
    """Generate system overview from project description"""
    raw_response, usage = await ov_generate(request)
    return SystemOverview(Overview=raw_response, usage=usage)


@overview_router.post("/edit", response_model=SystemOverview)
async def edit_system_overview_endpoint(request: EditOverviewRequest):
    """Edit existing system overview"""
    revised_response, usage = await ov_edit(request)
    return SystemOverview(Overview=revised_response, usage=usage)


# ============================================================================
# FEATURES ROUTES (v1/features)
# ============================================================================

features_router = APIRouter(prefix="/v1/features", tags=["Features"])


@features_router.post("/suggestion/generate", response_model=FeatureList)
async def generate_features_endpoint(request: RequirementsRequest):
    """Generate initial feature suggestions from project description"""
    result, usage = await generate_features(request)
    result.usage = usage
    return result


@features_router.post("/detailed/generate", response_model=DetailedFeatureList)
async def generate_detailed_features_endpoint(request: DetailedFeatureRequest):
    """Generate detailed information for each feature"""
    result, usage = await generate_detailed_features(request)
    result.usage = usage
    return result

@features_router.post("/detailedSingle/generate", response_model=DetailedSingleFeature)
async def generate_single_detailed_feature_endpoint(request:SingleDetailedFeatureRequest):
    """
    Generate detailed info for a single feature with PRD context.
    """
    result, usage = await generate_single_feature_details(request)
    result.usage = usage
    return result
    


# ============================================================================
# BRD ROUTES (v1/BRD)
# ============================================================================

brd_router = APIRouter(prefix="/v1/BRD", tags=["BRD"])


@brd_router.post("/generate", response_model=SystemBRD)
async def generate_brd_endpoint(request: BRDRequest):
    """Generate Business Requirements Document from overview"""
    raw, usage = await generate_brd(request)
    return SystemBRD(BRD=raw, usage=usage)


@brd_router.post("/edit", response_model=SystemBRD)
async def edit_brd_endpoint(request: EditBRDRequest):
    """Edit existing BRD based on engineer notes"""
    revised_brd, usage = await edit_brd(request)
    return SystemBRD(BRD=revised_brd, usage=usage)


# ============================================================================
# PRD ROUTES (v1/PRD)
# ============================================================================

prd_router = APIRouter(prefix="/v1/PRD", tags=["PRD"])


@prd_router.post("/generate", response_model=PRDWithFlowResponse)
async def generate_prd_with_flow_endpoint(request: PRDWithFlowRequest):
    """Generate combined PRD and Flow diagram"""
    result, usage = await generate_prd_with_flow(request)
    return PRDWithFlowResponse(combined_file=result["combined_file"], usage=usage)


@prd_router.post("/edit", response_model=SystemPRD)
async def edit_prd_endpoint(request: EditPRDRequest):
    """Edit existing PRD based on engineer notes"""
    cleaned, usage = await edit_prd(request)
    return SystemPRD(PRD=cleaned, usage=usage)


# ============================================================================
# ERD ROUTES (v1/ERD)
# ============================================================================

erd_router = APIRouter(prefix="/v1/ERD", tags=["ERD"])


@erd_router.post("/generate", response_model=FeatureERD)
async def generate_feature_erd_endpoint(request: ERDrequest):
    """Generate ERD for a specific feature"""
    clean_mermaid, usage = await generate_feature_erd(request)
    return FeatureERD(ERD=clean_mermaid, usage=usage)


@erd_router.post("/edit", response_model=FeatureERD)
async def edit_feature_erd_endpoint(request: EditERDRequest):
    """Edit existing ERD based on engineer notes"""
    clean_mermaid, usage = await edit_feature_erd(request)
    return FeatureERD(ERD=clean_mermaid, usage=usage)


@erd_router.post("/merge", response_model=ProjectERD)
async def merge_feature_erds_endpoint(request: MergeERDRequest):
    """Merge multiple feature ERDs into a project ERD"""
    clean_mermaid, usage = await merge_feature_erds(request)
    return ProjectERD(ERD=clean_mermaid, usage=usage)


# ============================================================================
# WIREFRAME ROUTES (v1/wireframe)
# ============================================================================

wireframe_router = APIRouter(prefix="/v1/wireframe", tags=["Wireframe"])


@wireframe_router.post("/generate", response_model=FeatureWireframe)
async def generate_feature_wireframe_endpoint(request: WireframeRequest):
    """Generate wireframe for a specific feature"""
    clean_json, usage = await generate_feature_wireframe(request)
    return FeatureWireframe(wireframe=clean_json, usage=usage)


@wireframe_router.post("/edit", response_model=FeatureWireframe)
async def edit_feature_wireframe_endpoint(request: EditWireframeRequest):
    """Edit existing wireframe based on engineer notes"""
    clean_json, usage = await edit_feature_wireframe(request)
    return FeatureWireframe(wireframe=clean_json, usage=usage)


# ============================================================================
# SEQUENCE DIAGRAM ROUTES (v1/Sequence)
# ============================================================================

sequence_router = APIRouter(prefix="/v1/Sequence", tags=["Sequence"])


@sequence_router.post("/generate", response_model=FeatureSequence)
async def generate_feature_sequence_endpoint(request: SequenceRequest):
    """Generate sequence diagram for a specific feature"""
    clean_mermaid, usage = await generate_feature_sequence(request)
    return FeatureSequence(sequence=clean_mermaid, usage=usage)


@sequence_router.post("/edit", response_model=FeatureSequence)
async def edit_feature_sequence_endpoint(request: EditSequenceRequest):
    """Edit existing sequence diagram based on engineer notes"""
    clean_mermaid, usage = await edit_feature_sequence(request)
    return FeatureSequence(sequence=clean_mermaid, usage=usage)


# ============================================================================
# C4 MODEL ROUTES (v1/C4)
# ============================================================================

c4_router = APIRouter(prefix="/v1/C4", tags=["C4"])


@c4_router.post("/generate", response_model=SystemC4)
async def generate_c4_endpoint(request: C4Request):
    """Generate C4 diagram from PRD"""
    c4_json, usage = await generate_c4(request)
    return SystemC4(C4=c4_json, usage=usage)


@c4_router.post("/edit", response_model=SystemC4)
async def edit_c4_endpoint(request: EditC4Request):
    """Edit existing C4 diagram"""
    c4_json, usage = await edit_c4(request)
    return SystemC4(C4=c4_json, usage=usage)


# ============================================================================
# FLOW DIAGRAM ROUTES (v1/flow)
# ============================================================================

flow_router = APIRouter(prefix="/v1/flow", tags=["Flow"])


@flow_router.post("/generate-flow")
async def generate_flow_endpoint(request: FeatureList):
    """Generate flow diagram from features"""
    clean, usage = await generate_flow(request)
    return {"mermaid_code": clean, "usage": usage}


# ============================================================================
# ROUTER AGGREGATION
# ============================================================================
# Include all sub-routers into the main router
router.include_router(overview_router)
router.include_router(features_router)
router.include_router(brd_router)
router.include_router(prd_router)
router.include_router(erd_router)
router.include_router(wireframe_router)
router.include_router(sequence_router)
router.include_router(c4_router)
router.include_router(flow_router)
