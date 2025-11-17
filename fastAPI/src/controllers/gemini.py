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
    """
    model = ai.GenerativeModel(MODEL_NAME)
    
    # Configure generation parameters to handle longer responses
    generation_config = ai.types.GenerationConfig(
        max_output_tokens=8192,  # Increase from default to handle longer responses
        temperature=0.7,
        top_p=0.8,
        top_k=40
    )
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        # Get response text
        response_text = response.text
        
        # Extract token usage from response
        usage_metadata = response.usage_metadata
        input_tokens = usage_metadata.prompt_token_count
        output_tokens = usage_metadata.candidates_token_count
        
        # Create usage metrics
        metrics = UsageMetrics(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost=0.0
        )
        
        # Log usage
        logger.info(
            f"{MODEL_NAME} response length: {len(response_text)} chars, "
            f"Tokens: {input_tokens + output_tokens} (input: {input_tokens}, output: {output_tokens})"
        )
        
        return response_text, metrics
        
    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        raise
