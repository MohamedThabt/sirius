import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

def extract_mermaid_from_response(raw_response: str) -> Optional[str]:
    """
    Extracts Mermaid erDiagram code from a response that may contain markdown or extra text.
    Returns only the code block content.
    """
    try:
        # Remove markdown code block delimiters (```mermaid and ```)
        mermaid_str = raw_response.strip()
        if mermaid_str.startswith("```mermaid"):
            mermaid_str = mermaid_str.replace("```mermaid", "", 1).strip()
        if mermaid_str.endswith("```"):
            mermaid_str = mermaid_str.rsplit("```", 1)[0].strip()

        # Find the erDiagram block
        match = re.search(r'((?:erDiagram|sequenceDiagram|typescript|stateDiagram)[\s\S]*)', mermaid_str)
        if match:
            return match.group(1).strip()
        logger.warning("No valid Mermaid erDiagram found in response")
        return None
    except Exception as e:
        logger.warning(f"Failed to extract Mermaid: {str(e)}")
        return None