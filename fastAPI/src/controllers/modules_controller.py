"""Modules Controller - Business logic for DDD System Modules generation (Stage S2)"""
from typing import Optional, Dict, Any
from fastapi import HTTPException
from controllers.llm_proxy import proxy
from models.modules import (
    ModuleGenerationRequest, 
    ModuleList, 
    ModuleRegenerationRequest, 
    RegeneratedModuleList,
    ModuleDetailsRequest,
    ModuleDetailsResponse,
    SingleModuleRequest,
    SingleModuleResponse,
    SingleModuleAnalysisChain,
    EnrichedModule
)
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
        raw_response, usage = await proxy(prompt)

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


async def regenerate_suggestion_modules(request: ModuleRegenerationRequest) -> tuple[RegeneratedModuleList, UsageMetrics]:
    """Regenerate system modules based on user feedback"""
    logger.info(f"Starting modules regeneration (description: {len(request.project_description)} chars, notes: {len(request.user_notes)} chars)")

    # Format previous modules for the prompt
    previous_modules_text = "\n".join([
        f"- **{module.name}**: {module.description}"
        for module in request.previous_modules
    ])

    # Build Prompt
    template = load_prompt("Modules-Regenerate.txt")
    template = Template(template)
    
    prompt = template.substitute(
        project_description=request.project_description,
        previous_modules=previous_modules_text,
        user_notes=request.user_notes
    )

    usage = None
    
    try:
        logger.info("Calling Gemini API for regeneration...")
        raw_response, usage = await proxy(prompt)

        logger.info("Extracting JSON from response...")
        json_str = extract_json_from_response(raw_response)

        if not json_str:
            logger.error("No valid JSON found in Gemini response")
            logger.error(f"Raw response: {raw_response[:500]}...")
            return ModuleFallbackFactory.create_regenerate_fallback(
                error_msg="No JSON found in response"
            ), usage

        # Parse JSON
        parsed_data = json.loads(json_str)
        
        # Validate with fallback service
        module_list, success = FallbackService.parse_with_fallback(
            raw_data=parsed_data,
            model_class=RegeneratedModuleList,
            fallback_factory=ModuleFallbackFactory.create_regenerate_fallback
        )
        
        if success:
            logger.info(f"Modules regenerated successfully (JSON: {len(json_str)} chars)")
        else:
            logger.warning("Used fallback response due to parsing issues")
            
        return module_list, usage

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error during modules regeneration: {str(e)}", exc_info=True)
        return ModuleFallbackFactory.create_regenerate_fallback(
            error_msg=f"JSON decode error: {e}"
        ), usage
        
    except HTTPException as e:
        logger.error(f"HTTP error during modules regeneration: {e.status_code} - {e.detail}")
        raise e
        
    except Exception as e:
        logger.error(f"Unexpected error during modules regeneration: {str(e)}", exc_info=True)
        if usage:
            return ModuleFallbackFactory.create_regenerate_fallback(
                error_msg=f"Unexpected error: {e}"
            ), usage
        raise HTTPException(status_code=500, detail="Internal server error")


