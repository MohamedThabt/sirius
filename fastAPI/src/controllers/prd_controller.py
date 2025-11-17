"""PRD Controller - Business logic for Product Requirements Document generation"""
from fastapi import HTTPException
from controllers.gemini import ask_gemini
from models.prd import SystemPRD, EditPRDRequest, PRDWithFlowRequest, PRDWithFlowResponse
from models.usage import UsageMetrics
from utils.prompt_loader import load_prompt
from utils.markdown_utils import extract_markdown_from_response
from string import Template
import logging

logger = logging.getLogger(__name__)


async def generate_prd_with_flow(request: PRDWithFlowRequest) -> tuple[PRDWithFlowResponse, UsageMetrics]:
    """Generate combined PRD and Flow diagram"""
    logger.info(f"Starting combined PRD + Flow generation: project_name='{request.project_name}'")
    try:
        # Generate PRD
        prd_content, prd_usage = await build_prd(
            overview=request.overview,
            project_name=request.project_name,
            author=request.author,
            date=request.date,
            version=request.version
        )

        # Generate Flow Diagram
        flow_content, flow_usage = await build_flow(features=request.features)

        # Combine usage metrics - sum the tokens
        combined_usage = UsageMetrics(
            input_tokens=prd_usage.input_tokens + flow_usage.input_tokens,
            output_tokens=prd_usage.output_tokens + flow_usage.output_tokens,
            cost=0.0
        )

        # Combination
        combined_content = f"# PRD Document\n\n{prd_content}\n\n# Flow Diagram\n\n{flow_content}"
        logger.info(f"Combined content created successfully (total: {len(combined_content)} chars)")
        logger.info(f"Combined usage - Input: {combined_usage.input_tokens}, Output: {combined_usage.output_tokens}")

    except HTTPException as e:
        logger.error(f"HTTP error during combined PRD + Flow generation: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during combined PRD + Flow generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info(f"Combined PRD + Flow generation completed successfully")
    return {"combined_file": combined_content}, combined_usage


async def build_prd(overview: str, project_name: str, author: str, date: str, version: str) -> tuple[str, UsageMetrics]:
    """Build PRD content"""
    logger.info("Building PRD...")
    template = load_prompt("PRD-Generate.txt")
    prompt = template.format(
        overview=overview,
        project_name=project_name,
        author=author,
        date=date,
        version=version
    )
    try:
        logger.info("Calling Gemini API for PRD build...")
        response, usage = await ask_gemini(prompt)
    except HTTPException as e:
        logger.error(f"HTTP error during PRD build: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during PRD build: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during PRD build")

    # Clean response: prefer extracted markdown, otherwise keep raw response
    cleaned = extract_markdown_from_response(response) or response
    logger.info(f"PRD content built successfully ({len(cleaned)} chars)")
    return cleaned, usage


async def build_flow(features: str) -> tuple[str, UsageMetrics]:
    """Build flow diagram content"""
    logger.info("Building flow diagram...")
    template = load_prompt("FlowDiagram-Generate.txt")
    template = Template(template)
    prompt = template.substitute(features=features)

    try:
        logger.info("Calling Gemini API for flow diagram build...")
        response, usage = await ask_gemini(prompt)
    except HTTPException as e:
        logger.error(f"HTTP error during flow diagram build: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during flow diagram build: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during flow diagram build")

    processed_response = response.replace("\\n", "\n").replace("//n", "\n")
    logger.info(f"Flow diagram built successfully ({len(processed_response)} chars)")
    return processed_response, usage


async def edit_prd(request: EditPRDRequest) -> tuple[str, UsageMetrics]:
    """Edit existing PRD based on engineer notes"""
    logger.info(f"Starting PRD edit (PRD: {len(request.system_PRD)} chars, notes: {len(request.engineer_notes)} chars)")

    # Validate input
    if not request.system_PRD.strip():
        logger.warning("PRD edit rejected: empty PRD")
        raise HTTPException(status_code=400, detail="PRD cannot be empty")
    if not request.engineer_notes.strip():
        logger.warning("PRD edit rejected: empty engineer notes")
        raise HTTPException(status_code=400, detail="Engineer notes cannot be empty")

    # Construct prompt with PRD and engineer notes
    template = load_prompt("PRD-Edit.txt")
    prompt = template.format(
        system_PRD=request.system_PRD,
        engineer_notes=request.engineer_notes
    )

    try:
        logger.info("Calling Gemini API for edit...")
        revised_response, usage = await ask_gemini(prompt)
    except HTTPException as e:
        logger.error(f"HTTP error during PRD edit: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during PRD edit: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    cleaned = extract_markdown_from_response(revised_response) or revised_response
    logger.info(f"PRD edited successfully (response: {len(cleaned)} chars)")
    return cleaned, usage
