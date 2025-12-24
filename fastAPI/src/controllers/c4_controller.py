"""C4 Controller - Business logic for C4 model generation"""
from fastapi import HTTPException
from controllers.llm_proxy import proxy
from models.C4 import C4Request, EditC4Request
from models.usage import UsageMetrics
from utils.json_utils import extract_json_from_response
from utils.prompt_loader import load_prompt
from utils.c4_validator import validate_c4_json, get_validation_summary
from string import Template
import json
import logging

logger = logging.getLogger(__name__)


async def generate_c4(request: C4Request) -> tuple[str, UsageMetrics]:
    """
    Generate C4 diagram from project overview and technical context with validation and retry.
    
    Uses 2-retry pattern with validation error feedback for cost optimization.
    Context: base overview version + technical intake + modules (when available)
    """
    # Log generation start with context details
    overview_length = len(request.project_overview)
    has_tech_intake = request.technical_intake is not None
    modules_count = len(request.modules) if request.modules else 0
    
    logger.info(
        f"C4 Generation: overview={overview_length} chars, "
        f"tech_intake={has_tech_intake}, modules={modules_count}"
    )

    # Format technical context from intake
    technical_context = "No technical details provided."
    if request.technical_intake:
        tech = request.technical_intake
        tech_parts = []
        if tech.platform_targets:
            tech_parts.append(f"**Platform Targets:** {tech.platform_targets}")
        if tech.frontend_tech:
            tech_parts.append(f"**Frontend:** {tech.frontend_tech}")
        if tech.backend_tech:
            tech_parts.append(f"**Backend:** {tech.backend_tech}")
        if tech.database_tech:
            tech_parts.append(f"**Database:** {tech.database_tech}")
        if tech.ai_usage:
            tech_parts.append(f"**AI/ML:** {tech.ai_usage}")
        if tech.external_services:
            tech_parts.append(f"**External Services:** {tech.external_services}")
        
        if tech_parts:
            technical_context = "\n".join(tech_parts)
    
    # Format modules context (optional)
    modules_context = ""
    if request.modules and len(request.modules) > 0:
        modules_list = "\n".join([
            f"{idx + 1}. **{mod.name}**: {mod.description}"
            for idx, mod in enumerate(request.modules)
        ])
        modules_context = f"\n\n## System Modules (DDD Bounded Contexts)\n\n{modules_list}"

    # Retry loop with validation
    max_retries = 2
    accumulated_usage = UsageMetrics(input_tokens=0, output_tokens=0, cost=0.0)
    previous_errors = []
    last_response = None

    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Attempt {attempt}/{max_retries}")
            
            # Build prompt (add error feedback on retries)
            template = load_prompt("C4-Generate.txt")
            template = Template(template)
            
            base_context = {
                'project_overview': request.project_overview,
                'technical_context': technical_context,
                'modules_context': modules_context
            }
            
            if attempt > 1 and previous_errors:
                error_feedback = "\n\n## PREVIOUS ATTEMPT HAD VALIDATION ERRORS - PLEASE FIX:\n"
                for i, error in enumerate(previous_errors[:3], 1):  # Top 3 errors only
                    error_feedback += f"{i}. {error}\n"
                error_feedback += "\nPlease generate a corrected C4 diagram that addresses these validation errors.\n"
                prompt = template.substitute(**base_context) + error_feedback
            else:
                prompt = template.substitute(**base_context)
            
            # Call Gemini API
            raw_response, usage = await proxy(prompt)
            
            # Accumulate token usage
            accumulated_usage.input_tokens += usage.input_tokens
            accumulated_usage.output_tokens += usage.output_tokens
            accumulated_usage.cost += usage.cost
            
            total_tokens = accumulated_usage.input_tokens + accumulated_usage.output_tokens
            logger.info(
                f"AI Response: {len(raw_response)} chars, "
                f"Tokens: {total_tokens} (input: {accumulated_usage.input_tokens}, "
                f"output: {accumulated_usage.output_tokens})"
            )
            
            # Extract JSON
            try:
                c4_json = extract_json_from_response(raw_response)
                last_response = c4_json
            except Exception as extract_error:
                logger.warning(f"Attempt {attempt}: Failed to extract JSON - {str(extract_error)}")
                if attempt < max_retries:
                    previous_errors = [f"JSON extraction failed: {str(extract_error)}"]
                    continue
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to extract valid JSON after {max_retries} attempts"
                )
            
            # Validate C4 diagram
            validation_result = validate_c4_json(c4_json)
            
            if not validation_result.is_valid:
                logger.warning(
                    f"Attempt {attempt}: Validation failed - {len(validation_result.errors)} errors, "
                    f"{len(validation_result.warnings)} warnings"
                )
                
                if attempt < max_retries:
                    # Keep top 3 critical errors for retry
                    previous_errors = validation_result.errors[:3]
                    continue
                else:
                    # Last attempt failed - return with warnings (fallback strategy)
                    logger.error(
                        f"All {max_retries} attempts failed validation. "
                        f"Returning last attempt with errors."
                    )
                    # Return last attempt anyway with error information
                    logger.info(
                        f"⚠ Returning C4 with validation issues: "
                        f"{len(validation_result.errors)} errors, Total tokens: {total_tokens}"
                    )
                    return c4_json, accumulated_usage
            
            # Validation passed (or has only warnings)
            acc_total = accumulated_usage.input_tokens + accumulated_usage.output_tokens
            if validation_result.warnings:
                logger.info(
                    f"✓ Success on attempt {attempt} with {len(validation_result.warnings)} warnings: "
                    f"{len(c4_json)} chars, Total tokens: {acc_total}"
                )
            else:
                logger.info(
                    f"✓ Success on attempt {attempt}: "
                    f"{len(c4_json)} chars, Total tokens: {acc_total}"
                )
            
            return c4_json, accumulated_usage
            
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Attempt {attempt}: Exception - {str(e)}")
            if attempt < max_retries:
                previous_errors = [f"Unexpected error: {str(e)}"]
                continue
            
            logger.error(f"All {max_retries} attempts failed with exceptions", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"C4 generation failed after {max_retries} attempts: {str(e)}"
            )


