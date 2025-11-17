from pydantic import BaseModel
from typing import List , Optional
from models.prd import SystemPRD
from models.usage import UsageMetrics
# from models.features import  DetailedFeature 
    
class Feature(BaseModel):
    name: str  # varchar
    acceptance_criteria: Optional[str] = None  # longtext
    user_flows: Optional[str] = None  # varchar
    metrics: Optional[str] = None  # longtext
    description: Optional[str] = None  # longtext
    

class FeatureERD(BaseModel):
    ERD: str
    usage: Optional[UsageMetrics] = None
    
class ERDrequest(BaseModel):
    prd: SystemPRD
    feature: Feature
    
class EditERDRequest(BaseModel):
    FeatureERD: str
    engineer_notes: str
    
# class MergeERDRequest(BaseModel):
#     features: List[Feature]
#     erds: List[FeatureERD]
    
class MergeERD(BaseModel):
    feature_name: str
    erd: str   

class MergeERDRequest(BaseModel):
    merge: list[MergeERD]
    
class ProjectERD(BaseModel):
    ERD: str
    usage: Optional[UsageMetrics] = None
