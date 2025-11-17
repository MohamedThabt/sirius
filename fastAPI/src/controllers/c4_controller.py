"""C4 Controller - Business logic for C4 model generation"""
from fastapi import HTTPException
from controllers.gemini import ask_gemini
from models.C4 import C4Request, EditC4Request
from models.usage import UsageMetrics
from utils.json_utils import extract_json_from_response
from utils.prompt_loader import load_prompt
from string import Template
import json
import logging

logger = logging.getLogger(__name__)


async def generate_c4(request: C4Request) -> tuple[str, UsageMetrics]:
    """Generate C4 diagram from PRD"""
    logger.info("Starting C4 generation")

    # Build Prompt
    template = load_prompt("C4-Generate.txt")
    template = Template(template)

    prompt = template.substitute(SystemPRD=request.SystemPRD)

    try:
        logger.info("Calling Gemini API...")
        raw_response, usage = await ask_gemini(prompt)

    except HTTPException as e:
        logger.error(f"HTTP error during C4 generation: {e.status_code} - {e.detail}")
        raise e
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error during C4 generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Invalid JSON response from AI")
    except Exception as e:
        logger.error(f"Unexpected error during C4 generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info("C4 generated successfully")
    c4_json = extract_json_from_response(raw_response)
    return c4_json, usage


async def edit_c4(request: EditC4Request) -> tuple[str, UsageMetrics]:
    """Edit existing C4 diagram based on engineer notes"""
    logger.info("Starting C4 edit")

    # Build Prompt
    template = load_prompt("C4-Edit.txt")
    template = Template(template)

    prompt = template.substitute(
        SystemC4=request.SystemC4,
        engineer_notes=request.engineer_notes
    )

    try:
        logger.info("Calling Gemini API...")
        raw_response, usage = await ask_gemini(prompt)

    except HTTPException as e:
        logger.error(f"HTTP error during C4 edit: {e.status_code} - {e.detail}")
        raise e
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error during C4 edit: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Invalid JSON response from AI")
    except Exception as e:
        logger.error(f"Unexpected error during C4 edit: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info("C4 edited successfully")
    c4_json = extract_json_from_response(raw_response)
    return c4_json, usage
