"""ERD Controller - Business logic for Entity Relationship Diagram generation"""
from fastapi import HTTPException
from controllers.gemini import ask_gemini
from models.ERD import (
    ModuleERDRequest,
    EditModuleERDRequest
)
from models.usage import UsageMetrics
from utils.mermaid_utils import extract_mermaid_from_response
from utils.erd_validator import validate_erd, ERDValidationResponse
from utils.prompt_loader import load_prompt
from string import Template
import logging

logger = logging.getLogger(__name__)

# Maximum regeneration attempts
MAX_REGENERATION_ATTEMPTS = 2


async def _generate_erd_with_prompt(prompt: str) -> tuple[str, UsageMetrics]:
    """Internal helper to generate ERD from prompt"""
    raw_response, usage = await ask_gemini(prompt)
    clean_mermaid = extract_mermaid_from_response(raw_response)
    if not clean_mermaid:
        raise HTTPException(status_code=500, detail="Invalid Mermaid response from AI")
    return clean_mermaid, usage


async def _build_generation_prompt(
    request: ModuleERDRequest,
    validation_feedback: str = None
) -> str:
    """Build the ERD generation prompt with optional validation feedback"""
    
    # Format existing modules for context
    if request.existing_modules:
        existing_modules_text = "\n".join([
            f"- **{m.name}**: {m.description}"
            for m in request.existing_modules
        ])
    else:
        existing_modules_text = "No other modules defined yet."

    # Build base prompt
    template = load_prompt("Modules-ERD-Generate.txt")
    template = Template(template)
    prompt = template.substitute(
        project_overview=request.project_overview,
        module_name=request.module_name,
        module_description=request.module_description,
        module_metrics=request.module_metrics or "No specific metrics defined",
        existing_modules=existing_modules_text
    )
    
    # Add validation feedback if this is a regeneration
    if validation_feedback:
        prompt += f"""

# IMPORTANT - PREVIOUS ATTEMPT HAD ISSUES:
The previous ERD generation had the following problems that MUST be fixed:

{validation_feedback}

Please regenerate the ERD, ensuring ALL the above issues are resolved.
Follow the syntax rules EXACTLY as specified in the prompt.
"""
    
    return prompt


def _format_validation_feedback(validation: ERDValidationResponse) -> str:
    """Format validation errors and warnings into feedback string"""
    feedback_parts = []
    
    if validation.errors:
        feedback_parts.append("## ERRORS (Must Fix):")
        for error in validation.errors:
            feedback_parts.append(f"- {error}")
    
    if validation.warnings:
        feedback_parts.append("\n## WARNINGS (Should Fix):")
        for warning in validation.warnings:
            feedback_parts.append(f"- {warning}")
    
    return "\n".join(feedback_parts)