async def generate_module_details(request: ModuleDetailsRequest) -> tuple[ModuleDetailsResponse, UsageMetrics]:
    """Generate detailed module information including enhanced descriptions, metrics, and implementation order"""
    logger.info(f"Starting module details generation (modules: {len(request.modules)}, description: {len(request.project_description)} chars)")

    # Format modules list for the prompt
    modules_text = "\n".join([
        f"- **{module.name}**: {module.description}" + (f"\n  Metrics hint: {module.metrics}" if module.metrics else "")
        for module in request.modules
    ])

    # Format technical context if available
    technical_context = "No technical context provided."
    if request.technical_intake:
        tech = request.technical_intake
        tech_parts = []
        if tech.platform_targets:
            tech_parts.append(f"- Platform Targets: {tech.platform_targets}")
        if tech.frontend_tech:
            tech_parts.append(f"- Frontend: {tech.frontend_tech}")
        if tech.backend_tech:
            tech_parts.append(f"- Backend: {tech.backend_tech}")
        if tech.database_tech:
            tech_parts.append(f"- Database: {tech.database_tech}")
        if tech.ai_usage:
            tech_parts.append(f"- AI Usage: {tech.ai_usage}")
        if tech.external_services:
            tech_parts.append(f"- External Services: {tech.external_services}")
        
        if tech_parts:
            technical_context = "\n".join(tech_parts)

    # Build Prompt
    template = load_prompt("Modules-Details-Generate.txt")
    template = Template(template)
    
    prompt = template.substitute(
        project_description=request.project_description,
        technical_context=technical_context,
        modules_list=modules_text
    )

    usage = None
    
    try:
        logger.info("Calling Gemini API for module details generation...")
        raw_response, usage = await proxy(prompt)

        logger.info("Extracting JSON from response...")
        json_str = extract_json_from_response(raw_response)

        if not json_str:
            logger.error("No valid JSON found in Gemini response")
            logger.error(f"Raw response: {raw_response[:500]}...")
            return ModuleFallbackFactory.create_details_fallback(
                modules=request.modules,
                error_msg="No JSON found in response"
            ), usage

        # Parse JSON
        parsed_data = json.loads(json_str)
        
        # Validate with fallback service
        module_details, success = FallbackService.parse_with_fallback(
            raw_data=parsed_data,
            model_class=ModuleDetailsResponse,
            fallback_factory=lambda raw_data, error_msg: ModuleFallbackFactory.create_details_fallback(
                modules=request.modules,
                raw_data=raw_data,
                error_msg=error_msg
            )
        )
        
        if success:
            logger.info(f"Module details generated successfully (JSON: {len(json_str)} chars)")
        else:
            logger.warning("Used fallback response due to parsing issues")
            
        return module_details, usage

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error during module details generation: {str(e)}", exc_info=True)
        return ModuleFallbackFactory.create_details_fallback(
            modules=request.modules,
            error_msg=f"JSON decode error: {e}"
        ), usage
        
    except HTTPException as e:
        logger.error(f"HTTP error during module details generation: {e.status_code} - {e.detail}")
        raise e
        
    except Exception as e:
        logger.error(f"Unexpected error during module details generation: {str(e)}", exc_info=True)
        if usage:
            return ModuleFallbackFactory.create_details_fallback(
                modules=request.modules,
                error_msg=f"Unexpected error: {e}"
            ), usage
        raise HTTPException(status_code=500, detail="Internal server error")


async def generate_single_module(request: SingleModuleRequest) -> tuple[SingleModuleResponse, UsageMetrics]:
    """Generate a single enriched module with context of existing modules"""
    logger.info(f"Starting single module generation (name: {request.new_module_name}, existing modules: {len(request.existing_modules)})")

    # Format existing modules list for context
    if request.existing_modules:
        existing_modules_text = "\n".join([
            f"{module.order_of_implementation}. **{module.name}**: {module.description}"
            for module in sorted(request.existing_modules, key=lambda m: m.order_of_implementation)
        ])
    else:
        existing_modules_text = "No existing modules - this will be the first module in the system."

    # Build Prompt
    template = load_prompt("Modules-Single-Generate.txt")
    template = Template(template)
    
    prompt = template.substitute(
        project_description=request.project_description,
        new_module_name=request.new_module_name,
        new_module_description=request.new_module_description,
        existing_modules=existing_modules_text
    )

    usage = None
    
    try:
        logger.info("Calling Gemini API for single module generation...")
        raw_response, usage = await proxy(prompt)

        logger.info("Extracting JSON from response...")
        json_str = extract_json_from_response(raw_response)

        if not json_str:
            logger.error("No valid JSON found in Gemini response")
            logger.error(f"Raw response: {raw_response[:500]}...")
            raise HTTPException(status_code=500, detail="No valid JSON found in AI response")

        # Parse JSON
        parsed_data = json.loads(json_str)
        
        # Pre-process: Convert metrics to string if it's a list
        if "module" in parsed_data and isinstance(parsed_data["module"], dict):
            module_data = parsed_data["module"]
            if "metrics" in module_data and isinstance(module_data["metrics"], list):
                module_data["metrics"] = "\n".join(str(item) for item in module_data["metrics"] if item)
                logger.info("Converted metrics from list to string")
        
        # Validate response
        single_module_response = SingleModuleResponse(**parsed_data)
        logger.info(f"Single module generated successfully (JSON: {len(json_str)} chars)")
            
        return single_module_response, usage

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error during single module generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"JSON decode error: {e}")
        
    except HTTPException as e:
        logger.error(f"HTTP error during single module generation: {e.status_code} - {e.detail}")
        raise e
        
    except Exception as e:
        logger.error(f"Unexpected error during single module generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
