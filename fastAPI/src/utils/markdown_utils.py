import json
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

def extract_markdown_from_response(raw_response: str) -> Optional[str]:
    """Attempt to extract Markdown content from a response.
    
    For PRD/Overview responses, prioritize returning the full content if it contains
    markdown-like constructs, rather than extracting fenced code blocks.
    """
    try:
        text = raw_response.strip()

        # 1) First, check if response is wrapped in markdown code blocks and extract content
        # This handles cases where AI wraps the entire response in ```markdown ... ```
        fenced_md = re.search(r'^```(?:markdown)?\s*\n([\s\S]*?)\n```\s*$', text, re.IGNORECASE | re.MULTILINE)
        if fenced_md:
            extracted = fenced_md.group(1).strip()
            logger.info("Extracted content from markdown code block")
            return extracted

        # 2) Check for any fenced code block (fallback for other language tags)
        fenced_any = re.search(r'^```[^\n]*\n([\s\S]*?)\n```\s*$', text, re.MULTILINE)
        if fenced_any:
            extracted = fenced_any.group(1).strip()
            logger.info("Extracted content from code block")
            return extracted

        # 3) Check if this looks like a full document with markdown structure
        # If it has multiple markdown headers and other content, return the full text
        md_indicators = re.search(r'(^|\n)#{1,6}\s+|\n[-*+]\s+|\[.+?\]\(.+?\)|\*\*.+?\*\*|`.+?`', text)
        if md_indicators:
            # Count markdown headers to determine if this is a full document
            header_count = len(re.findall(r'^#{1,6}\s+', text, re.MULTILINE))
            if header_count >= 3:  # If it has 3+ headers, it's likely a full document
                logger.info(f"Detected full document with {header_count} headers, returning full content")
                return text

        # 4) If we have markdown-like constructs but not enough headers, return full text
        if md_indicators:
            return text

        logger.warning("No markdown content detected in response")
        return None
    except Exception as e:
        logger.warning(f"Failed to extract markdown: {str(e)}")
        return None