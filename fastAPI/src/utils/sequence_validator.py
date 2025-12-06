"""
Sequence Diagram Validator Utility

Validates Mermaid Sequence Diagrams for:
1. Syntax correctness (based on prompt specification) - Code-based
"""

import re
import logging
from dataclasses import dataclass, field
from pydantic import BaseModel

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


class SequenceValidationResponse(BaseModel):
    """Final validation response"""
    is_valid: bool
    syntax_valid: bool
    errors: list[str] = []
    warnings: list[str] = []


# ============================================================
# Syntax Validator
# ============================================================

class SequenceSyntaxValidator:
    """
    Validates Mermaid Sequence Diagram syntax based on the prompt specification.
    
    Rules enforced:
    - Must start with 'sequenceDiagram'
    - Valid arrow types: ->>, -->>, -x, --x
    - Participants must be declared before use
    - Activation/deactivation must be balanced
    - Conditional blocks (alt/else/opt/loop) must close with 'end'
    - Messages must have proper format: Participant1->>Participant2: Message
    """
    
    # Valid arrow types in Mermaid sequence diagrams
    VALID_ARROWS = {
        '->>',   # Solid line with arrow (request)
        '-->>',  # Dotted line with arrow (response)
        '-x',    # Solid line with cross (async message)
        '--x',   # Dotted line with cross (async response)
        '->',    # Solid line without arrow (for simple diagrams)
        '-->',   # Dotted line without arrow (for simple diagrams)
    }
    
    # Conditional block keywords
    BLOCK_START_KEYWORDS = {'alt', 'opt', 'loop', 'par', 'rect', 'critical', 'break'}
    BLOCK_MID_KEYWORDS = {'else'}
    BLOCK_END_KEYWORD = 'end'
    
    def __init__(self, sequence_content: str):
        self.sequence_content = sequence_content.strip()
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.participants: dict[str, str] = {}  # name -> alias
        self.participant_activation_state: dict[str, int] = {}  # name -> activation count
        self.lines: list[str] = []
        self.block_stack: list[tuple[str, int]] = []  # (block_type, line_number)
    
    def validate(self) -> ValidationResult:
        """Run all syntax validations"""
        logger.info(f"Validating sequence diagram ({len(self.sequence_content)} chars)")
        
        self.errors = []
        self.warnings = []
        self.participant_activation_state = {}
        self.block_stack = []
        
        # Check basic structure
        if not self._validate_basic_structure():
            return ValidationResult(is_valid=False, errors=self.errors, warnings=self.warnings)
        
        # Parse lines
        self.lines = [line.strip() for line in self.sequence_content.split('\n') if line.strip() and not line.strip().startswith('%%')]
        logger.debug(f"Parsing {len(self.lines)} lines")
        
        # Validate line by line
        self._validate_lines()
        
        # Check for unclosed blocks
        if self.block_stack:
            for block_type, line_num in self.block_stack:
                self.errors.append(f"[Syntax] Unclosed '{block_type}' block at line {line_num}")
        
        # Check for unbalanced activations
        for participant, count in self.participant_activation_state.items():
            if count != 0:
                msg = f"Participant '{participant}' has unbalanced activation (count: {count})"
                self.warnings.append(f"[Syntax] {msg}")
        
        is_valid = len(self.errors) == 0
        logger.info(f"Validation {'PASSED' if is_valid else 'FAILED'}: {len(self.errors)} errors, {len(self.warnings)} warnings, {len(self.participants)} participants")
        
        return ValidationResult(
            is_valid=is_valid,
            errors=self.errors,
            warnings=self.warnings
        )
    
    def _validate_basic_structure(self) -> bool:
        """Validate basic sequence diagram structure"""
        if not self.sequence_content.startswith('sequenceDiagram'):
            self.errors.append("Sequence diagram must start with 'sequenceDiagram' keyword")
            return False
        return True
    
    def _validate_lines(self):
        """Validate each line of the sequence diagram"""
        for line_num, line in enumerate(self.lines, 1):
            # Skip the first line (sequenceDiagram keyword)
            if line_num == 1 and line.startswith('sequenceDiagram'):
                continue
            
            # Skip comments
            if line.startswith('%%'):
                continue
            
            # Check for title
            if line.startswith('title'):
                continue
            
            # Check for participant declaration
            if line.startswith('participant'):
                self._validate_participant_declaration(line, line_num)
                continue
            
            # Check for note
            if line.startswith('Note'):
                self._validate_note(line, line_num)
                continue
            
            # Check for activation/deactivation
            if line.startswith('activate '):
                self._validate_activation(line, line_num)
                continue
            
            if line.startswith('deactivate '):
                self._validate_deactivation(line, line_num)
                continue
            
            # Check for block start (alt, opt, loop, etc.)
            first_word = line.split()[0] if line.split() else ''
            if first_word in self.BLOCK_START_KEYWORDS:
                self._validate_block_start(line, line_num, first_word)
                continue
            
            # Check for block mid (else)
            if first_word in self.BLOCK_MID_KEYWORDS:
                self._validate_block_mid(line, line_num, first_word)
                continue
            
            # Check for block end
            if first_word == self.BLOCK_END_KEYWORD:
                self._validate_block_end(line, line_num)
                continue
            
            # Check for message (arrow)
            if self._contains_arrow(line):
                self._validate_message(line, line_num)
                continue
            
            # Unknown line format
            self.warnings.append(f"[Syntax] Line {line_num}: Unrecognized format: '{line}'")
    
    def _validate_participant_declaration(self, line: str, line_num: int):
        """Validate participant declaration"""
        pattern = r'^participant\s+(\w+)(?:\s+as\s+(\w+))?$'
        match = re.match(pattern, line)
        
        if not match:
            self.errors.append(f"[Syntax] Line {line_num}: Invalid participant declaration: '{line}'")
            return
        
        name = match.group(1)
        alias = match.group(2) if match.group(2) else name
        
        if name in self.participants:
            self.warnings.append(f"[Syntax] Line {line_num}: Participant '{name}' already declared")
        
        self.participants[name] = alias
        self.participant_activation_state[name] = 0
    
    def _validate_note(self, line: str, line_num: int):
        """Validate note syntax"""
        # Pattern: Note over Participant1, Participant2: Message
        # or: Note left of Participant: Message
        # or: Note right of Participant: Message
        pattern = r'^Note\s+(over|left of|right of)\s+([^:]+):\s*(.+)$'
        match = re.match(pattern, line, re.IGNORECASE)
        
        if not match:
            self.errors.append(f"[Syntax] Line {line_num}: Invalid note syntax: '{line}'")
            return
        
        participants_str = match.group(2).strip()
        message = match.group(3).strip()
        
        if not message:
            self.errors.append(f"[Syntax] Line {line_num}: Note has empty message")
        
        # Validate participants exist
        participants = [p.strip() for p in participants_str.split(',')]
        for p in participants:
            if p not in self.participants and p not in self.participants.values():
                self.warnings.append(f"[Syntax] Line {line_num}: Note references undeclared participant '{p}'")
    
    def _validate_activation(self, line: str, line_num: int):
        """Validate activation statement"""
        pattern = r'^activate\s+(\w+)$'
        match = re.match(pattern, line)
        
        if not match:
            self.errors.append(f"[Syntax] Line {line_num}: Invalid activate syntax: '{line}'")
            return
        
        participant = match.group(1)
        
        if participant not in self.participants and participant not in self.participants.values():
            self.warnings.append(f"[Syntax] Line {line_num}: Activating undeclared participant '{participant}'")
        
        if participant not in self.participant_activation_state:
            self.participant_activation_state[participant] = 0
        self.participant_activation_state[participant] += 1
    
    def _validate_deactivation(self, line: str, line_num: int):
        """Validate deactivation statement"""
        pattern = r'^deactivate\s+(\w+)$'
        match = re.match(pattern, line)
        
        if not match:
            self.errors.append(f"[Syntax] Line {line_num}: Invalid deactivate syntax: '{line}'")
            return
        
        participant = match.group(1)
        
        if participant not in self.participants and participant not in self.participants.values():
            self.warnings.append(f"[Syntax] Line {line_num}: Deactivating undeclared participant '{participant}'")
        
        if participant not in self.participant_activation_state:
            self.participant_activation_state[participant] = 0
        
        if self.participant_activation_state[participant] <= 0:
            self.errors.append(f"[Syntax] Line {line_num}: Attempting to deactivate inactive participant '{participant}'")
        else:
            self.participant_activation_state[participant] -= 1
    
    def _validate_block_start(self, line: str, line_num: int, block_type: str):
        """Validate block start (alt, opt, loop, etc.)"""
        self.block_stack.append((block_type, line_num))
    
    def _validate_block_mid(self, line: str, line_num: int, keyword: str):
        """Validate block mid keyword (else)"""
        if not self.block_stack:
            self.errors.append(f"[Syntax] Line {line_num}: '{keyword}' without opening block")
            return
        
        current_block = self.block_stack[-1][0]
        if keyword == 'else' and current_block != 'alt':
            self.errors.append(f"[Syntax] Line {line_num}: 'else' can only be used within 'alt' blocks")
    
    def _validate_block_end(self, line: str, line_num: int):
        """Validate block end"""
        if not self.block_stack:
            self.errors.append(f"[Syntax] Line {line_num}: 'end' without opening block")
            return
        
        self.block_stack.pop()
    
    def _contains_arrow(self, line: str) -> bool:
        """Check if line contains a message arrow"""
        for arrow in self.VALID_ARROWS:
            if arrow in line:
                return True
        return False
    
    def _validate_message(self, line: str, line_num: int):
        """Validate message syntax"""
        arrow_pattern = '|'.join([re.escape(arrow) for arrow in self.VALID_ARROWS])
        pattern = rf'^(\w+)\s*({arrow_pattern})\s*(\w+)\s*:\s*(.*)$'
        match = re.match(pattern, line)
        
        if not match:
            self.errors.append(f"[Syntax] Line {line_num}: Invalid message syntax: '{line}'")
            return
        
        from_participant = match.group(1)
        arrow = match.group(2)
        to_participant = match.group(3)
        message = match.group(4).strip()
        
        # Check if participants exist
        if from_participant not in self.participants and from_participant not in self.participants.values():
            self.warnings.append(f"[Syntax] Line {line_num}: Message from undeclared participant '{from_participant}'")
        
        if to_participant not in self.participants and to_participant not in self.participants.values():
            self.warnings.append(f"[Syntax] Line {line_num}: Message to undeclared participant '{to_participant}'")
        
        # Check if message is empty
        if not message:
            self.warnings.append(f"[Syntax] Line {line_num}: Message has empty description")
        
        # Check arrow validity
        if arrow not in self.VALID_ARROWS:
            self.errors.append(f"[Syntax] Line {line_num}: Invalid arrow type '{arrow}'. Valid arrows: {', '.join(self.VALID_ARROWS)}")



# ============================================================
# Main Validator Service
# ============================================================

class SequenceValidatorService:
    """
    Main service that orchestrates Sequence Diagram validation.
    
    Validates syntax (code-based only for now).
    """
    
    def __init__(self, sequence_content: str):
        self.sequence_content = sequence_content
    
    async def validate(self) -> SequenceValidationResponse:
        """Run validation"""
        syntax_validator = SequenceSyntaxValidator(self.sequence_content)
        syntax_result = syntax_validator.validate()
        
        return SequenceValidationResponse(
            is_valid=syntax_result.is_valid,
            syntax_valid=syntax_result.is_valid,
            errors=syntax_result.errors,
            warnings=syntax_result.warnings
        )


async def validate_sequence(sequence_content: str) -> SequenceValidationResponse:
    """Validate Sequence Diagram (async)"""
    service = SequenceValidatorService(sequence_content=sequence_content)
    return await service.validate()
