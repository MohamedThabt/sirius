import logging
from models.usage import UsageMetrics
from openai import AsyncOpenAI
from dotenv import load_dotenv
load_dotenv()

client = AsyncOpenAI(
    api_key="any key",
    base_url="http://localhost:4000"
)

logger = logging.getLogger(__name__)

async def proxy(prompt: str) -> tuple[str, UsageMetrics]:
    """
    Call Gemini API via LiteLLM proxy and track token usage.
    
    Args:
        prompt: The input prompt
        
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
            model="gem2.5f",
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
        
    except Exception as e:
        logger.error(f"Error calling Gemini via LiteLLM proxy: {str(e)}")
        raise
