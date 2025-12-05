"""Module Fallback Factory - Specific fallback handling for Module generation"""
from typing import Dict, Any, Optional, List
from models.modules import (
    ModuleList, 
    AnalysisChain, 
    ModuleItem, 
    RegeneratedModuleList, 
    RegenerateAnalysisChain,
    ModuleDetailsResponse,
    DetailsAnalysisChain,
    EnrichedModule,
    ModuleBasicInfo
)
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

    # =========================================================================
    # Regeneration Fallbacks
    # =========================================================================

    @staticmethod
    def create_default_regenerate_analysis_chain() -> RegenerateAnalysisChain:
        """Create a default RegenerateAnalysisChain for fallback scenarios"""
        return RegenerateAnalysisChain(
            feedback_analysis="Unable to analyze feedback",
            identified_personas=["Unable to identify personas"],
            user_journey_summary="Unable to generate user journey summary",
            grouping_logic="Unable to determine grouping logic"
        )

    @staticmethod
    def create_regenerate_fallback(raw_data: Optional[Dict[str, Any]] = None, error_msg: str = "") -> RegeneratedModuleList:
        """
        Create a fallback RegeneratedModuleList when parsing fails.
        
        Args:
            raw_data: The partially parsed data (may contain some valid fields)
            error_msg: The error message for logging
            
        Returns:
            RegeneratedModuleList: A valid instance with fallback/salvaged data
        """
        logger.warning(f"Creating fallback RegeneratedModuleList. Reason: {error_msg}")
        
        if raw_data is None:
            return ModuleFallbackFactory._create_empty_regenerate_fallback()
        
        # Try to salvage modules
        modules = ModuleFallbackFactory._salvage_modules(raw_data)
        
        # Try to salvage analysis_chain
        analysis_chain = ModuleFallbackFactory._salvage_regenerate_analysis_chain(raw_data)
        
        # If we have salvaged modules, use them
        if modules:
            return RegeneratedModuleList(analysis_chain=analysis_chain, modules=modules)
        
        # Complete fallback
        return ModuleFallbackFactory._create_empty_regenerate_fallback()

    @staticmethod
    def _create_empty_regenerate_fallback() -> RegeneratedModuleList:
        """Create a completely empty regenerate fallback response"""
        return RegeneratedModuleList(
            analysis_chain=ModuleFallbackFactory.create_default_regenerate_analysis_chain(),
            modules=[ModuleFallbackFactory.create_default_module()]
        )

    @staticmethod
    def _salvage_regenerate_analysis_chain(raw_data: Dict[str, Any]) -> RegenerateAnalysisChain:
        """Attempt to salvage regenerate analysis_chain from raw data"""
        raw_chain = FallbackService.safe_get_dict(raw_data, "analysis_chain")
        
        if not raw_chain:
            return ModuleFallbackFactory.create_default_regenerate_analysis_chain()
        
        return RegenerateAnalysisChain(
            feedback_analysis=FallbackService.safe_get(
                raw_chain, "feedback_analysis", "Unable to analyze feedback"
            ),
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

    # =========================================================================
    # Module Details Fallbacks
    # =========================================================================

    @staticmethod
    def create_default_details_analysis_chain() -> DetailsAnalysisChain:
        """Create a default DetailsAnalysisChain for fallback scenarios"""
        return DetailsAnalysisChain(
            dependency_analysis="Unable to analyze module dependencies",
            implementation_order_rationale="Unable to determine implementation order",
            metrics_approach="Unable to determine metrics approach"
        )

    @staticmethod
    def create_details_fallback(
        modules: List[ModuleBasicInfo],
        raw_data: Optional[Dict[str, Any]] = None, 
        error_msg: str = ""
    ) -> ModuleDetailsResponse:
        """
        Create a fallback ModuleDetailsResponse when parsing fails.
        Uses the original modules as base with default enrichment.
        
        Args:
            modules: The original modules from the request
            raw_data: The partially parsed data (may contain some valid fields)
            error_msg: The error message for logging
            
        Returns:
            ModuleDetailsResponse: A valid instance with fallback/salvaged data
        """
        logger.warning(f"Creating fallback ModuleDetailsResponse. Reason: {error_msg}")
        
        # Try to salvage from raw_data first
        if raw_data:
            salvaged_modules = ModuleFallbackFactory._salvage_enriched_modules(raw_data)
            salvaged_chain = ModuleFallbackFactory._salvage_details_analysis_chain(raw_data)
            
            if salvaged_modules:
                return ModuleDetailsResponse(
                    analysis_chain=salvaged_chain,
                    modules=salvaged_modules
                )
        
        # Create fallback from original modules
        enriched_modules = [
            EnrichedModule(
                name=module.name,
                description=module.description or "No description provided",
                metrics=module.metrics or "Metrics to be defined",
                order_of_implementation=idx + 1
            )
            for idx, module in enumerate(modules)
        ]
        
        return ModuleDetailsResponse(
            analysis_chain=ModuleFallbackFactory.create_default_details_analysis_chain(),
            modules=enriched_modules
        )

    @staticmethod
    def _salvage_enriched_modules(raw_data: Dict[str, Any]) -> list[EnrichedModule]:
        """Attempt to salvage valid enriched modules from raw data"""
        raw_modules = FallbackService.safe_get_list(raw_data, "modules")
        
        return FallbackService.extract_items_with_required_field(
            items=raw_modules,
            required_field="name",
            item_factory=lambda m: EnrichedModule(
                name=m.get("name", "Unknown Module"),
                description=m.get("description", "No description provided"),
                metrics=m.get("metrics", "Metrics to be defined"),
                order_of_implementation=m.get("order_of_implementation", 1)
            )
        )

    @staticmethod
    def _salvage_details_analysis_chain(raw_data: Dict[str, Any]) -> DetailsAnalysisChain:
        """Attempt to salvage details analysis_chain from raw data"""
        raw_chain = FallbackService.safe_get_dict(raw_data, "analysis_chain")
        
        if not raw_chain:
            return ModuleFallbackFactory.create_default_details_analysis_chain()
        
        return DetailsAnalysisChain(
            dependency_analysis=FallbackService.safe_get(
                raw_chain, "dependency_analysis", "Unable to analyze dependencies"
            ),
            implementation_order_rationale=FallbackService.safe_get(
                raw_chain, "implementation_order_rationale", "Unable to determine order"
            ),
            metrics_approach=FallbackService.safe_get(
                raw_chain, "metrics_approach", "Unable to determine metrics approach"
            )
        )
