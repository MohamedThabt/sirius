"""BRD Controller - Business logic for Business Requirements Document generation"""
from fastapi import HTTPException
from controllers.llm_proxy import proxy
from models.BRD import BRDRequest, SystemBRD, EditBRDRequest
from models.usage import UsageMetrics
from utils.prompt_loader import load_prompt
import logging

logger = logging.getLogger(__name__)


async def generate_brd(request: BRDRequest) -> tuple[str, UsageMetrics]:
    """Generate Business Requirements Document from overview"""
    logger.info(f"Starting BRD generation (overview: {len(request.overview)} chars)")

    template = load_prompt("BRD-Generate.txt")
    prompt = template.format(overview=request.overview)

    try:
        logger.info("Calling Gemini API...")
        raw, usage = await proxy(prompt)
    except HTTPException as e:
        logger.error(f"HTTP error during BRD generation: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during BRD generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=502, detail="LLM gateway error")

    logger.info(f"BRD generated successfully (response: {len(raw)} chars)")
    return raw, usage


async def edit_brd(request: EditBRDRequest) -> tuple[str, UsageMetrics]:
    """Edit existing BRD based on engineer notes"""
    logger.info(f"Starting BRD edit (BRD: {len(request.system_BRD)} chars, notes: {len(request.engineer_notes)} chars)")

    # Validate input
    if not request.system_BRD or not request.system_BRD.strip():
        logger.warning("BRD edit rejected: empty BRD")
        raise HTTPException(status_code=400, detail="BRD cannot be empty")
    if not request.engineer_notes or not request.engineer_notes.strip():
        logger.warning("BRD edit rejected: empty engineer notes")
        raise HTTPException(status_code=400, detail="Engineer notes cannot be empty")

    # Build prompt aligned with your BRD generation prompt and with the same guardrails
    template = load_prompt("BRD-Edit.txt")
    prompt = template.format(
        system_BRD=request.system_BRD,
        engineer_notes=request.engineer_notes
    )

    # Call Gemini (or your LLM client)
    try:
        revised_brd, usage = await proxy(prompt)
    except HTTPException as e:
        logger.error(f"HTTP error during BRD edit: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during BRD edit: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info(f"BRD edited successfully (response: {len(revised_brd)} chars)")
    return revised_brd, usage
