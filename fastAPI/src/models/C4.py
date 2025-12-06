from pydantic import BaseModel, Field
from typing import List, Optional
from models.overview import SystemOverview
from models.prd import SystemPRD
from models.usage import UsageMetrics


class TechnicalIntake(BaseModel):
    """Technical intake information for the project"""
    platform_targets: Optional[str] = None
    frontend_tech: Optional[str] = None
    backend_tech: Optional[str] = None
    database_tech: Optional[str] = None
    ai_usage: Optional[str] = None
    external_services: Optional[str] = None


class ModuleBasicInfo(BaseModel):
    """Basic module information for architectural context"""
    name: str
    description: str


class C4Request(BaseModel):
    """Request model for C4 diagram generation using project overview and technical context"""
    project_overview: str
    technical_intake: Optional[TechnicalIntake] = None
    modules: Optional[List[ModuleBasicInfo]] = None
        
class SystemC4(BaseModel):
      C4: str
      usage: Optional[UsageMetrics] = None
      
class EditC4Request(BaseModel):
    SystemC4: str
    engineer_notes: str
