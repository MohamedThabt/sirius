"""
Consolidated Routes Module
All API routes are centralized here for better organization and maintainability.
"""

from fastapi import APIRouter, Query, Response
from typing import Optional

# Import all controller functions directly
from controllers.overview_controller import generate_system_overview as ov_generate, edit_system_overview as ov_edit
from controllers.features_controller import generate_suggestion_features_for_module, regenerate_suggestion_features, generate_feature_details, generate_single_feature
from controllers.modules_controller import generate_suggestion_modules, regenerate_suggestion_modules, generate_module_details, generate_single_module
from controllers.brd_controller import generate_brd, edit_brd
from controllers.prd_controller import generate_prd_with_flow, edit_prd, sync_prd
from controllers.erd_controller import generate_module_erd, edit_module_erd, sync_module_erd, merge_project_erd
from controllers.wireframe_controller import generate_feature_wireframe, edit_feature_wireframe
from controllers.sequence_controller import generate_feature_sequence, edit_feature_sequence
from controllers.c4_controller import generate_c4, edit_c4
from controllers.flow_diagram_controller import generate_flow
from controllers.chat_controller import generate_langgraph_chat_response
from controllers.chat_intent_controller import generate_langgraph_intent_chat_response
from controllers.health_controller import get_health_status, get_simple_health
from controllers.logs_controller import (
    get_logs,
    get_log_stats,
    clear_logs,
    download_log
)

# Import all models
from models.overview import RequirementsRequest, SystemOverview, EditOverviewRequest
from models.features import FeatureList, FeatureDetailsRequest, FeatureDetailsResponse, SingleFeatureRequest, SingleFeatureResponse, FeatureGenerationRequest, FeatureSuggestionList, FeatureRegenerationRequest, RegeneratedFeatureList
from models.modules import ModuleList, ModuleGenerationRequest, ModuleRegenerationRequest, RegeneratedModuleList, ModuleDetailsRequest, ModuleDetailsResponse, SingleModuleRequest, SingleModuleResponse
from models.BRD import BRDRequest, SystemBRD, EditBRDRequest
from models.prd import SystemPRD, EditPRDRequest, PRDWithFlowRequest, PRDWithFlowResponse
from models.ERD import ModuleERDRequest, ModuleERD, EditModuleERDRequest, SyncModuleERDRequest, MergeProjectERDRequest, ProjectERD
from models.wireframe import WireframeRequest, FeatureWireframe, EditWireframeRequest
from models.Sequence import SequenceRequest, FeatureSequence, EditSequenceRequest
from models.C4 import C4Request, SystemC4, EditC4Request
from models.chat import ChatRequest, ChatResponse
from models.logs import LogResponse, LogStatsResponse, ClearLogsResponse

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
# MODULE-BASED FEATURES ROUTES (v1/features/module)
# ============================================================================

features_router = APIRouter(prefix="/v1/features/module", tags=["Module Features"])

@features_router.post("/suggestion/generate", response_model=FeatureSuggestionList)
async def generate_module_feature_suggestions_endpoint(request: FeatureGenerationRequest):
    """Generate feature suggestions for a module based on its ERD and context"""
    result, usage = await generate_suggestion_features_for_module(request)
    result.usage = usage
    return result


@features_router.post("/suggestion/regenerate", response_model=RegeneratedFeatureList)
async def regenerate_module_feature_suggestions_endpoint(request: FeatureRegenerationRequest):
    """Regenerate feature suggestions with user feedback"""
    result, usage = await regenerate_suggestion_features(request)
    result.usage = usage
    return result


@features_router.post("/details/generate", response_model=FeatureDetailsResponse)
async def generate_module_feature_details_endpoint(request: FeatureDetailsRequest):
    """Generate detailed information for selected features (enrichment phase)"""
    result, usage = await generate_feature_details(request)
    result.usage = usage
    return result


@features_router.post("/single/generate", response_model=SingleFeatureResponse)
async def generate_single_module_feature_endpoint(request: SingleFeatureRequest):
    """Generate a single enriched feature with context"""
    result, usage = await generate_single_feature(request)
    result.usage = usage
    return result
    


# ============================================================================
# MODULES ROUTES (v1/modules) - Stage S2: DDD System Modules Generation
# ============================================================================

modules_router = APIRouter(prefix="/v1/modules", tags=["Modules"])


@modules_router.post("/suggestion/generate", response_model=ModuleList)
async def generate_suggestion_modules_endpoint(request: ModuleGenerationRequest):
    """Generate system modules using DDD approach with Chain of Thought reasoning"""
    result, usage = await generate_suggestion_modules(request)
    result.usage = usage
    return result


@modules_router.post("/suggestion/regenerate", response_model=RegeneratedModuleList)
async def regenerate_suggestion_modules_endpoint(request: ModuleRegenerationRequest):
    """Regenerate system modules based on user feedback and notes"""
    result, usage = await regenerate_suggestion_modules(request)
    result.usage = usage
    return result


@modules_router.post("/details/generate", response_model=ModuleDetailsResponse)
async def generate_module_details_endpoint(request: ModuleDetailsRequest):
    """Generate detailed module information including enhanced descriptions, metrics, and implementation order"""
    result, usage = await generate_module_details(request)
    result.usage = usage
    return result


