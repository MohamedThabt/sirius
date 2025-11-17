from pydantic import BaseModel
from typing import List , Optional
from models.usage import UsageMetrics

class Feature(BaseModel):
    name: str  # Short clear title
    description: str  # 1–2 sentence summary
    usage: Optional[UsageMetrics] = None

class FeatureList(BaseModel):
    features: List[Feature]
    usage: Optional[UsageMetrics] = None
    

class DetailedFeatureRequest(BaseModel):
    """Request model for generating detailed features"""
    features: List[Feature]
    overview: str 
    
class SingleDetailedFeatureRequest(BaseModel):
    """Request model for generating  single detailed features"""
    feature:Feature
    prd: str
    
class DetailedFeature(BaseModel):
    name: str  # varchar
    summary: Optional[str] = None  # varchar
    priority: Optional[str] = None  # varchar (e.g. High, Medium, Low)
    acceptance_criteria: Optional[str] = None  # longtext
    order_of_implementation: Optional[int] = None  # integer
    user_flows: Optional[str] = None  # varchar
    metrics: Optional[str] = None  # longtext
    description: Optional[str] = None  # longtext

class DetailedFeatureList(BaseModel):
    features: List[DetailedFeature]
    usage: Optional[UsageMetrics] = None
    
class DetailedSingleFeature(BaseModel):
    feature: DetailedFeature
    usage: Optional[UsageMetrics] = None