async def generate_module_erd(request: ModuleERDRequest) -> tuple[str, UsageMetrics]:
    """
    Generate ERD for a module (bounded context) with validation and auto-regeneration.
    
    Process:
    1. Generate initial ERD
    2. Validate syntax and logic
    3. If invalid, regenerate with feedback (up to MAX_REGENERATION_ATTEMPTS)
    4. Return final ERD or raise error if all attempts fail
    """
    logger.info(f"Starting module ERD generation for: {request.module_name}")
    
    # Prepare existing modules for validation
    existing_modules_for_validation = [
        {"name": m.name, "description": m.description}
        for m in request.existing_modules
    ] if request.existing_modules else []
    
    total_usage = UsageMetrics(input_tokens=0, output_tokens=0, cost=0.0)
    validation_feedback = None
    
    for attempt in range(MAX_REGENERATION_ATTEMPTS + 1):
        attempt_num = attempt + 1
        logger.info(f"ERD generation attempt {attempt_num}/{MAX_REGENERATION_ATTEMPTS + 1}")
        
        try:
            # Build prompt (with feedback if regenerating)
            logger.info("Building generation prompt...")
            prompt = await _build_generation_prompt(request, validation_feedback)
            logger.info(f"Prompt built successfully, length: {len(prompt)} chars")
            
            # Generate ERD
            logger.info("Calling Gemini API for module ERD...")
            clean_mermaid, usage = await _generate_erd_with_prompt(prompt)
            logger.info(f"Gemini API returned, ERD length: {len(clean_mermaid)} chars")
            
            # Log the generated ERD for debugging (first 500 chars)
            logger.debug(f"Generated ERD content (first 500 chars): {clean_mermaid[:500]}")
            
            # Accumulate usage
            total_usage.input_tokens += usage.input_tokens
            total_usage.output_tokens += usage.output_tokens
            
            # Validate the generated ERD
            logger.info("Validating generated ERD...")
            validation = await validate_erd(
                erd_content=clean_mermaid,
                module_name=request.module_name,
                module_description=request.module_description,
                existing_modules=existing_modules_for_validation,
                project_overview=request.project_overview
            )
            
            # Log validation result
            logger.info(
                f"Validation result: syntax_valid={validation.syntax_valid}, "
                f"errors={len(validation.errors)}, warnings={len(validation.warnings)}"
            )
            
            # If valid, return the ERD
            if validation.is_valid:
                logger.info(f"Module ERD generated and validated successfully for: {request.module_name}")
                
                # Log warnings if any
                if validation.warnings:
                    logger.warning(f"ERD has warnings: {validation.warnings}")
                
                return clean_mermaid, total_usage
            
            # If invalid and we have more attempts, prepare feedback for regeneration
            if attempt < MAX_REGENERATION_ATTEMPTS:
                validation_feedback = _format_validation_feedback(validation)
                logger.warning(
                    f"ERD validation failed on attempt {attempt_num}. "
                    f"Errors: {validation.errors}. Regenerating..."
                )
            else:
                # Final attempt failed
                logger.error(
                    f"ERD validation failed after {MAX_REGENERATION_ATTEMPTS + 1} attempts. "
                    f"Final errors: {validation.errors}"
                )
                
                # If only warnings but no errors, we can still return
                if validation.syntax_valid and not validation.errors:
                    logger.warning("Returning ERD with warnings")
                    return clean_mermaid, total_usage
                
                # Otherwise, raise error
                error_summary = "; ".join(validation.errors[:3])  # First 3 errors
                raise HTTPException(
                    status_code=500,
                    detail=f"ERD validation failed after {MAX_REGENERATION_ATTEMPTS + 1} attempts: {error_summary}"
                )
                
        except HTTPException as e:
            logger.error(f"HTTP error during ERD generation: {e.status_code} - {e.detail}")
            raise e
        except Exception as e:
            logger.error(f"Unexpected error during ERD generation: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail="Internal server error")
    
    # Should not reach here, but just in case
    raise HTTPException(status_code=500, detail="ERD generation failed unexpectedly")


async def edit_module_erd(request: EditModuleERDRequest) -> tuple[str, UsageMetrics]:
    """Edit existing module ERD based on engineer notes"""
    logger.info(f"Starting module ERD edit (ERD: {len(request.ModuleERD)} chars, notes: {len(request.engineer_notes)} chars)")

    # Validate input
    if not request.ModuleERD.strip():
        logger.warning("Module ERD edit rejected: empty ERD")
        raise HTTPException(status_code=400, detail="Module ERD cannot be empty")
    if not request.engineer_notes.strip():
        logger.warning("Module ERD edit rejected: empty engineer notes")
        raise HTTPException(status_code=400, detail="Engineer notes cannot be empty")

    # Build prompt
    template = load_prompt("ERD-Edit.txt")
    prompt = template.format(
        ERD=request.ModuleERD,
        engineer_notes=request.engineer_notes
    )
    
    try:
        logger.info("Calling Gemini API for module ERD edit...")
        raw_response, usage = await ask_gemini(prompt)
        clean_mermaid = extract_mermaid_from_response(raw_response)
        if not clean_mermaid:
            raise HTTPException(status_code=500, detail="Invalid Mermaid response from AI")

    except HTTPException as e:
        logger.error(f"HTTP error during module ERD edit: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during module ERD edit: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info("Module ERD edited successfully")
    return clean_mermaid, usage
