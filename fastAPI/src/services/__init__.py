"""Services package for FastAPI application"""
from .fallback_service import FallbackService
from .module_fallback_factory import ModuleFallbackFactory

__all__ = [
    "FallbackService",
    "ModuleFallbackFactory",
]
