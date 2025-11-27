"""ERD Controller - Business logic for Entity Relationship Diagram generation"""
from fastapi import HTTPException
from controllers.gemini import ask_gemini
from models.ERD import ERDrequest, FeatureERD, EditERDRequest, MergeERDRequest, ProjectERD
from models.usage import UsageMetrics
from utils.mermaid_utils import extract_mermaid_from_response
from utils.prompt_loader import load_prompt
from string import Template
import json
import logging

logger = logging.getLogger(__name__)


async def generate_feature_erd(request: ERDrequest) -> tuple[str, UsageMetrics]:
    """Generate ERD for a specific feature"""
    logger.info(f"Starting ERD for feature: {request.feature.name}")

    # Build Prompt
    template = load_prompt("ERD-GenerateV2.txt")
    template = Template(template)
    prompt = template.substitute(prd=request.prd, DetailedFeature=request.feature)

    try:
        logger.info("Calling Gemini API...")
        raw_response, usage = await ask_gemini(prompt)
        clean_mermaid = extract_mermaid_from_response(raw_response)
        if not clean_mermaid:
            raise HTTPException(status_code=500, detail="Invalid Mermaid response from AI")

    except HTTPException as e:
        logger.error(f"HTTP error during ERD generation: {e.status_code} - {e.detail}")
        raise e
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error during ERD generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Invalid JSON response from AI")
    except Exception as e:
        logger.error(f"Unexpected error during ERD generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info(f"ERD generated successfully : {clean_mermaid}")
    logger.info(f"erd inputs:, feature: {request.feature}")
    return clean_mermaid, usage


async def edit_feature_erd(request: EditERDRequest) -> tuple[str, UsageMetrics]:
    """Edit existing ERD based on engineer notes"""
    logger.info(f"Starting ERD edit (ERD: {len(request.FeatureERD)} chars, notes: {len(request.engineer_notes)} chars)")

    # Validate input
    if not request.FeatureERD.strip():
        logger.warning("ERD edit rejected: empty ERD")
        raise HTTPException(status_code=400, detail="System ERD cannot be empty")
    if not request.engineer_notes.strip():
        logger.warning("ERD edit rejected: empty engineer notes")
        raise HTTPException(status_code=400, detail="Engineer notes cannot be empty")

    # Build prompt
    template = load_prompt("ERD-Edit.txt")
    prompt = template.format(
        ERD=request.FeatureERD,
        engineer_notes=request.engineer_notes
    )
    
    # Call Gemini API
    try:
        logger.info("Calling Gemini API for edit...")
        raw_response, usage = await ask_gemini(prompt)
        clean_mermaid = extract_mermaid_from_response(raw_response)
        if not clean_mermaid:
            raise HTTPException(status_code=500, detail="Invalid Mermaid response from AI")

    except HTTPException as e:
        logger.error(f"HTTP error during ERD edit: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during ERD edit: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    # Return response
    logger.info(f"ERD edited successfully")
    return clean_mermaid, usage


async def merge_feature_erds(request: MergeERDRequest) -> tuple[str, UsageMetrics]:
    """Merge multiple feature ERDs into a project ERD"""
    logger.info("Starting ERD merge for project")

    # Build prompt
    template = load_prompt("ERD-Merge.txt")
    template = Template(template)

    # Convert list of MergeERD to JSON string
    features_json = json.dumps(
        [{"name": f.feature_name, "ERD": f.erd} for f in request.merge],
        indent=2
    )

    prompt = template.substitute(features_erds=features_json)

    logger.info(f"Prompt to LLM:\n{prompt}")

    try:
        logger.info("Calling Gemini API for merge...")
        raw_response, usage = await ask_gemini(prompt)
        clean_mermaid = extract_mermaid_from_response(raw_response)
        if not clean_mermaid:
            raise HTTPException(status_code=500, detail="Invalid Mermaid response from AI")
    except HTTPException as e:
        logger.error(f"HTTP error during ERD merge: {e.status_code} - {e.detail}")
        raise e
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error during ERD merge: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Invalid JSON response from AI")
    except Exception as e:
        logger.error(f"Unexpected error during ERD merge: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info("Project ERD merged successfully")
    return clean_mermaid, usage