@modules_router.post("/single/generate", response_model=SingleModuleResponse)
async def generate_single_module_endpoint(request: SingleModuleRequest):
    """Generate a single enriched module with context of existing modules in the system"""
    result, usage = await generate_single_module(request)
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


@prd_router.post("/sync", response_model=PRDWithFlowResponse)
async def sync_prd_endpoint(request: PRDWithFlowRequest, previous_prd: str):
    """Synchronize PRD with current modules and features"""
    result, usage = await sync_prd(request, previous_prd)
    return PRDWithFlowResponse(combined_file=result["combined_file"], usage=usage)


# ============================================================================
# ERD ROUTES (v1/ERD) - Module-level ERD generation
# ============================================================================

erd_router = APIRouter(prefix="/v1/ERD", tags=["ERD"])


@erd_router.post("/generate", response_model=ModuleERD)
async def generate_module_erd_endpoint(request: ModuleERDRequest):
    """Generate ERD for a module (bounded context)"""
    clean_mermaid, usage = await generate_module_erd(request)
    return ModuleERD(ERD=clean_mermaid, usage=usage)


@erd_router.post("/edit", response_model=ModuleERD)
async def edit_module_erd_endpoint(request: EditModuleERDRequest):
    """Edit existing module ERD based on engineer notes"""
    clean_mermaid, usage = await edit_module_erd(request)
    return ModuleERD(ERD=clean_mermaid, usage=usage)


@erd_router.post("/sync", response_model=ModuleERD)
async def sync_module_erd_endpoint(request: SyncModuleERDRequest):
    """Sync module ERD by merging feature ERDs"""
    clean_mermaid, usage = await sync_module_erd(request)
    return ModuleERD(ERD=clean_mermaid, usage=usage)


@erd_router.post("/merge-project", response_model=ProjectERD)
async def merge_project_erd_endpoint(request: MergeProjectERDRequest):
    """Merge all module ERDs into a unified project-level ERD"""
    clean_mermaid, usage = await merge_project_erd(request)
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
# LANGGRAPH CHAT ROUTES (v1/chat)
# ============================================================================

chat_router = APIRouter(prefix="/v1/chat", tags=["Chat"])


@chat_router.post("/generate", response_model=ChatResponse)
async def generate_chat_endpoint(request: ChatRequest):
    """Generate chat response with persisted memory using LangGraph checkpoints."""
    return await generate_langgraph_chat_response(request)


@chat_router.post("/generate-intent", response_model=ChatResponse)
async def generate_intent_chat_endpoint(request: ChatRequest):
    """Generate chat response with intent routing before chatbot execution."""
    return await generate_langgraph_intent_chat_response(request)


# ============================================================================
# HEALTH CHECK ROUTES (v1/health)
# ============================================================================

health_router = APIRouter(prefix="/v1/health", tags=["Health"])


@health_router.get("")
async def health_check_endpoint():
    """Get comprehensive health status of the FastAPI service"""
    return await get_health_status()


@health_router.get("/simple")
async def simple_health_endpoint():
    """Simple health check for load balancers"""
    return await get_simple_health()


# ============================================================================
# LOGS ROUTES (v1/logs)
# ============================================================================

logs_router = APIRouter(prefix="/v1/logs", tags=["Logs"])


@logs_router.get("", response_model=LogResponse)
async def get_logs_endpoint(
    log_type: str = Query("app", description="Log type: 'app' or 'error'"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page (max 100)"),
    level: Optional[str] = Query(None, description="Filter by log level"),
    search: Optional[str] = Query(None, description="Search query")
):
    """
    Get paginated log entries with optional filtering.
    
    - **log_type**: 'app' for all logs, 'error' for error-only logs
    - **page**: Page number (1-indexed)
    - **per_page**: Number of entries per page (1-100)
    - **level**: Filter by log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    - **search**: Search text in log messages
    """
    return await get_logs(
        log_type=log_type,
        page=page,
        per_page=per_page,
        level=level,
        search=search
    )


@logs_router.get("/stats", response_model=LogStatsResponse)
async def get_log_stats_endpoint():
    """Get comprehensive statistics for all log files."""
    return await get_log_stats()


@logs_router.delete("/clear", response_model=ClearLogsResponse)
async def clear_logs_endpoint(
    log_type: Optional[str] = Query(None, description="Log type to clear: 'app', 'error', or None for all")
):
    """
    Clear log files.
    
    - **log_type**: Specific log to clear ('app' or 'error'), or None to clear all
    """
    return await clear_logs(log_type=log_type)


@logs_router.get("/download/{log_type}")
async def download_log_endpoint(log_type: str = "app"):
    """
    Download log file.
    
    - **log_type**: Log type to download ('app' or 'error')
    """
    content, filename = await download_log(log_type)
    
    if content is None:
        return Response(
            content="Log file not found or empty",
            status_code=404,
            media_type="text/plain"
        )
    
    return Response(
        content=content,
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


# ============================================================================
# ROUTER AGGREGATION
# ============================================================================
# Include all sub-routers into the main router
router.include_router(overview_router)
router.include_router(features_router)
router.include_router(modules_router)
router.include_router(brd_router)
router.include_router(prd_router)
router.include_router(erd_router)
router.include_router(wireframe_router)
router.include_router(sequence_router)
router.include_router(c4_router)
router.include_router(flow_router)
router.include_router(chat_router)
router.include_router(health_router)
router.include_router(logs_router)
