import json
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

def extract_json_from_response(raw_response: str) -> Optional[str]:
    """Attempt to extract valid JSON from a response that may contain markdown or extra text."""
    try:
        # Remove markdown code block delimiters (```json and ```)
        json_str = raw_response.strip()
        if json_str.startswith("```json"):
            json_str = json_str.replace("```json", "", 1).strip()
        if json_str.endswith("```"):
            json_str = json_str.rsplit("```", 1)[0].strip()

        # Use regex to match the JSON object, accounting for nested structures
        json_match = re.search(r'\{[\s\S]*\}', json_str)
        if json_match:
            return json_match.group(0)
        logger.warning("No valid JSON object found in response")
        return None
    except Exception as e:
        logger.warning(f"Failed to extract JSON: {str(e)}")
        return None