async def edit_c4(request: EditC4Request) -> tuple[str, UsageMetrics]:
    """
    Edit existing C4 diagram based on engineer notes with validation and retry.
    
    Uses 2-retry pattern with validation error feedback for cost optimization.
    """
    logger.info(f"C4 Edit: notes={len(request.engineer_notes)} chars, current_c4={len(request.SystemC4)} chars")

    # Retry loop with validation
    max_retries = 2
    accumulated_usage = UsageMetrics(input_tokens=0, output_tokens=0, cost=0.0)
    previous_errors = []
    last_response = None

    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Edit attempt {attempt}/{max_retries}")
            
            # Build prompt (add error feedback on retries)
            template = load_prompt("C4-Edit.txt")
            template = Template(template)
            
            base_context = {
                'SystemC4': request.SystemC4,
                'engineer_notes': request.engineer_notes
            }
            
            if attempt > 1 and previous_errors:
                error_feedback = "\n\n## PREVIOUS ATTEMPT HAD VALIDATION ERRORS - PLEASE FIX:\n"
                for i, error in enumerate(previous_errors[:3], 1):  # Top 3 errors only
                    error_feedback += f"{i}. {error}\n"
                error_feedback += "\nPlease generate a corrected C4 diagram that addresses these validation errors.\n"
                prompt = template.substitute(**base_context) + error_feedback
            else:
                prompt = template.substitute(**base_context)
            
            # Call Gemini API
            raw_response, usage = await proxy(prompt)
            
            # Accumulate token usage
            accumulated_usage.input_tokens += usage.input_tokens
            accumulated_usage.output_tokens += usage.output_tokens
            accumulated_usage.cost += usage.cost
            
            total_tokens = accumulated_usage.input_tokens + accumulated_usage.output_tokens
            logger.info(
                f"AI Response: {len(raw_response)} chars, "
                f"Tokens: {total_tokens} (input: {accumulated_usage.input_tokens}, "
                f"output: {accumulated_usage.output_tokens})"
            )
            
            # Extract JSON
            try:
                c4_json = extract_json_from_response(raw_response)
                last_response = c4_json
            except Exception as extract_error:
                logger.warning(f"Edit attempt {attempt}: Failed to extract JSON - {str(extract_error)}")
                if attempt < max_retries:
                    previous_errors = [f"JSON extraction failed: {str(extract_error)}"]
                    continue
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to extract valid JSON after {max_retries} attempts"
                )
            
            # Validate C4 diagram
            validation_result = validate_c4_json(c4_json)
            
            if not validation_result.is_valid:
                logger.warning(
                    f"Edit attempt {attempt}: Validation failed - {len(validation_result.errors)} errors, "
                    f"{len(validation_result.warnings)} warnings"
                )
                
                if attempt < max_retries:
                    # Keep top 3 critical errors for retry
                    previous_errors = validation_result.errors[:3]
                    continue
                else:
                    # Last attempt failed - return with warnings (fallback strategy)
                    logger.error(
                        f"All {max_retries} edit attempts failed validation. "
                        f"Returning last attempt with errors."
                    )
                    # Return last attempt anyway with error information
                    logger.info(
                        f"⚠ Returning edited C4 with validation issues: "
                        f"{len(validation_result.errors)} errors, Total tokens: {total_tokens}"
                    )
                    return c4_json, accumulated_usage
            
            # Validation passed (or has only warnings)
            acc_total = accumulated_usage.input_tokens + accumulated_usage.output_tokens
            if validation_result.warnings:
                logger.info(
                    f"✓ Edit success on attempt {attempt} with {len(validation_result.warnings)} warnings: "
                    f"{len(c4_json)} chars, Total tokens: {acc_total}"
                )
            else:
                logger.info(
                    f"✓ Edit success on attempt {attempt}: "
                    f"{len(c4_json)} chars, Total tokens: {acc_total}"
                )
            
            return c4_json, accumulated_usage
            
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Edit attempt {attempt}: Exception - {str(e)}")
            if attempt < max_retries:
                previous_errors = [f"Unexpected error: {str(e)}"]
                continue
            
            logger.error(f"All {max_retries} edit attempts failed with exceptions", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"C4 edit failed after {max_retries} attempts: {str(e)}"
            )
