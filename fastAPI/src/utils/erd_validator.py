"""
ERD Validator Utility

Validates Mermaid ERD diagrams for:
1. Syntax correctness (based on prompt specification) - Code-based
2. Logical correctness (module boundary compliance, entity completeness) - AI-based
"""

import re
import json
import logging
from dataclasses import dataclass, field
from pydantic import BaseModel
from string import Template

logger = logging.getLogger(__name__)


# ============================================================
# Validation Result Models
# ============================================================

@dataclass
class ValidationResult:
    """Result of a single validation check"""
    is_valid: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


class ERDValidationResponse(BaseModel):
    """Final validation response"""
    is_valid: bool
    syntax_valid: bool
    errors: list[str] = []
    warnings: list[str] = []
    erd_with_stubs: str | None = None  # ERD with auto-generated stub tables for external refs


# ============================================================
# Syntax Validator
# ============================================================

class ERDSyntaxValidator:
    """
    Validates Mermaid ERD syntax based on the prompt specification.
    
    Rules enforced:
    - Must start with 'erDiagram'
    - Tables must have valid structure: table_name { ... }
    - Columns must follow: <type> <column_name> "<constraints>"
    - Valid types: integer, bigint, varchar, text, decimal, boolean, timestamp, date, json
    - Valid constraints: PK, FK, UNIQUE, NOT NULL, ref:Table.column
    - Relationships must follow: ChildTable }o--|| ParentTable : "fk to pk"
    - FK columns must have corresponding relationship lines
    """
    
    VALID_TYPES = {'integer', 'bigint', 'varchar', 'text', 'decimal', 'boolean', 'timestamp', 'date', 'json', 'jsonb'}
    VALID_CONSTRAINTS = {'PK', 'FK', 'UNIQUE', 'NOT NULL'}
    RELATIONSHIP_PATTERNS = [
        r'\|\|--\|\|',  # one-to-one (mandatory both)
        r'\|\|--o\|',   # one-to-one (optional right)
        r'\|\|--o\{',   # one-to-many
        r'\}o--\|\|',   # many-to-one
        r'\}o--o\{',    # many-to-many
    ]
    
    def __init__(self, erd_content: str):
        self.erd_content = erd_content.strip()
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.tables: dict[str, list[dict]] = {}  # table_name -> list of columns
        self.relationships: list[dict] = []
        self.fk_columns: dict[str, list[str]] = {}  # table_name -> list of FK column names
    
    def validate(self) -> ValidationResult:
        """Run all syntax validations"""
        logger.info("Starting ERD syntax validation")
        logger.debug(f"ERD content length: {len(self.erd_content)} chars")
        logger.debug(f"ERD content preview: {self.erd_content[:200]}..." if len(self.erd_content) > 200 else f"ERD content: {self.erd_content}")
        
        self.errors = []
        self.warnings = []
        
        # Check basic structure
        logger.debug("Validating basic structure...")
        if not self._validate_basic_structure():
            logger.warning(f"Basic structure validation failed. Errors: {self.errors}")
            return ValidationResult(is_valid=False, errors=self.errors, warnings=self.warnings)
        logger.debug("Basic structure validation passed")
        
        # Parse and validate tables
        logger.debug("Parsing tables...")
        self._parse_tables()
        logger.info(f"Parsed {len(self.tables)} tables: {list(self.tables.keys())}")
        
        # Parse and validate relationships
        logger.debug("Parsing relationships...")
        self._parse_relationships()
        logger.info(f"Parsed {len(self.relationships)} relationships")
        
        # Validate FK-relationship consistency
        logger.debug("Validating FK-relationship consistency...")
        self._validate_fk_relationships()
        
        is_valid = len(self.errors) == 0
        logger.info(f"Syntax validation complete: valid={is_valid}, errors={len(self.errors)}, warnings={len(self.warnings)}")
        if self.errors:
            logger.warning(f"Syntax errors: {self.errors}")
        if self.warnings:
            logger.debug(f"Syntax warnings: {self.warnings}")
        
        return ValidationResult(
            is_valid=is_valid,
            errors=self.errors,
            warnings=self.warnings
        )
    
    def _validate_basic_structure(self) -> bool:
        """Validate basic ERD structure"""
        # Must start with erDiagram
        if not self.erd_content.startswith('erDiagram'):
            logger.error("ERD does not start with 'erDiagram' keyword")
            self.errors.append("ERD must start with 'erDiagram' keyword")
            return False
        logger.debug("ERD starts with 'erDiagram' - OK")
        
        # Check for balanced braces (excluding relationship patterns like }o--|| or }|--|{)
        # Remove all relationship lines before counting braces
        content_for_brace_check = self.erd_content
        
        # Remove entire relationship lines (they contain braces in patterns like }o--||)
        # Pattern: TableA }o--|| TableB : "description"
        relationship_line_pattern = r'^.*\s+[\|\}\{o]+--[\|\}\{o]+\s+.*$'
        removed_lines = re.findall(relationship_line_pattern, content_for_brace_check, flags=re.MULTILINE)
        logger.debug(f"Removing {len(removed_lines)} relationship lines for brace counting")
        content_for_brace_check = re.sub(relationship_line_pattern, '', content_for_brace_check, flags=re.MULTILINE)
        
        open_braces = content_for_brace_check.count('{')
        close_braces = content_for_brace_check.count('}')
        logger.debug(f"Brace count after removing relationships: {open_braces} opening, {close_braces} closing")
        
        if open_braces != close_braces:
            hint = self._find_brace_problem_location(content_for_brace_check)
            msg = f"[Syntax] Unbalanced braces: {open_braces} opening, {close_braces} closing{hint}"
            logger.error(msg)
            self.errors.append(msg)
            return False
        
        logger.debug("Brace balance check passed")
        return True
    
    def _find_brace_problem_location(self, content: str) -> str:
        """Find approximate location of brace imbalance"""
        lines = content.split('\n')
        balance = 0
        for i, line in enumerate(lines, 1):
            balance += line.count('{') - line.count('}')
            if balance < 0:
                return f" (possible missing '{{' before line {i})"
        if balance > 0:
            return f" (possible missing '}}' near end of file)"
        return ""
    
    def _parse_tables(self):
        """Parse and validate table definitions"""
        # Pattern to match table blocks: table_name { ... }
        # Table name must be at least 2 characters and start at line beginning or after whitespace
        # This avoids matching 'o' from relationship patterns like }o--||
        table_pattern = r'(?:^|\n)\s*([a-zA-Z_]\w{1,})\s*\{([^}]*)\}'
        matches = re.findall(table_pattern, self.erd_content, re.DOTALL)
        logger.debug(f"Table pattern found {len(matches)} potential matches")
        
        for table_name, table_body in matches:
            if table_name == 'erDiagram':
                logger.debug("Skipping 'erDiagram' as table name")
                continue
            
            logger.debug(f"Parsing table '{table_name}'")
            columns = self._parse_columns(table_name, table_body)
            self.tables[table_name] = columns
            logger.debug(f"Table '{table_name}' has {len(columns)} columns: {[c['name'] for c in columns]}")
            
            # Validate table has at least one column
            if not columns:
                logger.warning(f"Table '{table_name}' has no valid columns")
                self.errors.append(f"[Syntax] Table '{table_name}' has no valid columns")
            
            # Validate table has PK
            has_pk = any(col.get('is_pk') for col in columns)
            if not has_pk:
                logger.debug(f"Table '{table_name}' has no primary key")
                self.warnings.append(f"[Syntax] Table '{table_name}' has no primary key (PK)")
    
    def _parse_columns(self, table_name: str, table_body: str) -> list[dict]:
        """Parse and validate column definitions"""
        columns = []
        lines = table_body.strip().split('\n')
        logger.debug(f"Table '{table_name}' body has {len(lines)} lines")
        
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line or line.startswith('--'):  # Skip empty lines and comments
                continue
            
            # Remove inline comments
            if '--' in line:
                line = line.split('--')[0].strip()
            
            if not line:
                continue
            
            # Skip table-level constraints (UNIQUE, INDEX, CHECK, PRIMARY KEY)
            if re.match(r'^(?:UNIQUE|INDEX|CHECK|PRIMARY\s*KEY)\s*\(', line, re.IGNORECASE):
                logger.debug(f"Table '{table_name}', line {line_num}: skipping table-level constraint")
                continue
            
            # Skip constraint declaration lines (e.g., table_name : "UNIQUE(col1, col2)")
            if re.match(rf'^{re.escape(table_name)}\s*:\s*"', line, re.IGNORECASE):
                logger.debug(f"Table '{table_name}', line {line_num}: skipping constraint declaration line")
                continue
            
            # Pattern: <type> <column_name> "<constraints>"
            # Also allow columns without constraints
            col_pattern = r'^(\w+)\s+(\w+)(?:\s+"([^"]*)")?$'
            match = re.match(col_pattern, line)
            
            if not match:
                logger.warning(f"Table '{table_name}', line {line_num}: invalid column syntax: '{line}'")
                self.errors.append(f"[Syntax] Table '{table_name}', invalid column syntax: '{line}'")
                continue
            
            col_type, col_name, constraints = match.groups()
            constraints = constraints or ""
            
            # Validate type
            if col_type.lower() not in self.VALID_TYPES:
                self.errors.append(
                    f"[Syntax] Table '{table_name}', column '{col_name}': invalid type '{col_type}'. "
                    f"Valid types: {', '.join(self.VALID_TYPES)}"
                )
            
            # Parse constraints
            is_pk = 'PK' in constraints
            is_fk = 'FK' in constraints
            is_unique = 'UNIQUE' in constraints
            is_not_null = 'NOT NULL' in constraints
            
            # Check for ref in FK
            ref_match = re.search(r'ref:(\w+)\.(\w+)', constraints)
            ref_table = ref_match.group(1) if ref_match else None
            ref_column = ref_match.group(2) if ref_match else None
            
            if is_fk and not ref_table:
                self.warnings.append(
                    f"Table '{table_name}', column '{col_name}': FK without ref specification"
                )
            
            # Track FK columns
            if is_fk:
                if table_name not in self.fk_columns:
                    self.fk_columns[table_name] = []
                self.fk_columns[table_name].append(col_name)
            
            # Check for duplicate constraints
            constraint_parts = constraints.split(',')
            seen = set()
            for part in constraint_parts:
                part = part.strip()
                if part in seen and part in ['PK', 'FK', 'UNIQUE', 'NOT NULL']:
                    self.errors.append(
                        f"Table '{table_name}', column '{col_name}': duplicate constraint '{part}'"
                    )
                seen.add(part)
            
            columns.append({
                'name': col_name,
                'type': col_type,
                'is_pk': is_pk,
                'is_fk': is_fk,
                'is_unique': is_unique,
                'is_not_null': is_not_null,
                'ref_table': ref_table,
                'ref_column': ref_column,
                'raw_constraints': constraints
            })
        
        return columns
    
    def _parse_relationships(self):
        """Parse and validate relationship definitions"""
        # Pattern to match relationships - supports all Mermaid cardinality notations:
        # ||--|| : one-to-one (both mandatory)
        # ||--o| : one-to-one (optional right)
        # ||--o{ : one-to-many
        # }o--|| : many-to-one (most common for FK)
        # }o--o{ : many-to-many
        # Also handles: }|--|{, o|--||, etc.
        rel_pattern = r'(\w+)\s*([|{}o]+--[|{}o]+)\s*(\w+)\s*:\s*"([^"]*)"'
        matches = re.findall(rel_pattern, self.erd_content)
        logger.debug(f"Relationship pattern found {len(matches)} matches")
        
        for child_table, rel_type, parent_table, rel_desc in matches:
            logger.debug(f"Found relationship: {child_table} {rel_type} {parent_table} : \"{rel_desc}\"")
            self.relationships.append({
                'child': child_table,
                'parent': parent_table,
                'type': rel_type,
                'description': rel_desc
            })
            
            # Validate tables exist (with normalized [Syntax] prefix)
            if child_table not in self.tables:
                logger.warning(f"Relationship references unknown table '{child_table}'")
                self.warnings.append(
                    f"[Syntax] Relationship references unknown table '{child_table}'"
                )
            if parent_table not in self.tables:
                logger.warning(f"Relationship references unknown table '{parent_table}'")
                self.warnings.append(
                    f"[Syntax] Relationship references unknown table '{parent_table}'"
                )
    
    def _validate_fk_relationships(self):
        """Validate that all FK columns have corresponding relationships"""
        logger.debug(f"Validating FK columns: {self.fk_columns}")
        relationship_fks = set()
        
        for rel in self.relationships:
            # Extract FK column from relationship description (e.g., "user_id to id")
            desc_match = re.match(r'(\w+)\s+to\s+(\w+)', rel['description'])
            if desc_match:
                fk_col = desc_match.group(1)
                relationship_fks.add((rel['child'], fk_col))
        
        logger.debug(f"FK columns found in relationships: {relationship_fks}")
        
        # Check all FK columns have relationships
        for table_name, fk_cols in self.fk_columns.items():
            for fk_col in fk_cols:
                if (table_name, fk_col) not in relationship_fks:
                    logger.debug(f"FK column '{fk_col}' in table '{table_name}' has no relationship line")
                    self.warnings.append(
                        f"[Syntax] Table '{table_name}', FK column '{fk_col}' has no corresponding relationship line"
                    )
    
    def _generate_stub_tables(self) -> str:
        """Generate stub table definitions for missing external references"""
        missing_tables = set()
        
        for rel in self.relationships:
            if rel['child'] not in self.tables:
                missing_tables.add(rel['child'])
            if rel['parent'] not in self.tables:
                missing_tables.add(rel['parent'])
        
        if not missing_tables:
            return ""
        
        stub_lines = ["\n    %% Auto-generated stub tables for external module references"]
        for table_name in sorted(missing_tables):
            stub_lines.append(f"    {table_name} {{")
            stub_lines.append(f'        bigint id "PK"')
            stub_lines.append(f"    }}")
            logger.debug(f"Generated stub table for external reference: {table_name}")
        
        return "\n".join(stub_lines)
    
    def get_erd_with_stubs(self) -> str:
        """Return the ERD content with stub tables appended for missing references"""
        stubs = self._generate_stub_tables()
        if stubs:
            return self.erd_content + stubs
        return self.erd_content


