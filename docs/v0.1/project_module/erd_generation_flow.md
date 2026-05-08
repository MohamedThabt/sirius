# ERD Generation Flow Documentation

## Overview

This document explains the complete flow for generating Entity Relationship Diagrams (ERD) for project modules in Sirius, including the context requirements, validation strategy, prompt design rationale, and why we chose **validation with regeneration** over **chain-of-thought** approaches.

---

## Table of Contents

1. [High-Level Flow](#high-level-flow)
2. [Context Requirements](#context-requirements)
3. [Validation Strategy](#validation-strategy)
4. [Prompt Design](#prompt-design)
5. [Why No Chain-of-Thought](#why-no-chain-of-thought)
6. [Error Handling & Regeneration](#error-handling--regeneration)
7. [API Endpoints](#api-endpoints)

---

## High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ERD GENERATION FLOW                                 │
│                                                                         │
│  ┌────────────┐      ┌──────────────┐      ┌───────────────┐          │
│  │  Context   │      │              │      │   Generated   │          │
│  │  Gathering │ ───► │  AI Generate │ ───► │   ERD (Raw)   │          │
│  │            │      │   (Gemini)   │      │               │          │
│  └────────────┘      └──────────────┘      └───────────────┘          │
│                                                     │                   │
│                                                     ▼                   │
│                                             ┌───────────────┐          │
│                                             │   Validate    │          │
│                                             │ (Syntax Only) │          │
│                                             └───────────────┘          │
│                                                     │                   │
│                                      ┌──────────────┴──────────────┐   │
│                                      │                             │   │
│                                   Valid?                      Invalid? │
│                                      │                             │   │
│                                      ▼                             ▼   │
│                              ┌───────────────┐         ┌──────────────┐│
│                              │  Return ERD   │         │  Regenerate  ││
│                              │  with Stubs   │         │ with Feedback││
│                              └───────────────┘         └──────────────┘│
│                                                                │        │
│                                                                ▼        │
│                                                      ┌──────────────┐  │
│                                                      │ Max Attempts │  │
│                                                      │   Reached?   │  │
│                                                      └──────────────┘  │
│                                                         │      │       │
│                                                      Yes       No      │
│                                                         │      │       │
│                                                         ▼      │       │
│                                                    Return      │       │
│                                                     Error ─────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Flow Steps

1. **Context Gathering** - Collect all necessary context from Laravel backend
2. **AI Generation** - Send structured prompt to Gemini API
3. **Validation** - Run syntax validation only
4. **Auto-Regeneration** - If invalid, regenerate with feedback (up to 3 attempts)
5. **Return Result** - Return valid ERD or error after max attempts

---

## Context Requirements

### Why Context is Critical

ERD generation is **highly context-dependent**. Without proper context, the AI will generate:
- Generic, boilerplate entities
- Entities that belong in other modules (boundary violations)
- Missing entities critical to the module's purpose
- Wrong relationships and cardinalities

### Context Components

| Context | Source | Purpose |
|---------|--------|---------|
| **Project Overview** | `base_overview_versions.overview` or `projects.brief` | Business domain understanding |
| **Module Name** | `modules.name` | Entity naming and scope |
| **Module Description** | `modules.description` | Entity identification and requirements |
| **Module Metrics** | `modules.metrics` | Understanding what data to track |
| **Existing Modules** | Other `modules` records | Cross-module reference context |

### Example Context

```python
{
    "project_overview": "An e-commerce platform for handmade crafts...",
    "module_name": "Order Management",
    "module_description": "Handles customer orders from checkout to delivery...",
    "module_metrics": "Order completion rate, average delivery time...",
    "existing_modules": [
        {"name": "User Management", "description": "Handles users, auth..."},
        {"name": "Product Catalog", "description": "Manages products..."}
    ]
}
```

### How Context is Used

1. **Project Overview** → Identifies domain entities (e.g., "e-commerce" → orders, payments, shipping)
2. **Module Description** → Determines which entities belong in THIS module
3. **Module Metrics** → Reveals what data needs to be tracked (status_history, timestamps)
4. **Existing Modules** → Prevents duplication, enables proper FK references

---

## Validation Strategy

We use **syntax validation only** (code-based, fast and deterministic). AI logic validation exists in the codebase but is **not used in production**.

### Syntax Validation (Code-Based)

**File:** `fastAPI/src/utils/erd_validator.py` → `ERDSyntaxValidator`

Validates Mermaid ERD syntax according to our strict specification:

#### Rules Enforced

1. **Basic Structure**
   - Must start with `erDiagram`
   - Balanced braces `{ }` (excluding relationship patterns)

2. **Table Definitions**
   - Format: `table_name { ... }`
   - Table names must be at least 2 characters
   - Must contain at least one column

3. **Column Definitions**
   - Format: `<type> <column_name> "<constraints>"`
   - Valid types: `integer`, `bigint`, `varchar`, `text`, `decimal`, `boolean`, `timestamp`, `date`, `json`, `jsonb`
   - Valid constraints: `PK`, `FK`, `UNIQUE`, `NOT NULL`, `ref:Table.column`
   - Constraints must be in ONE quoted string

4. **Relationship Definitions**
   - Format: `ChildTable }o--|| ParentTable : "fk_column to pk_column"`
   - Valid cardinalities: `||--||`, `||--o|`, `||--o{`, `}o--||`, `}o--o{`
   - Description must reference actual FK and PK columns

5. **FK-Relationship Consistency**
   - Every FK column must have a corresponding relationship line
   - Every relationship must reference valid FK columns

#### Validation Output

```python
ValidationResult(
    is_valid: bool,
    errors: list[str],  # Must be fixed
    warnings: list[str]  # Should be fixed
)
```

#### Example Errors

```python
[
    "Table 'orders' has FK column 'user_id' but no relationship line",
    "Relationship references non-existent FK column 'orders.invalid_id'",
    "Column has invalid constraint format: 'NOT NULL' 'ref:users.id' (must be one quoted string)"
]
```

### AI Logic Validation (Not Used)

**File:** `fastAPI/src/utils/erd_validator.py` → `ERDLogicValidator`  
**Prompt:** `fastAPI/src/Prompts/ERD-Logic-Validate.txt`

This code exists but is **never called in production**. It was designed to validate:

1. **Module Boundary Compliance** - Entities belong to correct module
2. **Entity Completeness** - All needed entities present
3. **Field Completeness** - Entities have required fields
4. **Relationship Correctness** - Proper cardinalities
5. **Domain Modeling Quality** - DDD principles followed

#### Why Not Used

1. **Adds significant latency** - Extra API call per generation (30-60 seconds)
2. **Cost overhead** - Doubles token usage per generation
3. **Diminishing returns** - Syntax validation catches the critical issues
4. **AI regeneration is sufficient** - Detailed generation prompt and validation feedback loop naturally produce correct logic
5. **Syntax errors block logic errors** - Can't have good logic with broken syntax

The code remains for potential future use cases, but the current approach is **syntax validation + regeneration only**.

---

## Prompt Design

### Generation Prompt

**File:** `fastAPI/src/Prompts/Modules-ERD-Generate.txt`

#### Prompt Structure

```
1. ROLE         - Expert Software Architect (DDD specialist)
2. TASK         - Design database schema for module
3. CONTEXT      - Project overview, module details, existing modules
4. INSTRUCTIONS - 13 detailed rules (see below)
5. REASONING    - Internal thought process guide (not outputted)
6. OUTPUT       - Single Mermaid erDiagram code block
7. EXAMPLE      - Reference syntax
```

#### Key Instructions

| Rule | Purpose |
|------|---------|
| **1. Domain Analysis** | Identify entities within bounded context |
| **2. Normalization** | Follow 3NF unless justified |
| **3. Denormalization** | Comment justification if needed |
| **4. Column Format** | Strict syntax enforcement |
| **5. Cross-Module Refs** | Handle external module FKs |
| **6. Relationship Rules** | FK-relationship consistency |
| **7. Data Types** | Standard SQL types only |
| **8. Audit Columns** | created_at, updated_at, etc. |
| **9. Indexing** | Mark frequently queried columns |
| **10. Status Fields** | Comment valid enum values |
| **11. Cardinalities** | Reference guide for relationships |
| **12. Naming Conventions** | snake_case, plural tables, etc. |
| **13. Table Validity** | No repeated constraints, no orphans |

#### Prompt Template System

We use Python's `string.Template` for variable substitution:

```python
template = Template(prompt_text)
prompt = template.substitute(
    project_overview=request.project_overview,
    module_name=request.module_name,
    module_description=request.module_description,
    module_metrics=request.module_metrics or "No specific metrics defined",
    existing_modules=existing_modules_text
)
```

### Edit Prompt

**File:** `fastAPI/src/Prompts/ERD-Edit.txt`

Simpler prompt for editing existing ERDs based on engineer notes:

```
1. ROLE         - Senior Business Analyst
2. CONTEXT      - Original ERD + Engineer revision notes
3. TASK         - Apply changes while preserving structure
4. REQUIREMENTS - Only apply specified changes, no invention
5. OUTPUT       - Full revised ERD
```

---

## Why No Chain-of-Thought

### What is Chain-of-Thought?

Chain-of-Thought (CoT) prompting asks the AI to:
1. Think through the problem step-by-step
2. Show its reasoning process
3. Arrive at a solution incrementally

**Example CoT for ERD:**
```
Step 1: Identify core entities...
Step 2: Determine relationships...
Step 3: Add audit columns...
Final ERD: [output]
```

### Why We Don't Use CoT Here

#### 1. **Output Parsing Complexity**

CoT outputs are **unstructured** and contain mixed content:
- Reasoning text
- Partial outputs
- Final output buried in response

**Problem:** Extracting clean Mermaid code becomes unreliable.

```
❌ With CoT:
"Let me think... First, we need orders table...
Step 2: Add relationships...
Here's the ERD:
```mermaid
erDiagram
...
```
I think this covers everything."

✅ Without CoT:
"```mermaid
erDiagram
...
```"
```

#### 2. **Validation is Our CoT Alternative**

Instead of asking AI to "think through" the problem, we:
1. Generate ERD with detailed instructions
2. Validate the output
3. **Regenerate with validation feedback**

This is **functionally equivalent to CoT** but with:
- Structured feedback
- Measurable progress
- Clean separation of concerns

#### 3. **Cost & Latency**

CoT significantly increases:
- **Token usage** - Reasoning text adds thousands of tokens
- **Generation time** - More tokens = slower response
- **Cost** - Higher input/output token counts

For Sirius, we prioritize **speed and cost-efficiency**.

#### 4. **Deterministic Validation is Better**

Our syntax validator is:
- **Fast** - Code-based, runs in milliseconds
- **Deterministic** - Same input = same result
- **Precise** - Exact error locations and messages

CoT reasoning would be:
- **Slow** - Additional AI inference
- **Non-deterministic** - Varies per request
- **Vague** - "I think the relationships are correct"

### Our Approach: Validation-Driven Regeneration

```python
for attempt in range(MAX_REGENERATION_ATTEMPTS + 1):
    # Generate ERD
    erd = await generate_erd(prompt)
    
    # Validate
    validation = await validate_erd(erd)
    
    if validation.is_valid:
        return erd  # Success!
    
    # Add validation feedback to prompt
    prompt += f"\n\nFIX THESE ISSUES:\n{validation.errors}"
    # Loop and regenerate
```

This gives us:
- **Structured reasoning** - Validation errors are explicit
- **Measurable progress** - Each iteration fixes specific issues
- **Clean outputs** - No parsing complexity

---

## Error Handling & Regeneration

### Max Attempts Strategy

```python
MAX_REGENERATION_ATTEMPTS = 2  # Total 3 attempts (1 initial + 2 retries)
```

#### Attempt 1: Initial Generation
- Use base prompt with full context
- No validation feedback

#### Attempt 2: First Regeneration
- Add validation feedback section to prompt
- Highlight errors that must be fixed
- Keep same context

#### Attempt 3: Final Regeneration
- Add cumulative validation feedback
- Last chance to get it right

#### After Attempt 3: Fail Gracefully
- If still has **errors**: Raise HTTP 500 with error summary
- If only **warnings**: Return ERD with warnings logged

### Feedback Format

Validation errors are formatted into actionable feedback:

```python
def _format_validation_feedback(validation: ERDValidationResponse) -> str:
    feedback_parts = []
    
    if validation.errors:
        feedback_parts.append("## ERRORS (Must Fix):")
        for error in validation.errors:
            feedback_parts.append(f"- {error}")
    
    if validation.warnings:
        feedback_parts.append("\n## WARNINGS (Should Fix):")
        for warning in validation.warnings:
            feedback_parts.append(f"- {warning}")
    
    return "\n".join(feedback_parts)
```

**Example Feedback Added to Prompt:**

```
# IMPORTANT - PREVIOUS ATTEMPT HAD ISSUES:
The previous ERD generation had the following problems that MUST be fixed:

## ERRORS (Must Fix):
- Table 'orders' has FK column 'user_id' but no relationship line
- Relationship 'order_items }o--|| orders' references non-existent FK column 'order_items.invalid_id'

## WARNINGS (Should Fix):
- Table 'orders' is missing recommended audit column 'updated_at'

Please regenerate the ERD, ensuring ALL the above issues are resolved.
Follow the syntax rules EXACTLY as specified in the prompt.
```

### Error Response to Client

If all attempts fail:

```json
{
    "detail": "ERD validation failed after 3 attempts: Table 'orders' has FK column 'user_id' but no relationship line; Relationship references non-existent FK column"
}
```

---

## API Endpoints

### 1. Generate Module ERD

**Endpoint:** `POST /v1/ERD/generate`  
**Controller:** `fastAPI/src/controllers/erd_controller.py` → `generate_module_erd()`  
**Laravel Route:** `POST /projects/{project}/modules/{module}/erd/generate-async`

#### Request

```json
{
    "project_overview": "An e-commerce platform...",
    "module_name": "Order Management",
    "module_description": "Handles orders from checkout to delivery...",
    "module_metrics": "Order completion rate, avg delivery time",
    "existing_modules": [
        {"name": "User Management", "description": "..."},
        {"name": "Product Catalog", "description": "..."}
    ]
}
```

#### Response (Success)

```json
{
    "ERD": "erDiagram\n    orders {\n        ...\n    }",
    "usage": {
        "input_tokens": 1234,
        "output_tokens": 567,
        "cost": 0.0012
    }
}
```

#### Response (Error)

```json
{
    "detail": "ERD validation failed after 3 attempts: [error summary]"
}
```

### 2. Edit Module ERD

**Endpoint:** `POST /v1/ERD/edit`  
**Controller:** `fastAPI/src/controllers/erd_controller.py` → `edit_module_erd()`  
**Laravel Route:** `POST /projects/{project}/modules/{module}/erd/ai-edit`

#### Request

```json
{
    "ModuleERD": "erDiagram\n    orders {\n        ...\n    }",
    "engineer_notes": "Add a 'priority' field to orders table for urgent orders"
}
```

#### Response

```json
{
    "ERD": "erDiagram\n    orders {\n        ...\n        varchar priority \"NOT NULL\"\n    }",
    "usage": {
        "input_tokens": 890,
        "output_tokens": 456,
        "cost": 0.0008
    }
}
```

---

## Laravel Integration

### Controller Flow

**File:** `laravel/app/Http/Controllers/Module/ModuleERDController.php`

```
1. show()          - Display existing ERD in designer
2. generate()      - Prepare designer for async generation
3. generateAsync() - Call FastAPI to generate ERD
4. aiEdit()        - Call FastAPI to edit ERD with notes
5. edit()          - Manual save of ERD
```

### Async Generation Pattern

```php
public function generate(Project $project, Module $module)
{
    // Store session for async call
    session(['pending_module_erd_generation' => [
        'module_id' => $module->id,
    ]]);

    // Render designer in "generating" mode
    return Inertia::render('modules/DatabaseDesigner', [
        'isGenerating' => true
    ]);
}

public function generateAsync(Project $project, Module $module)
{
    // Validate session
    $pendingData = session('pending_module_erd_generation');
    
    // Call FastAPI
    $response = Http::post($fastApiUrl, $payload);
    
    // Persist ERD
    $module->erd = $response->json()['ERD'];
    $module->save();
    
    // Clear session
    session()->forget('pending_module_erd_generation');
    
    return response()->json(['success' => true, 'erd' => $erd]);
}
```

### Why Async?

1. **User Experience** - Show loading UI immediately, don't block navigation
2. **Timeout Management** - FastAPI calls can take 30-60 seconds
3. **Error Recovery** - Frontend can retry or show detailed errors

---

## Best Practices

### For Prompt Engineering

1. **Be Explicit** - Don't assume AI knows domain conventions
2. **Provide Examples** - Show exact syntax format
3. **Use Template Variables** - Keep prompts reusable
4. **Structure Instructions** - Numbered rules are clearer than paragraphs
5. **Add Reasoning Section** - Guide AI's thought process without CoT output

### For Validation

1. **Syntax Validation Only** - Fast, deterministic, catches structural errors
2. **Provide Actionable Feedback** - Not just "invalid", but "Table X missing column Y"
3. **Trust the Generation Prompt** - Detailed instructions produce correct logic without AI validation
4. **Set Reasonable Limits** - Max 3 attempts balances quality and performance
5. **Log Everything** - Track attempts, errors, and regenerations for debugging

### For Context

1. **Never Generate Without Context** - Context-free ERDs are generic garbage
2. **Prioritize Project Overview** - Most important context piece
3. **Include Existing Modules** - Prevents duplication and enables proper FKs
4. **Module Metrics Reveal Data Needs** - "Delivery time" → need timestamps

---

## Future Improvements

### Potential Enhancements

1. **Schema Evolution Tracking**
   - Store ERD versions
   - Show diff between versions
   - Rollback capability

2. **Advanced Validation**
   - Check for N+1 query patterns
   - Suggest indexes for common query patterns
   - Validate against naming conventions

3. **Interactive Refinement**
   - Let users tweak and ask for specific changes
   - "Add a status history table"
   - "Make user_id nullable"

4. **Multi-Model Generation**
   - Use different models for different modules
   - Specialized models for financial, healthcare, etc.

5. **Learning from Edits**
   - Track what users change manually
   - Feed back into generation prompts
   - Personalize to project style

---

## Conclusion

The ERD generation flow in Sirius is designed to be:

- **Context-Aware** - Uses rich project and module context
- **Robust** - Multi-attempt validation with feedback
- **Efficient** - Syntax-only validation, no AI validation overhead
- **Maintainable** - Clear separation of concerns, structured prompts
- **User-Friendly** - Async pattern, clear error messages

By choosing **syntax validation + regeneration over chain-of-thought or AI logic validation**, we achieve high-quality ERDs with:
- Fast validation (milliseconds, not seconds)
- Low cost (no double API calls)
- Deterministic error detection
- Clear, actionable feedback for regeneration

The result: High-quality, valid, context-appropriate ERDs generated in 30-60 seconds with minimal user intervention and cost.
