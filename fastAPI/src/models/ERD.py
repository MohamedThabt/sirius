from pydantic import BaseModel
from typing import List, Optional
from models.usage import UsageMetrics


# ============================================================
# Module ERD Models
# ============================================================

class ExistingModuleContext(BaseModel):
    """Basic info about existing modules for cross-reference"""
    name: str
    description: str


class ModuleERDRequest(BaseModel):
    """Request model for generating module ERD"""
    project_overview: str
    module_name: str
    module_description: str
    module_metrics: Optional[str] = None
    existing_modules: List[ExistingModuleContext] = []


class ModuleERD(BaseModel):
    """Response model for module ERD"""
    ERD: str
    usage: Optional[UsageMetrics] = None


class EditModuleERDRequest(BaseModel):
    """Request model for editing module ERD with AI"""
    ModuleERD: str
    engineer_notes: str


class SyncModuleERDRequest(BaseModel):
    """Request model for syncing module ERD from feature ERDs"""
    current_module_erd: str  # Existing module ERD (empty if first time)
    feature_erds: List[str]  # Array of feature ERDs to merge
    module_name: str
    module_description: str


# ============================================================
# Project ERD Models (Merge Module ERDs)
# ============================================================

class ModuleERDContext(BaseModel):
    """Context for a module's ERD in project-level merge"""
    module_name: str
    module_description: str
    erd_content: str


class MergeProjectERDRequest(BaseModel):
    """Request model for merging module ERDs into project ERD"""
    project_name: str
    project_overview: str
    module_erds: List[ModuleERDContext]


class ProjectERD(BaseModel):
    """Response model for project-level ERD"""
    ERD: str
    usage: Optional[UsageMetrics] = None
