import json
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

def extract_markdown_from_response(raw_response: str) -> Optional[str]:
    """Attempt to extract Markdown content from a response.
    
    For PRD responses, prioritize returning the full content if it contains
    markdown-like constructs, rather than extracting fenced code blocks.
    """
    try:
        text = raw_response.strip()

        # 1) Check if this looks like a full PRD/document with markdown structure
        # If it has multiple markdown headers and other content, return the full text
        md_indicators = re.search(r'(^|\n)#{1,6}\s+|\n[-*+]\s+|\[.+?\]\(.+?\)|\*\*.+?\*\*|`.+?`', text)
        if md_indicators:
            # Count markdown headers to determine if this is a full document
            header_count = len(re.findall(r'^#{1,6}\s+', text, re.MULTILINE))
            if header_count >= 3:  # If it has 3+ headers, it's likely a full document
                logger.info(f"Detected full document with {header_count} headers, returning full content")
                return text

        # 2) Prefer fenced markdown code block with optional "markdown" language tag
        fenced_md = re.search(r'```(?:markdown)?\n([\s\S]*?)\n```', text, re.IGNORECASE)
        if fenced_md:
            return fenced_md.group(1).strip()

        # 3) Fallback to any fenced code block content (but only if no full document detected)
        fenced_any = re.search(r'```([\s\S]*?)```', text)
        if fenced_any:
            return fenced_any.group(1).strip()

        # 4) If we have markdown-like constructs but not enough headers, return full text
        if md_indicators:
            return text

        logger.warning("No markdown content detected in response")
        return None
    except Exception as e:
        logger.warning(f"Failed to extract markdown: {str(e)}")
        return None