# ============================================================
# AI Logic Validator
# ============================================================

class ERDLogicValidator:
    """
    Validates ERD logical correctness using AI.
    
    AI Reviews:
    - Module boundary compliance (entities belong to correct module)
    - Entity completeness (all needed entities present)
    - Field completeness (entities have required fields)
    - Relationship correctness (proper cardinalities)
    - Domain modeling quality (DDD principles)
    """
    
    def __init__(
        self,
        erd_content: str,
        module_name: str,
        module_description: str,
        existing_modules: list[dict],
        project_overview: str
    ):
        self.erd_content = erd_content
        self.module_name = module_name
        self.module_description = module_description
        self.existing_modules = existing_modules
        self.project_overview = project_overview
    
    async def validate(self) -> ValidationResult:
        """Run AI-based logic validation"""
        from controllers.gemini import ask_gemini
        from utils.prompt_loader import load_prompt
        
        logger.info(f"Running AI logic validation for module: {self.module_name}")
        
        try:
            # Format existing modules
            if self.existing_modules:
                existing_modules_text = "\n".join([
                    f"- **{m.get('name', 'Unknown')}**: {m.get('description', 'No description')}"
                    for m in self.existing_modules
                ])
            else:
                existing_modules_text = "No other modules defined yet."
            
            # Build prompt
            template = load_prompt("ERD-Logic-Validate.txt")
            template = Template(template)
            prompt = template.substitute(
                project_overview=self.project_overview or "No project overview provided",
                module_name=self.module_name,
                module_description=self.module_description or "No description provided",
                existing_modules=existing_modules_text,
                erd_content=self.erd_content
            )
            
            # Call AI
            logger.info("Calling Gemini API for ERD logic validation...")
            raw_response, _ = await ask_gemini(prompt)
            
            # Parse AI response
            result = self._parse_ai_response(raw_response)
            return result
            
        except Exception as e:
            logger.error(f"AI logic validation failed: {str(e)}", exc_info=True)
            # Return valid with warning if AI fails - don't block generation
            return ValidationResult(
                is_valid=True,
                errors=[],
                warnings=[f"AI logic validation unavailable: {str(e)}"]
            )
    
    def _parse_ai_response(self, raw_response: str) -> ValidationResult:
        """Parse the AI response JSON"""
        try:
            # Clean response - remove markdown code blocks if present
            response = raw_response.strip()
            if response.startswith("```"):
                # Remove ```json or ``` at start
                response = re.sub(r'^```(?:json)?\s*', '', response)
                # Remove ``` at end
                response = re.sub(r'\s*```$', '', response)
            
            # Parse JSON
            data = json.loads(response)
            
            is_valid = data.get("is_valid", True)
            errors = data.get("errors", [])
            warnings = data.get("warnings", [])
            
            # Ensure lists
            if not isinstance(errors, list):
                errors = [str(errors)] if errors else []
            if not isinstance(warnings, list):
                warnings = [str(warnings)] if warnings else []
            
            # Limit to 5 each
            errors = errors[:5]
            warnings = warnings[:5]
            
            logger.info(f"AI logic validation result: valid={is_valid}, errors={len(errors)}, warnings={len(warnings)}")
            
            return ValidationResult(
                is_valid=is_valid,
                errors=errors,
                warnings=warnings
            )
            
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse AI response as JSON: {str(e)}")
            logger.debug(f"Raw response: {raw_response}")
            # Return valid if we can't parse - don't block generation
            return ValidationResult(
                is_valid=True,
                errors=[],
                warnings=["AI response parsing failed - manual review recommended"]
            )


