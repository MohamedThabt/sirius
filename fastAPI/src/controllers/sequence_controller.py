"""Sequence Controller - Business logic for sequence diagram generation"""
from fastapi import HTTPException
from controllers.gemini import ask_gemini
from models.Sequence import SequenceRequest, EditSequenceRequest
from models.usage import UsageMetrics
from utils.mermaid_utils import extract_mermaid_from_response
from utils.sequence_validator import validate_sequence
from utils.prompt_loader import load_prompt
from string import Template
import logging

logger = logging.getLogger(__name__)


async def generate_feature_sequence(request: SequenceRequest) -> tuple[str, UsageMetrics]:
    """Generate sequence diagram for a specific feature with automatic retry on validation failures"""
    logger.info(f"Sequence Generation: {request.feature.name} (Module: {request.module.name})")

    template = load_prompt("Sequence-Generate.txt")
    template = Template(template)
    
    base_context = {
        "module_name": request.module.name or "Unknown Module",
        "module_description": request.module.description or "No description",
        "module_erd": request.module.erd or "No ERD available",
        "feature_name": request.feature.name,
        "feature_description": request.feature.description or "No description",
        "feature_acceptance_criteria": request.feature.acceptance_criteria or "No acceptance criteria",
        "feature_user_flows": request.feature.user_flows or "No user flows defined",
        "feature_metrics": request.feature.metrics or "No metrics defined",
        "feature_datamodel": request.feature.datamodel or "No datamodel available"
    }
    
    max_retries = 3
    accumulated_usage = UsageMetrics(input_tokens=0, output_tokens=0, cost=0.0)
    previous_errors = []
    
    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Attempt {attempt}/{max_retries}")
            
            # Build prompt with error feedback for retries
            if attempt > 1 and previous_errors:
                error_feedback = "\n\n## PREVIOUS ATTEMPT HAD VALIDATION ERRORS - PLEASE FIX:\n"
                for i, error in enumerate(previous_errors, 1):
                    error_feedback += f"{i}. {error}\n"
                error_feedback += "\nPlease generate a corrected version that addresses all these errors.\n"
                prompt = template.substitute(**base_context) + error_feedback
            else:
                prompt = template.substitute(**base_context)
            
            raw_response, usage = await ask_gemini(prompt)
            
            # Accumulate token usage
            accumulated_usage.input_tokens += usage.input_tokens
            accumulated_usage.output_tokens += usage.output_tokens
            accumulated_usage.cost += usage.cost
            
            total_tokens = usage.input_tokens + usage.output_tokens
            logger.info(f"AI Response: {len(raw_response)} chars, Tokens: {total_tokens}")
            
            clean_mermaid = extract_mermaid_from_response(raw_response)
            if not clean_mermaid:
                logger.warning(f"Attempt {attempt}: Failed to extract Mermaid diagram")
                if attempt < max_retries:
                    previous_errors = ["Could not extract valid Mermaid code block. Ensure output is wrapped in ```mermaid``` code fence."]
                    continue
                raise HTTPException(status_code=500, detail="Unable to generate sequence diagram. Please try again.")
            
            # Validate sequence diagram syntax
            validation_result = await validate_sequence(clean_mermaid)
            
            if not validation_result.is_valid:
                logger.warning(f"Attempt {attempt}: Validation failed - {len(validation_result.errors)} errors")
                for error in validation_result.errors[:5]:
                    logger.warning(f"  - {error}")
                
                if attempt < max_retries:
                    # Store errors for next attempt's feedback
                    previous_errors = validation_result.errors[:5]  # Limit to top 5 errors
                    continue
                
                # All retries exhausted - return generic error
                logger.error(f"All {max_retries} attempts failed validation")
                raise HTTPException(status_code=500, detail="Unable to generate valid sequence diagram. Please try again or modify your feature description.")
            
            if validation_result.warnings:
                logger.warning(f"Validation warnings: {len(validation_result.warnings)}")
            
            acc_total = accumulated_usage.input_tokens + accumulated_usage.output_tokens
            logger.info(f"✓ Success on attempt {attempt}: {len(clean_mermaid)} chars, Total tokens: {acc_total}")
            return clean_mermaid, accumulated_usage
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Attempt {attempt} error: {type(e).__name__} - {str(e)}")
            if attempt < max_retries:
                previous_errors = [f"Internal error occurred: {str(e)}. Please try generating the diagram again."]
                continue
            logger.error(f"All {max_retries} attempts failed with exceptions", exc_info=True)
            raise HTTPException(status_code=500, detail="Unable to generate sequence diagram. Please try again later.")


