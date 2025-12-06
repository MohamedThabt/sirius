"""C4 Diagram JSON Validator - Validates C4 diagram structure and integrity"""
import json
import logging
from typing import List, Dict, Any, Optional, Set
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class ValidationResult(BaseModel):
    """Result of C4 diagram validation"""
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []


def normalize_technology(tech: Optional[str]) -> Optional[str]:
    """
    Normalize technology names for consistent matching.
    Examples: "React.js" -> "react", "PostgreSQL" -> "postgres"
    """
    if not tech:
        return None
    
    normalized = tech.lower().strip()
    
    # Common normalizations
    tech_map = {
        'react.js': 'react',
        'reactjs': 'react',
        'next.js': 'next',
        'nextjs': 'next',
        'vue.js': 'vue',
        'vuejs': 'vue',
        'node.js': 'node',
        'nodejs': 'node',
        'postgresql': 'postgres',
        'mysql': 'mysql',
        'mongodb': 'mongo',
        'spring boot': 'spring',
        'springboot': 'spring',
        'express.js': 'express',
        'expressjs': 'express',
        'fastapi': 'fastapi',
        'django': 'django',
        'flask': 'flask',
        'react native': 'react-native',
        'kubernetes': 'k8s',
    }
    
    # Check for exact match
    if normalized in tech_map:
        return tech_map[normalized]
    
    # Check for substring match
    for key, value in tech_map.items():
        if key in normalized:
            return value
    
    return normalized


