"""Wireframe Controller - Business logic for wireframe generation"""
from fastapi import HTTPException
from controllers.gemini import ask_gemini
from controllers.llm_proxy import proxy
from models.wireframe import WireframeRequest, EditWireframeRequest
from models.usage import UsageMetrics
from utils.json_utils import extract_json_from_response
from utils.prompt_loader import load_prompt
from string import Template
import json
import logging

logger = logging.getLogger(__name__)


async def generate_feature_wireframe(request: WireframeRequest) -> tuple[str, UsageMetrics]:
    """Generate wireframe for a specific feature"""
    logger.info(f"Starting wireframe for feature: {request.feature.name}")

    template = load_prompt("WireFrame-Generate.txt")
    template = Template(template)
    prompt = template.substitute(feature=request.feature, erd=request.erd)
    
    try:
        logger.info("Calling Gemini API...")
        raw_response, usage = await proxy(prompt)
        clean_json = extract_json_from_response(raw_response)
        if not clean_json:
            raise HTTPException(status_code=500, detail=f"Invalid JSON response from AI: {raw_response}")
    except HTTPException as e:
        logger.error(f"HTTP error during wireframe generation: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during wireframe generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info("Wireframe generated successfully")
    return clean_json, usage


async def edit_feature_wireframe(request: EditWireframeRequest) -> tuple[str, UsageMetrics]:
    """Edit existing wireframe based on engineer notes"""
    logger.info(f"Starting wireframe edit (wireframe: {len(request.FeatureWireframe)} chars, notes: {len(request.engineer_notes)} chars)")

    # Validate input
    if not request.FeatureWireframe.strip():
        logger.warning("Wireframe edit rejected: empty wireframe")
        raise HTTPException(status_code=400, detail="Wireframe cannot be empty")
    if not request.engineer_notes.strip():
        logger.warning("Wireframe edit rejected: empty engineer notes")
        raise HTTPException(status_code=400, detail="Engineer notes cannot be empty")

    template = load_prompt("Wireframe-Edit.txt")
    # Use string.Template.substitute because the prompt contains literal braces and ${...} placeholders
    template = Template(template)
    prompt = template.substitute(
        Wireframe=request.FeatureWireframe,
        engineer_notes=request.engineer_notes
    )
    
    try:
        logger.info("Calling Gemini API for edit...")
        raw_response, usage = await proxy(prompt)
        clean_json = extract_json_from_response(raw_response)
        if not clean_json:
            raise HTTPException(status_code=500, detail="Invalid JSON response from AI")
    except HTTPException as e:
        logger.error(f"HTTP error during wireframe edit: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during wireframe edit: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info(f"Wireframe edited successfully")
    return clean_json, usage
