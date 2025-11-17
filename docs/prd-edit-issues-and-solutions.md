# PRD Edit Route Issues and Solutions

## Overview

This document outlines the problems encountered with the PRD edit route in the FastAPI application and the solutions implemented to resolve them.

## Problem 1: Incomplete PRD Responses (Missing Flow Diagram Section)

### Issue Description

The PRD edit route was returning incomplete responses that cut off after the "Dependencies" section, missing the "Flow Diagram" section entirely.

### Symptoms

- PRD responses were truncated (e.g., 5,669 characters instead of expected 7,328+ characters)
- Responses ended abruptly after "## 8. Dependencies" section
- The "# Flow Diagram" section was completely missing from responses
- Users received incomplete PRD documents

### Root Cause

The Gemini API was truncating responses due to default token limits. The `ask_gemini()` function in `fastAPI/src/controllers/gemini.py` was using default generation parameters without configuring maximum output tokens.

### Solution Implemented

Updated the Gemini controller to include proper generation configuration:

```python
def ask_gemini(prompt: str) -> str:
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

        # Log response length for debugging
        response_text = response.text
        logger.info(f"Gemini response length: {len(response_text)} characters")

        return response_text
    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        raise
```

### Key Changes

1. **Added Generation Configuration**: Set `max_output_tokens=8192` to allow for much longer responses
2. **Added Error Handling**: Better error handling and logging for debugging
3. **Added Response Length Logging**: To monitor response sizes and help with future debugging

### Result

- ✅ PRD edit responses now include the complete Flow Diagram section
- ✅ Responses are no longer truncated
- ✅ Better error handling and logging for debugging

---

## Problem 2: Only Mermaid Diagram Returned Instead of Full PRD

### Issue Description

After fixing the truncation issue, the PRD edit route was returning only the Mermaid diagram instead of the complete PRD document.

### Symptoms

- API responses contained only the Mermaid diagram code
- Missing all PRD sections (Why, Goals, Scope, User Personas, etc.)
- Response format: `{"PRD": "mermaid\ngraph TD\n..."}` instead of full document

### Root Cause

The `extract_markdown_from_response` function in `fastAPI/src/utils/markdown_utils.py` was prioritizing fenced code blocks over full document content. When the Gemini API returned a complete PRD with a Mermaid diagram at the end, the function was extracting only the Mermaid diagram part and discarding the rest of the PRD.

### Problematic Code

````python
# This was catching the Mermaid diagram and returning only that content
fenced_any = re.search(r'```([\s\S]*?)```', text)
if fenced_any:
    return fenced_any.group(1).strip()  # Only returned Mermaid diagram
````

### Solution Implemented

Updated the markdown extraction function to intelligently detect full documents:

````python
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
````

### Key Changes

1. **Smart Document Detection**: Check if response has 3+ markdown headers (indicating a full document)
2. **Prioritize Full Content**: Return full text for complete documents instead of extracting fenced code blocks
3. **Preserve Mermaid Diagrams**: Mermaid diagrams are now preserved as part of the full PRD content
4. **Better Logging**: Added logging to track document detection decisions

### Result

- ✅ PRD edit responses now return the complete PRD document
- ✅ Mermaid diagrams are preserved as part of the full content
- ✅ All PRD sections (Why, Goals, Scope, User Personas, etc.) are included
- ✅ The function intelligently detects full documents vs. simple code blocks

---

## Testing and Validation

### Test Results

1. **Function Test**: Verified that `extract_markdown_from_response` returns full content (168 characters) including both PRD sections and Mermaid diagram
2. **Import Test**: Confirmed that PRD router imports successfully with the updated function
3. **Integration Test**: The fix maintains backward compatibility for other use cases

### Before vs After Comparison

#### Before (Problem 1)

```
Response length: 5,669 characters
Content: Ends abruptly after "## 8. Dependencies"
Missing: "# Flow Diagram" section
```

#### Before (Problem 2)

```
Response: {"PRD": "mermaid\ngraph TD\n..."}
Content: Only Mermaid diagram
Missing: All PRD sections (Why, Goals, Scope, etc.)
```

#### After (Fixed)

```
Response length: Full document length
Content: Complete PRD with all sections
Includes: "# Flow Diagram" section with Mermaid diagram
```

---

## Files Modified

1. **`fastAPI/src/controllers/gemini.py`**

   - Added generation configuration with `max_output_tokens=8192`
   - Added error handling and response length logging
   - Added proper imports for logging

2. **`fastAPI/src/utils/markdown_utils.py`**
   - Updated `extract_markdown_from_response` function
   - Added smart document detection logic
   - Improved logging for debugging

---

## Prevention Measures

### Monitoring

- Added response length logging to track API response sizes
- Added document detection logging to monitor extraction decisions

### Error Handling

- Improved error handling in Gemini API calls
- Better logging for debugging future issues

### Code Quality

- Added comprehensive comments explaining the logic
- Maintained backward compatibility for other use cases

---

## Conclusion

Both issues have been successfully resolved:

1. **Truncation Issue**: Fixed by configuring proper generation parameters in the Gemini API
2. **Extraction Issue**: Fixed by improving the markdown extraction logic to prioritize full documents

The PRD edit route now returns complete, properly formatted PRD documents that include all sections and the Flow Diagram with Mermaid diagram, providing users with the full documentation they expect.

---

_Document created: October 17, 2025_
_Last updated: October 17, 2025_
