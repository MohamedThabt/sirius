import json
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)


def repair_json(json_str: str) -> str:
    """Attempt to repair common JSON errors from AI responses."""
    try:
        # Remove any control characters except newlines and tabs
        json_str = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', json_str)
        
        # Fix trailing commas before closing brackets/braces (common AI error)
        json_str = re.sub(r',(\s*[\]\}])', r'\1', json_str)
        
        # Fix missing commas between array elements or object properties
        # Pattern: } or ] followed by whitespace and then { or " (start of next element)
        json_str = re.sub(r'(\})\s*(\{)', r'\1,\2', json_str)
        json_str = re.sub(r'(\])\s*(\[)', r'\1,\2', json_str)
        json_str = re.sub(r'(\})\s*(")', r'\1,\2', json_str)
        json_str = re.sub(r'(")\s*\n\s*(")', r'\1,\n\2', json_str)
        
        # Fix missing comma after string values before next property
        # Pattern: "value" followed by newline/whitespace and then "key":
        json_str = re.sub(r'("\s*)\n(\s*"[^"]+"\s*:)', r'\1,\n\2', json_str)
        
        # Fix unescaped newlines inside string values - this is tricky
        # We need to be careful not to break actual JSON structure
        
        # Try to fix truncated JSON by closing open structures
        open_braces = json_str.count('{') - json_str.count('}')
        open_brackets = json_str.count('[') - json_str.count(']')
        
        if open_braces > 0 or open_brackets > 0:
            # Check if the JSON seems truncated
            json_str = json_str.rstrip()
            if not json_str.endswith('}') and not json_str.endswith(']'):
                # Remove incomplete last element if it looks like one
                json_str = re.sub(r',?\s*"[^"]*"?\s*:?\s*[^,\}\]]*$', '', json_str)
            
            # Close open structures
            json_str += ']' * open_brackets + '}' * open_braces
        
        return json_str
    except Exception as e:
        logger.warning(f"Error during JSON repair: {str(e)}")
        return json_str


def extract_json_from_response(raw_response: str) -> Optional[str]:
    """Attempt to extract valid JSON from a response that may contain markdown or extra text."""
    try:
        # Remove markdown code block delimiters (```json and ```)
        json_str = raw_response.strip()
        if json_str.startswith("```json"):
            json_str = json_str.replace("```json", "", 1).strip()
        if json_str.startswith("```"):
            json_str = json_str.replace("```", "", 1).strip()
        if json_str.endswith("```"):
            json_str = json_str.rsplit("```", 1)[0].strip()

        # Use regex to match the JSON object, accounting for nested structures
        json_match = re.search(r'\{[\s\S]*\}', json_str)
        if json_match:
            extracted = json_match.group(0)
            
            # Try to parse as-is first
            try:
                json.loads(extracted)
                return extracted
            except json.JSONDecodeError:
                # Try repairing the JSON
                logger.info("Initial JSON parse failed, attempting repair...")
                repaired = repair_json(extracted)
                try:
                    json.loads(repaired)
                    logger.info("JSON repair successful")
                    return repaired
                except json.JSONDecodeError as e:
                    logger.warning(f"JSON repair failed: {str(e)}")
                    # Return the repaired version anyway, let the caller handle the error
                    return repaired
        
        logger.warning("No valid JSON object found in response")
        return None
    except Exception as e:
        logger.warning(f"Failed to extract JSON: {str(e)}")
        return None