# ============================================================
# Main Validator Service
# ============================================================

class ERDValidatorService:
    """
    Main service that orchestrates ERD validation.
    
    Validates syntax (code-based) and logic (AI-based), returns combined result.
    """
    
    def __init__(
        self,
        erd_content: str,
        module_name: str,
        module_description: str,
        existing_modules: list[dict] = None,
        project_overview: str = ""
    ):
        self.erd_content = erd_content
        self.module_name = module_name
        self.module_description = module_description
        self.existing_modules = existing_modules or []
        self.project_overview = project_overview
    
    async def validate(self) -> ERDValidationResponse:
        """
        Run full validation (syntax + AI logic).
        
        Returns:
            ERDValidationResponse with is_valid, errors, and warnings
        """
        logger.info(f"ERDValidatorService.validate() started for module: {self.module_name}")
        all_errors = []
        all_warnings = []
        
        # Syntax Validation (code-based - fast)
        logger.info(f"Running syntax validation for module: {self.module_name}")
        syntax_validator = ERDSyntaxValidator(self.erd_content)
        syntax_result = syntax_validator.validate()
        
        if not syntax_result.is_valid:
            logger.warning(f"Syntax validation FAILED: {syntax_result.errors}")
            all_errors.extend([e if e.startswith('[Syntax]') else f"[Syntax] {e}" for e in syntax_result.errors])
        else:
            logger.info("Syntax validation PASSED")
        all_warnings.extend([w if w.startswith('[Syntax]') else f"[Syntax] {w}" for w in syntax_result.warnings])
        
        logger.info(f"Syntax validation result: valid={syntax_result.is_valid}, errors={len(syntax_result.errors)}, warnings={len(syntax_result.warnings)}")
        
        # Deduplicate warnings while preserving order
        all_warnings = list(dict.fromkeys(all_warnings))
        
        # Generate ERD with stub tables for missing external references
        erd_with_stubs = syntax_validator.get_erd_with_stubs() if syntax_result.is_valid else None
        
        logger.info(f"Final validation result: is_valid={syntax_result.is_valid}")
        logger.info(f"Total errors: {len(all_errors)}, Total warnings: {len(all_warnings)}")
        if erd_with_stubs and erd_with_stubs != self.erd_content:
            logger.info("Generated stub tables for external module references")
        
        return ERDValidationResponse(
            is_valid=syntax_result.is_valid,
            syntax_valid=syntax_result.is_valid,
            errors=all_errors,
            warnings=all_warnings,
            erd_with_stubs=erd_with_stubs
        )


async def validate_erd(
    erd_content: str,
    module_name: str,
    module_description: str,
    existing_modules: list[dict] = None,
    project_overview: str = ""
) -> ERDValidationResponse:
    """
    Convenience function to validate ERD (async).
    
    Args:
        erd_content: The Mermaid ERD diagram content
        module_name: Name of the module
        module_description: Description of the module
        existing_modules: List of other modules for cross-reference
        project_overview: Project overview for context
    
    Returns:
        ERDValidationResponse with validation results
    """
    logger.info(f"=== Starting ERD validation for module: {module_name} ===")
    logger.debug(f"ERD content length: {len(erd_content)} chars")
    logger.debug(f"Existing modules count: {len(existing_modules) if existing_modules else 0}")
    
    service = ERDValidatorService(
        erd_content=erd_content,
        module_name=module_name,
        module_description=module_description,
        existing_modules=existing_modules,
        project_overview=project_overview
    )
    result = await service.validate()
    
    logger.info(f"=== ERD validation complete for module: {module_name} ===")
    logger.info(f"Result: valid={result.is_valid}")
    if result.errors:
        logger.warning(f"Validation errors: {result.errors}")
    if result.warnings:
        logger.info(f"Validation warnings: {result.warnings}")
    
    return result
