import google.generativeai as ai
import os
from dotenv import load_dotenv
import logging
from models.usage import UsageMetrics

load_dotenv()

API_KEY = os.getenv("GEMINI_KEY_2")
ai.configure(api_key=API_KEY)

MODEL_NAME = "gemini-2.5-flash"
logger = logging.getLogger(__name__)

async def ask_gemini(prompt: str) -> tuple[str, UsageMetrics]:
    """
    Call Gemini API and track token usage.
    
    Args:
        prompt: The input prompt
        
    Returns:
        Tuple of (response_text, usage_metrics)
        
    Raises:
        ValueError: If the response is blocked or truly empty
    """
    model = ai.GenerativeModel(MODEL_NAME)
    
    # Configure generation parameters to handle longer responses
    # Gemini 2.5 Flash supports up to 65,536 output tokens
    generation_config = ai.types.GenerationConfig(
        max_output_tokens=32768,  # Increased for complex feature details responses
        temperature=0.7,
        top_p=0.8,
        top_k=40
    )
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        # Get finish reason for diagnostics
        finish_reason = None
        if response.candidates:
            finish_reason = response.candidates[0].finish_reason
        
        # finish_reason mapping: 1 = STOP, 2 = MAX_TOKENS, 3 = SAFETY, 4 = RECITATION, 5 = OTHER
        reason_map = {1: "STOP", 2: "MAX_TOKENS", 3: "SAFETY", 4: "RECITATION", 5: "OTHER"}
        reason_name = reason_map.get(finish_reason, str(finish_reason))
        
        # Check if response has valid parts
        if not response.parts:
            error_msg = f"Gemini returned empty response (finish_reason={reason_name}). Try simplifying the prompt or retry."
            logger.warning(error_msg)
            raise ValueError(error_msg)
        
        # Get response text
        response_text = response.text
        
        # Log warning if response was truncated due to MAX_TOKENS
        if finish_reason == 2:  # MAX_TOKENS
            logger.warning(
                f"Response was truncated due to MAX_TOKENS limit. "
                f"Response length: {len(response_text)} chars. "
                f"The JSON repair utility will attempt to fix the truncated response."
            )
        
        # Extract token usage from response
        usage_metadata = response.usage_metadata
        input_tokens = usage_metadata.prompt_token_count
        output_tokens = usage_metadata.candidates_token_count
        
        # Create usage metrics
        metrics = UsageMetrics(
            model_name="gem2.5f",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost=0.0
        )
        
        # Log usage
        logger.info(
            f"{MODEL_NAME} response (finish_reason={reason_name}): {len(response_text)} chars, "
            f"Tokens: {input_tokens + output_tokens} (input: {input_tokens}, output: {output_tokens})"
        )
        
        return response_text, metrics
        
    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        raise

