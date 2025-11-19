"""Features Controller - Business logic for feature generation and management"""
from fastapi import HTTPException
from controllers.gemini import ask_gemini
from controllers.llm_proxy import proxy
from models.overview import RequirementsRequest
from models.features import Feature, FeatureList, DetailedFeature, DetailedFeatureList, DetailedFeatureRequest,SingleDetailedFeatureRequest,DetailedSingleFeature
from models.prd import SystemPRD
from models.usage import UsageMetrics
from utils.json_utils import extract_json_from_response
from utils.prompt_loader import load_prompt
from string import Template
import json
import logging

logger = logging.getLogger(__name__)


async def generate_features(request: RequirementsRequest) -> tuple[FeatureList, UsageMetrics]:
    """Generate initial feature suggestions from project description"""
    logger.info(f"Starting features generation (description: {len(request.project_description)} chars)")

    # Build Prompt
    template = load_prompt("Features-Generate.txt")
    template = Template(template)
    prompt = template.substitute(project_description=request.project_description)

    try:
        logger.info("Calling Gemini API...")
        raw_response, usage = await ask_gemini(prompt)

        logger.info("Extracting JSON from response...")
        json_str = extract_json_from_response(raw_response)

        if not json_str:
            logger.error("No valid JSON found in Gemini response")
            raise HTTPException(status_code=500, detail="No valid JSON found in Gemini response")

    except HTTPException as e:
        logger.error(f"HTTP error during features generation: {e.status_code} - {e.detail}")
        raise e
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error during features generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Invalid JSON response from AI")
    except Exception as e:
        logger.error(f"Unexpected error during features generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info(f"Features generated successfully (JSON: {len(json_str)} chars)")
    return FeatureList(**json.loads(json_str)), usage


async def generate_detailed_features(request: DetailedFeatureRequest) -> tuple[DetailedFeatureList, UsageMetrics]:
    """Generate detailed information for each feature"""
    logger.info(f"Starting detailed features generation (features count: {len(request.features)})")

    # Build Prompt
    template = load_prompt("Detailed-Features-Generate.txt")
    template = Template(template)
    
    # Convert list of Feature objects to JSON-serializable dict
    features_list = [feature.model_dump() for feature in request.features]
    features_json = json.dumps(features_list, indent=2, ensure_ascii=False)

    prompt = template.substitute(
        overview=request.overview,
        features=features_json
    )

    try:
        logger.info("Calling Gemini API...")
        raw_response, usage = await proxy(prompt)

        logger.info("Extracting JSON from response...")
        json_str = extract_json_from_response(raw_response)

        if not json_str:
            logger.error("No valid JSON found in Gemini response")
            logger.error(f"Raw response: {raw_response[:500]}...")  # Log first 500 chars
            raise HTTPException(
                status_code=500,
                detail="No valid JSON found in Gemini response"
            )

    except HTTPException as e:
        logger.error(f"HTTP error during detailed features generation: {e.status_code} - {e.detail}")
        raise e
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Invalid JSON response from AI")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info(f"Detailed features generated successfully (JSON: {len(json_str)} chars)")
    return DetailedFeatureList(**json.loads(json_str)), usage

async def generate_single_feature_details(request:SingleDetailedFeatureRequest) -> tuple[DetailedSingleFeature, UsageMetrics]:
    logger.info(f"Generating details for single feature with PRD context: {request.feature.name}")

    template = load_prompt("Detailed-SingleFeatures-Generate.txt")
    template = Template(template)

    prompt = template.substitute(
        feature=json.dumps(request.feature.dict(), indent=2, ensure_ascii=False),
        prd=request.prd
    )

    try:
        raw_response ,usage= await proxy(prompt)
        json_str = extract_json_from_response(raw_response)
        logger.info(f"Raw AI response: {raw_response}")


        if not json_str:
            raise HTTPException(status_code=500, detail="No valid JSON in AI response")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected AI error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

    detailed = DetailedSingleFeature(**json.loads(json_str))
    return detailed, usage
