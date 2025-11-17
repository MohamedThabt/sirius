"""Sequence Controller - Business logic for sequence diagram generation"""
from fastapi import HTTPException
from controllers.gemini import ask_gemini
from models.Sequence import SequenceRequest, EditSequenceRequest
from models.usage import UsageMetrics
from utils.mermaid_utils import extract_mermaid_from_response
from utils.prompt_loader import load_prompt
from string import Template
import json
import logging

logger = logging.getLogger(__name__)


async def generate_feature_sequence(request: SequenceRequest) -> tuple[str, UsageMetrics]:
    """Generate sequence diagram for a specific feature"""
    logger.info(f"Starting Sequence for feature: {request.feature.name}")

    template = load_prompt("Sequence-Generate.txt")
    template = Template(template)
    prompt = template.substitute(prd=request.prd, DetailedFeature=request.feature)
    
    try:
        logger.info("Calling Gemini API...")
        raw_response, usage = await ask_gemini(prompt)
        clean_mermaid = extract_mermaid_from_response(raw_response)
        if not clean_mermaid:
            raise HTTPException(status_code=500, detail=f"Invalid Mermaid response from AI: {raw_response}")
    except HTTPException as e:
        logger.error(f"HTTP error during Sequence generation: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during Sequence generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info("Sequence generated successfully")
    return clean_mermaid, usage


async def edit_feature_sequence(request: EditSequenceRequest) -> tuple[str, UsageMetrics]:
    """Edit existing sequence diagram based on engineer notes"""
    logger.info(f"Starting sequence edit (sequence: {len(request.FeatureSequence)} chars, notes: {len(request.engineer_notes)} chars)")

    # Validate input
    if not request.FeatureSequence.strip():
        logger.warning("Sequence edit rejected: empty sequence")
        raise HTTPException(status_code=400, detail="Sequence cannot be empty")
    if not request.engineer_notes.strip():
        logger.warning("Sequence edit rejected: empty engineer notes")
        raise HTTPException(status_code=400, detail="Engineer notes cannot be empty")

    template = load_prompt("Sequence-Edit.txt")
    prompt = template.format(
        Sequence=request.FeatureSequence,
        engineer_notes=request.engineer_notes
    )
    
    try:
        logger.info("Calling Gemini API for edit...")
        raw_response, usage = await ask_gemini(prompt)
        clean_mermaid = extract_mermaid_from_response(raw_response)
        if not clean_mermaid:
            raise HTTPException(status_code=500, detail="Invalid Mermaid response from AI")
    except HTTPException as e:
        logger.error(f"HTTP error during Sequence edit: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during Sequence edit: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info("Sequence edited successfully")
    return clean_mermaid, usage
