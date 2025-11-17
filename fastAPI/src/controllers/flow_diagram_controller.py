"""Flow Diagram Controller - Business logic for flow diagram generation"""
from fastapi import HTTPException
from controllers.gemini import ask_gemini
from models.features import FeatureList
from models.usage import UsageMetrics
from utils.prompt_loader import load_prompt
from string import Template
import json
import logging

logger = logging.getLogger(__name__)


async def generate_flow(request: FeatureList) -> tuple[str, UsageMetrics]:
    """Generate flow diagram from features"""
    logger.info("Starting flow diagram generation")

    # Build prompt
    template = load_prompt("FlowDiagram-Generate.txt")
    template = Template(template)
    prompt = template.substitute(features=request.features)

    try:
        logger.info("Calling Gemini API...")
        raw_response, usage = await ask_gemini(prompt)
        clean = raw_response.replace("\\n", "\n").replace("//n", "\n")

    except HTTPException as e:
        logger.error(f"HTTP error during flow generation: {e.status_code} - {e.detail}")
        raise e
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error during flow generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Invalid JSON response from AI")
    except Exception as e:
        logger.error(f"Unexpected error during flow generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info("Flow diagram generated successfully")
    return clean, usage
