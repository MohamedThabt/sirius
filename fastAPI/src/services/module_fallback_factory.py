"""Module Fallback Factory - Specific fallback handling for Module generation"""
from typing import Dict, Any, Optional
from models.modules import ModuleList, AnalysisChain, ModuleItem
from services.fallback_service import FallbackService
import logging

logger = logging.getLogger(__name__)


class ModuleFallbackFactory:
    """Factory for creating fallback ModuleList instances"""
    
    @staticmethod
    def create_default_analysis_chain() -> AnalysisChain:
        """Create a default AnalysisChain for fallback scenarios"""
        return AnalysisChain(
            identified_personas=["Unable to identify personas"],
            user_journey_summary="Unable to generate user journey summary",
            grouping_logic="Unable to determine grouping logic"
        )

    @staticmethod
    def create_default_module() -> ModuleItem:
        """Create a default module for fallback scenarios"""
        return ModuleItem(
            name="Core System",
            description="AI was unable to generate modules. Please try again or refine your project description."
        )

    @staticmethod
    def create_fallback(raw_data: Optional[Dict[str, Any]] = None, error_msg: str = "") -> ModuleList:
        """
        Create a fallback ModuleList when parsing fails.
        Attempts to salvage partial data from raw_data.
        
        Args:
            raw_data: The partially parsed data (may contain some valid fields)
            error_msg: The error message for logging
            
        Returns:
            ModuleList: A valid ModuleList instance with fallback/salvaged data
        """
        logger.warning(f"Creating fallback ModuleList. Reason: {error_msg}")
        
        if raw_data is None:
            return ModuleFallbackFactory._create_empty_fallback()
        
        # Try to salvage modules
        modules = ModuleFallbackFactory._salvage_modules(raw_data)
        
        # Try to salvage analysis_chain
        analysis_chain = ModuleFallbackFactory._salvage_analysis_chain(raw_data)
        
        # If we have salvaged modules, use them
        if modules:
            return ModuleList(analysis_chain=analysis_chain, modules=modules)
        
        # Complete fallback
        return ModuleFallbackFactory._create_empty_fallback()

    @staticmethod
    def _create_empty_fallback() -> ModuleList:
        """Create a completely empty fallback response"""
        return ModuleList(
            analysis_chain=ModuleFallbackFactory.create_default_analysis_chain(),
            modules=[ModuleFallbackFactory.create_default_module()]
        )

    @staticmethod
    def _salvage_modules(raw_data: Dict[str, Any]) -> list[ModuleItem]:
        """Attempt to salvage valid modules from raw data"""
        raw_modules = FallbackService.safe_get_list(raw_data, "modules")
        
        return FallbackService.extract_items_with_required_field(
            items=raw_modules,
            required_field="name",
            item_factory=lambda m: ModuleItem(
                name=m.get("name", "Unknown Module"),
                description=m.get("description", "No description provided")
            )
        )

    @staticmethod
    def _salvage_analysis_chain(raw_data: Dict[str, Any]) -> AnalysisChain:
        """Attempt to salvage analysis_chain from raw data"""
        raw_chain = FallbackService.safe_get_dict(raw_data, "analysis_chain")
        
        if not raw_chain:
            return ModuleFallbackFactory.create_default_analysis_chain()
        
        return AnalysisChain(
            identified_personas=FallbackService.safe_get_list(
                raw_chain, "identified_personas", ["Unable to identify"]
            ),
            user_journey_summary=FallbackService.safe_get(
                raw_chain, "user_journey_summary", "Unable to generate summary"
            ),
            grouping_logic=FallbackService.safe_get(
                raw_chain, "grouping_logic", "Unable to determine grouping logic"
            )
        )
