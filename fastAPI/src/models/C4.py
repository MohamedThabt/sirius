from pydantic import BaseModel, Field
from typing import List, Optional
from models.overview import SystemOverview
from models.prd import SystemPRD
from models.usage import UsageMetrics

class C4Request(BaseModel):
    SystemPRD: SystemPRD
        
class SystemC4(BaseModel):
      C4: str
      usage: Optional[UsageMetrics] = None
      
class EditC4Request(BaseModel):
    SystemC4: str
    engineer_notes: str
