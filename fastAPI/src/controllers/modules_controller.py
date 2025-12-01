"""Modules Controller - Business logic for DDD System Modules generation (Stage S2)"""
from fastapi import HTTPException
from controllers.gemini import ask_gemini
from models.modules import ModuleGenerationRequest, ModuleList
from models.usage import UsageMetrics
from utils.json_utils import extract_json_from_response
from utils.prompt_loader import load_prompt
from services.fallback_service import FallbackService
from services.module_fallback_factory import ModuleFallbackFactory
from string import Template
import json
import logging

logger = logging.getLogger(__name__)


async def generate_suggestion_modules(request: ModuleGenerationRequest) -> tuple[ModuleList, UsageMetrics]:
    """Generate system modules using DDD approach with Chain of Thought reasoning"""
    logger.info(f"Starting modules generation (description: {len(request.project_description)} chars)")

    # Build Prompt
    template = load_prompt("Modules-Generate.txt")
    template = Template(template)
    
    prompt = template.substitute(
        project_description=request.project_description
    )

    usage = None
    
    try:
        logger.info("Calling Gemini API...")
        raw_response, usage = await ask_gemini(prompt)

        logger.info("Extracting JSON from response...")
        json_str = extract_json_from_response(raw_response)

        if not json_str:
            logger.error("No valid JSON found in Gemini response")
            logger.error(f"Raw response: {raw_response[:500]}...")
            return ModuleFallbackFactory.create_fallback(
                error_msg="No JSON found in response"
            ), usage

        # Parse JSON
        parsed_data = json.loads(json_str)
        
        # Validate with fallback service
        module_list, success = FallbackService.parse_with_fallback(
            raw_data=parsed_data,
            model_class=ModuleList,
            fallback_factory=ModuleFallbackFactory.create_fallback
        )
        
        if success:
            logger.info(f"Modules generated successfully (JSON: {len(json_str)} chars)")
        else:
            logger.warning("Used fallback response due to parsing issues")
            
        return module_list, usage

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error during modules generation: {str(e)}", exc_info=True)
        return ModuleFallbackFactory.create_fallback(
            error_msg=f"JSON decode error: {e}"
        ), usage
        
    except HTTPException as e:
        logger.error(f"HTTP error during modules generation: {e.status_code} - {e.detail}")
        raise e
        
    except Exception as e:
        logger.error(f"Unexpected error during modules generation: {str(e)}", exc_info=True)
        if usage:
            return ModuleFallbackFactory.create_fallback(
                error_msg=f"Unexpected error: {e}"
            ), usage
        raise HTTPException(status_code=500, detail="Internal server error")
