"""Overview Controller - Business logic for system overview generation and editing"""
from fastapi import HTTPException
from controllers.llm_proxy import proxy
from models.overview import RequirementsRequest, SystemOverview, EditOverviewRequest
from models.usage import UsageMetrics
from utils.prompt_loader import load_prompt
from string import Template
import logging

logger = logging.getLogger(__name__)


async def generate_system_overview(request: RequirementsRequest) -> tuple[str, UsageMetrics]:
    """Generate system overview from project description"""
    logger.info(f"Starting overview generation (description: {len(request.project_description)} chars)")

    # Build prompt
    template = load_prompt("Overview-Generate.txt")
    template = Template(template)
    prompt = template.substitute(project_description=request.project_description)

    try:
        logger.info("Calling Gemini API...")
        raw_response, usage = await proxy(prompt)
    except HTTPException as e:
        logger.error(f"HTTP error during overview generation: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during overview generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info(f"Overview generated successfully (response: {len(raw_response)} chars)")
    return raw_response, usage


async def edit_system_overview(request: EditOverviewRequest) -> tuple[str, UsageMetrics]:
    """Edit existing system overview based on engineer notes"""
    logger.info(f"Starting overview edit (overview: {len(request.system_overview)} chars, notes: {len(request.engineer_notes)} chars)")

    # Validate input
    if not request.system_overview.strip():
        logger.warning("Overview edit rejected: empty system overview")
        raise HTTPException(status_code=400, detail="System overview cannot be empty")
    if not request.engineer_notes.strip():
        logger.warning("Overview edit rejected: empty engineer notes")
        raise HTTPException(status_code=400, detail="Engineer notes cannot be empty")

    # Build prompt
    template = load_prompt("Overview-Edit.txt")
    template = Template(template)
    prompt = template.substitute(
        system_overview=request.system_overview,
        engineer_notes=request.engineer_notes
    )

    # Call Gemini API
    try:
        logger.info("Calling Gemini API for edit...")
        revised_response, usage = await proxy(prompt)
    except HTTPException as e:
        logger.error(f"HTTP error during overview edit: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during overview edit: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info(f"Overview edited successfully (response: {len(revised_response)} chars)")
    return revised_response, usage
