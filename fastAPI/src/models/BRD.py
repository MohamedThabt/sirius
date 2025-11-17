from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.usage import UsageMetrics
class BRDRequest(BaseModel):
    overview: str
    project_name: Optional[str] = None

class SystemBRD(BaseModel):
    BRD: str
    usage: Optional[UsageMetrics] = None
    
class EditBRDRequest(BaseModel):
    system_BRD: str
    engineer_notes: str


