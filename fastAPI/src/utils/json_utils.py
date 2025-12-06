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
        
        # Try to fix truncated JSON by closing open structures
        open_braces = json_str.count('{') - json_str.count('}')
        open_brackets = json_str.count('[') - json_str.count(']')
        
        if open_braces > 0 or open_brackets > 0:
            json_str = json_str.rstrip()
            
            # Check for unterminated strings (odd number of unescaped quotes)
            # Count quotes that are not escaped
            quote_count = 0
            i = 0
            while i < len(json_str):
                if json_str[i] == '"' and (i == 0 or json_str[i-1] != '\\'):
                    quote_count += 1
                i += 1
            
            # If odd number of quotes, we have an unterminated string
            if quote_count % 2 == 1:
                logger.info("Detected unterminated string, attempting to close it")
                # Find the last unescaped quote position
                last_quote_pos = -1
                i = len(json_str) - 1
                while i >= 0:
                    if json_str[i] == '"' and (i == 0 or json_str[i-1] != '\\'):
                        last_quote_pos = i
                        break
                    i -= 1
                
                if last_quote_pos != -1:
                    # Truncate content after last quote start and close the string
                    # Look for a sensible truncation point (sentence end, or just trim)
                    remaining = json_str[last_quote_pos+1:]
                    # Try to find last complete sentence or phrase
                    truncation_points = ['. ', '.\n', '.\r', ', ', ',\n', '; ', '- ']
                    best_truncation = len(remaining)
                    for point in truncation_points:
                        idx = remaining.rfind(point)
                        if idx != -1 and idx < best_truncation:
                            best_truncation = idx + len(point.rstrip())
                    
                    # If we found a good truncation point, use it; otherwise just close the string
                    if best_truncation < len(remaining):
                        json_str = json_str[:last_quote_pos+1] + remaining[:best_truncation] + '"'
                    else:
                        # Just remove the partial content and close
                        json_str = json_str[:last_quote_pos+1] + remaining.rstrip() + '..."'
            
            # Remove trailing commas or colons before we close structures
            json_str = json_str.rstrip()
            json_str = re.sub(r'[,:]\s*$', '', json_str)
            
            # Recalculate after potential modifications
            open_braces = json_str.count('{') - json_str.count('}')
            open_brackets = json_str.count('[') - json_str.count(']')
            
            # Close open structures
            json_str += ']' * open_brackets + '}' * open_braces
            logger.info(f"Closed {open_brackets} brackets and {open_braces} braces")
        
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
            except json.JSONDecodeError as e:
                # Log helpful debug info about the parse error
                error_pos = e.pos if hasattr(e, 'pos') else 0
                logger.info(f"Initial JSON parse failed at position {error_pos}: {e.msg}")
                
                # Show snippet around error position
                start = max(0, error_pos - 50)
                end = min(len(extracted), error_pos + 50)
                snippet = extracted[start:end]
                logger.info(f"Context around error: ...{snippet}...")
                
                # Try repairing the JSON
                logger.info("Attempting JSON repair...")
                repaired = repair_json(extracted)
                try:
                    json.loads(repaired)
                    logger.info("JSON repair successful")
                    return repaired
                except json.JSONDecodeError as repair_error:
                    logger.warning(f"JSON repair failed at position {repair_error.pos if hasattr(repair_error, 'pos') else 0}: {repair_error.msg}")
                    # Return the repaired version anyway, let the caller handle the error
                    return repaired
        
        logger.warning("No valid JSON object found in response")
        return None
    except Exception as e:
        logger.warning(f"Failed to extract JSON: {str(e)}")
        return None
