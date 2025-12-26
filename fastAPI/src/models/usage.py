"""
Usage metrics model for tracking API token usage.
Cost calculation disabled for now - will be added later.
"""

from pydantic import BaseModel, Field


class UsageMetrics(BaseModel):
    """Track token usage and cost (cost disabled for now)"""
    model_name: str = Field(..., description="Name of the model used")
    input_tokens: int = Field(..., description="Number of input tokens")
    output_tokens: int = Field(..., description="Number of output tokens")
    cost: float = Field(default=0.0, description="Cost in USD (disabled for now)")
