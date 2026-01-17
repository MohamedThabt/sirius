import logging
import os
from dotenv import load_dotenv
from models.usage import UsageMetrics
from openai import AsyncOpenAI, AuthenticationError

# Load environment variables from .env file
load_dotenv()

# Default to Docker service name (production), set LITELLM_BASE_URL=http://localhost:4000 for local dev
LITELLM_BASE_URL = os.getenv("LITELLM_BASE_URL", "http://litellm-proxy:4000")

client = AsyncOpenAI(
    api_key="any key",
    base_url=LITELLM_BASE_URL
)

logger = logging.getLogger(__name__)

async def proxy(prompt: str, model: str = "gem2.5f") -> tuple[str, UsageMetrics]:
    """
    Call Gemini API via LiteLLM proxy and track token usage.
    model: The model name to use (defaults to gem2.5f)
    
    Args:
        prompt: The input prompt
        model: The model name to use (defaults to gem2.5f)
        
    Returns:
        Tuple of (response_text, usage_metrics)
    """

    messages = [
        {
            "role": "user",
            "content": prompt
        }
    ]

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            top_p=0.8
        )
        
        # Get response text
        response_text = response.choices[0].message.content
        
        # Extract token usage
        input_tokens = response.usage.prompt_tokens
        output_tokens = response.usage.completion_tokens
        
        # Create usage metrics
        metrics = UsageMetrics(
            model_name=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost=0.0
        )
        
        # Log usage
        logger.info(
            f"Gemini response via proxy - {len(response_text)} chars, "
            f"Tokens: {input_tokens + output_tokens} (input: {input_tokens}, output: {output_tokens})"
        )
        
        return response_text, metrics
        
    except AuthenticationError as e:
        logger.error(f"Authentication failed for model '{model}': Invalid API key")
        raise
    except Exception as e:
        logger.error(f"LLM proxy error for model '{model}'")
        raise
