"""Services package for FastAPI application"""
from services.fallback_service import FallbackService
from services.module_fallback_factory import ModuleFallbackFactory

__all__ = [
    "FallbackService",
    "ModuleFallbackFactory",
]