def validate_c4_json(json_str: str) -> ValidationResult:
    """
    Validate C4 diagram JSON structure and integrity.
    
    Validates:
    - JSON structure and required fields
    - Element structure (id, type, name, description, position)
    - Element ID uniqueness
    - Relationship integrity (from/to references)
    - Technology field normalization
    - Type-specific warnings
    
    Args:
        json_str: JSON string containing C4 diagram
        
    Returns:
        ValidationResult with is_valid, errors, and warnings
    """
    errors: List[str] = []
    warnings: List[str] = []
    
    # Parse JSON
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        return ValidationResult(
            is_valid=False,
            errors=[f"Invalid JSON: {str(e)}"]
        )
    
    # Validate basic structure
    if not isinstance(data, dict):
        return ValidationResult(
            is_valid=False,
            errors=["Root element must be a JSON object"]
        )
    
    # Required fields
    if not data.get('title') or not isinstance(data['title'], str):
        errors.append("Missing or invalid 'title' field (required, must be string)")
    
    if not data.get('description') or not isinstance(data['description'], str):
        errors.append("Missing or invalid 'description' field (required, must be string)")
    
    # Diagram type validation
    valid_diagram_types = ['system-context', 'container', 'component', 'system-landscape']
    if not data.get('type') or data['type'] not in valid_diagram_types:
        errors.append(f"Invalid 'type' field. Must be one of: {', '.join(valid_diagram_types)}")
    
    # Elements validation
    if 'elements' not in data:
        errors.append("Missing 'elements' array")
        return ValidationResult(is_valid=False, errors=errors)
    
    if not isinstance(data['elements'], list):
        errors.append("'elements' must be an array")
        return ValidationResult(is_valid=False, errors=errors)
    
    if len(data['elements']) == 0:
        errors.append("At least one element is required")
    
    # Validate elements
    element_ids: Set[str] = set()
    valid_element_types = ['person', 'software-system', 'container', 'component']
    
    for idx, element in enumerate(data['elements']):
        if not isinstance(element, dict):
            errors.append(f"Element at index {idx} must be an object")
            continue
        
        # ID validation
        elem_id = element.get('id')
        if not elem_id or not isinstance(elem_id, str):
            errors.append(f"Element at index {idx} must have a valid 'id' (string)")
            continue
        
        if elem_id in element_ids:
            errors.append(f"Duplicate element id: '{elem_id}'")
        element_ids.add(elem_id)
        
        # Name validation
        if not element.get('name') or not isinstance(element['name'], str):
            errors.append(f"Element '{elem_id}' must have a valid 'name' (string)")
        
        # Description validation
        if not element.get('description') or not isinstance(element['description'], str):
            errors.append(f"Element '{elem_id}' must have a valid 'description' (string)")
        
        # Type validation
        elem_type = element.get('type')
        if not elem_type or elem_type not in valid_element_types:
            errors.append(f"Element '{elem_id}' has invalid type. Must be one of: {', '.join(valid_element_types)}")
        
        # Position validation (optional but recommended)
        if 'position' in element:
            pos = element['position']
            if not isinstance(pos, dict) or 'x' not in pos or 'y' not in pos:
                warnings.append(f"Element '{elem_id}' has invalid position format (expected {{x, y}})")
        else:
            warnings.append(f"Element '{elem_id}' is missing position (auto-layout will be used)")
        
        # Technology field normalization
        if 'technology' in element and element['technology']:
            normalized = normalize_technology(element['technology'])
            if normalized != element['technology'].lower().strip():
                logger.debug(f"Normalized technology for '{elem_id}': '{element['technology']}' -> '{normalized}'")
        
        # Type-specific warnings
        diagram_type = data.get('type')
        if diagram_type == 'component' and elem_type == 'person':
            warnings.append(f"Person element '{elem_id}' is unusual in a component diagram")
        
        if diagram_type == 'system-context' and elem_type == 'component':
            warnings.append(f"Component element '{elem_id}' is unusual in a system-context diagram")
    
    # Relationships validation
    if 'relationships' not in data:
        errors.append("Missing 'relationships' array")
    elif not isinstance(data['relationships'], list):
        errors.append("'relationships' must be an array")
    else:
        for idx, rel in enumerate(data['relationships']):
            if not isinstance(rel, dict):
                errors.append(f"Relationship at index {idx} must be an object")
                continue
            
            # ID validation
            rel_id = rel.get('id')
            if not rel_id or not isinstance(rel_id, str):
                errors.append(f"Relationship at index {idx} must have a valid 'id' (string)")
                rel_id = f"rel-{idx}"  # Fallback for error messages
            
            # From validation
            from_id = rel.get('from')
            if not from_id or not isinstance(from_id, str):
                errors.append(f"Relationship '{rel_id}' must have a valid 'from' (string)")
            elif from_id not in element_ids:
                errors.append(f"Relationship '{rel_id}' references unknown 'from' element: '{from_id}'")
            
            # To validation
            to_id = rel.get('to')
            if not to_id or not isinstance(to_id, str):
                errors.append(f"Relationship '{rel_id}' must have a valid 'to' (string)")
            elif to_id not in element_ids:
                errors.append(f"Relationship '{rel_id}' references unknown 'to' element: '{to_id}'")
            
            # Label validation
            if not rel.get('label') or not isinstance(rel['label'], str):
                errors.append(f"Relationship '{rel_id}' must have a valid 'label' (string)")
            
            # Technology field normalization (optional)
            if 'technology' in rel and rel['technology']:
                normalized = normalize_technology(rel['technology'])
                if normalized != rel['technology'].lower().strip():
                    logger.debug(f"Normalized relationship technology for '{rel_id}': '{rel['technology']}' -> '{normalized}'")
    
    # Groups validation (optional)
    if 'groups' in data and isinstance(data['groups'], list):
        for idx, group in enumerate(data['groups']):
            if not isinstance(group, dict):
                warnings.append(f"Group at index {idx} must be an object")
                continue
            
            group_id = group.get('id', f'group-{idx}')
            
            if not group.get('name'):
                warnings.append(f"Group '{group_id}' is missing a name")
            
            if 'elements' in group:
                if not isinstance(group['elements'], list):
                    warnings.append(f"Group '{group_id}' elements must be an array")
                else:
                    for elem_ref in group['elements']:
                        if elem_ref not in element_ids:
                            warnings.append(f"Group '{group_id}' references unknown element: '{elem_ref}'")
    
    # Determine overall validity
    is_valid = len(errors) == 0
    
    if is_valid:
        logger.info(f"✓ C4 validation passed: {len(data['elements'])} elements, {len(data.get('relationships', []))} relationships, {len(warnings)} warnings")
    else:
        logger.warning(f"✗ C4 validation failed: {len(errors)} errors, {len(warnings)} warnings")
    
    return ValidationResult(
        is_valid=is_valid,
        errors=errors,
        warnings=warnings
    )


def get_validation_summary(result: ValidationResult) -> str:
    """
    Get a human-readable summary of validation results.
    
    Args:
        result: ValidationResult from validate_c4_json()
        
    Returns:
        Formatted string summarizing validation
    """
    if result.is_valid:
        summary = "✓ C4 diagram is valid"
        if result.warnings:
            summary += f" ({len(result.warnings)} warnings)"
        return summary
    else:
        summary = f"✗ C4 diagram validation failed: {len(result.errors)} errors"
        if result.warnings:
            summary += f", {len(result.warnings)} warnings"
        return summary