async def edit_feature_sequence(request: EditSequenceRequest) -> tuple[str, UsageMetrics]:
    """Edit existing sequence diagram based on engineer notes with automatic retry on validation failures"""
    logger.info(f"Sequence Edit: {len(request.FeatureSequence)} chars, notes: {len(request.engineer_notes)} chars")

    if not request.FeatureSequence.strip():
        raise HTTPException(status_code=400, detail="Sequence cannot be empty")
    if not request.engineer_notes.strip():
        raise HTTPException(status_code=400, detail="Engineer notes cannot be empty")

    template = load_prompt("Sequence-Edit.txt")
    template = Template(template)
    
    base_context = {
        "Sequence": request.FeatureSequence,
        "engineer_notes": request.engineer_notes
    }
    
    max_retries = 3
    accumulated_usage = UsageMetrics(input_tokens=0, output_tokens=0, cost=0.0)
    previous_errors = []
    
    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Edit attempt {attempt}/{max_retries}")
            
            # Build prompt with error feedback for retries
            if attempt > 1 and previous_errors:
                error_feedback = "\n\n## PREVIOUS EDIT HAD VALIDATION ERRORS - PLEASE FIX:\n"
                for i, error in enumerate(previous_errors, 1):
                    error_feedback += f"{i}. {error}\n"
                error_feedback += "\nPlease provide a corrected version that addresses all these errors.\n"
                prompt = template.substitute(**base_context) + error_feedback
            else:
                prompt = template.substitute(**base_context)
            
            raw_response, usage = await ask_gemini(prompt)
            
            # Accumulate token usage
            accumulated_usage.input_tokens += usage.input_tokens
            accumulated_usage.output_tokens += usage.output_tokens
            accumulated_usage.cost += usage.cost
            
            total_tokens = usage.input_tokens + usage.output_tokens
            logger.info(f"AI Response: {len(raw_response)} chars, Tokens: {total_tokens}")
            
            clean_mermaid = extract_mermaid_from_response(raw_response)
            if not clean_mermaid:
                logger.warning(f"Edit attempt {attempt}: Failed to extract Mermaid")
                if attempt < max_retries:
                    previous_errors = ["Could not extract valid Mermaid code block. Ensure output is wrapped in ```mermaid``` code fence."]
                    continue
                raise HTTPException(status_code=500, detail="Unable to apply edits to sequence diagram. Please try again.")
            
            validation_result = await validate_sequence(clean_mermaid)
            
            if not validation_result.is_valid:
                logger.warning(f"Edit attempt {attempt}: Validation failed - {len(validation_result.errors)} errors")
                for error in validation_result.errors[:5]:
                    logger.warning(f"  - {error}")
                
                if attempt < max_retries:
                    # Store errors for next attempt's feedback
                    previous_errors = validation_result.errors[:5]  # Limit to top 5 errors
                    continue
                
                # All retries exhausted
                logger.error(f"All {max_retries} edit attempts failed validation")
                raise HTTPException(status_code=500, detail="Unable to apply valid edits to sequence diagram. Please rephrase your request and try again.")
            
            if validation_result.warnings:
                logger.warning(f"Edit warnings: {len(validation_result.warnings)}")
            
            acc_total = accumulated_usage.input_tokens + accumulated_usage.output_tokens
            logger.info(f"✓ Edit success on attempt {attempt}: {len(request.FeatureSequence)} → {len(clean_mermaid)} chars, Total tokens: {acc_total}")
            return clean_mermaid, accumulated_usage
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Edit attempt {attempt} error: {type(e).__name__} - {str(e)}")
            if attempt < max_retries:
                previous_errors = [f"Internal error occurred: {str(e)}. Please try again."]
                continue
            logger.error(f"All {max_retries} edit attempts failed with exceptions", exc_info=True)
            raise HTTPException(status_code=500, detail="Unable to edit sequence diagram. Please try again later.")
