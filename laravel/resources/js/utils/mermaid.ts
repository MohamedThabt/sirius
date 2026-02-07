/**
 * Mermaid Diagram Utilities
 *
 * WHY: This function was duplicated identically in PRD.tsx and SystemOverview.tsx.
 * Extracting to a shared utility eliminates ~180 lines of duplicated code and ensures
 * consistent behavior across all Mermaid diagram rendering.
 */

/**
 * Converts escaped Mermaid strings into clean, renderable Mermaid syntax.
 * Handles common issues like escaped newlines, problematic characters,
 * double brackets, and invalid relationship syntax.
 */
export const convertEscapedMermaid = (escapedString: string): string => {
    // Remove markdown code block markers
    let cleaned = escapedString.replace(/```mermaid\s*/g, '').replace(/```\s*$/g, '');

    // Convert escaped newlines to actual newlines
    cleaned = cleaned.replace(/\\n/g, '\n');

    // Remove backslashes not related to newlines
    cleaned = cleaned.replace(/\\(?!n)/g, '');

    // Remove empty lines and excessive whitespace
    cleaned = cleaned
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join('\n');

    // Handle double square brackets and invalid node labels
    cleaned = cleaned.replace(/(\w+)\s*\[\[([^\]]*)\]\]/g, (_match, nodeId: string, content: string) => {
        const fixedContent = content
            .replace(/[()[\]{}"';]/g, '') // Remove problematic symbols
            .replace(/\s+/g, ' ')
            .trim();
        return `${nodeId}[${fixedContent || 'Unnamed'}]`;
    });

    // Handle single square brackets with problematic content
    cleaned = cleaned.replace(/\[([^\]]*)\]/g, (_match, content: string) => {
        const fixedContent = content
            .replace(/[()[\]{}"';]/g, '') // Remove problematic symbols
            .replace(/\s+/g, ' ')
            .trim();
        return `[${fixedContent || 'Unnamed'}]`;
    });

    // Handle node labels in round brackets
    cleaned = cleaned.replace(/\((\s*[^()]+?\s*)\)/g, (_match, content: string) => {
        const fixedContent = content
            .replace(/[()[\]{}"';]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return `(${fixedContent || 'Unnamed'})`;
    });

    // Handle invalid relationships like --> [B, C, E, G]
    const lines = cleaned.split('\n');
    const newLines: string[] = [];
    const seenNodes = new Set<string>();

    for (const line of lines) {
        // Check for invalid relationship with comma-separated nodes
        const invalidRelationMatch = line.match(/(\w+)\s*-->\s*\[\s*([\w\s,]+)\s*\]/);
        if (invalidRelationMatch) {
            const sourceNode = invalidRelationMatch[1];
            const targetNodes = invalidRelationMatch[2]
                .split(',')
                .map((node) => node.trim())
                .filter((node) => node.length > 0);
            // Replace with individual relationships
            targetNodes.forEach((target) => {
                newLines.push(`${sourceNode} --> ${target}`);
            });
        } else {
            newLines.push(line);
        }

        // Track node IDs to prevent duplicates
        const nodeMatch = line.match(/^(\w+)\[.*?\]/);
        if (nodeMatch) {
            const nodeId = nodeMatch[1];
            if (seenNodes.has(nodeId)) {
                console.warn(`[mermaid] Duplicate node ID found: ${nodeId}`);
            } else {
                seenNodes.add(nodeId);
            }
        }
    }

    cleaned = newLines.join('\n');

    // Ensure valid subgraph closure
    cleaned = cleaned.replace(/subgraph\s+([^\s[{]+)\s*\[\s*([^\]]*?)\s*\]/g, 'subgraph $1 [$2]');

    // Remove trailing whitespace
    cleaned = cleaned.trim();

    return cleaned;
};

/**
 * Valid Mermaid diagram types
 */
const VALID_DIAGRAM_TYPES = [
    'flowchart',
    'graph',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'stateDiagram-v2',
    'erDiagram',
    'journey',
    'gantt',
    'pie',
    'quadrantChart',
    'requirementDiagram',
    'gitGraph',
    'mindmap',
    'timeline',
    'zenuml',
    'sankey',
    'xychart',
    'block',
];

/**
 * Validation result interface
 */
export interface MermaidValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validates Mermaid syntax before rendering.
 * Checks for common issues that would cause rendering failures.
 */
export const validateMermaidSyntax = (code: string): MermaidValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const lines = code.trim().split('\n');

    if (lines.length === 0 || !code.trim()) {
        errors.push('Empty diagram code');
        return { valid: false, errors, warnings };
    }

    // Check for valid diagram type declaration
    const firstLine = lines[0].trim().toLowerCase();
    const diagramTypeMatch = firstLine.match(/^(\w+(?:-\w+)?)/);
    const diagramType = diagramTypeMatch ? diagramTypeMatch[1] : '';

    if (!VALID_DIAGRAM_TYPES.some((type) => firstLine.startsWith(type.toLowerCase()))) {
        errors.push(
            `Invalid or missing diagram type declaration. Expected one of: ${VALID_DIAGRAM_TYPES.slice(0, 5).join(', ')}, etc. Found: "${diagramType || 'none'}"`
        );
    }

    // Count brackets and braces for balance check
    let squareBrackets = 0;
    let roundBrackets = 0;
    let curlyBraces = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Count brackets (excluding escaped ones)
        for (const char of line) {
            switch (char) {
                case '[':
                    squareBrackets++;
                    break;
                case ']':
                    squareBrackets--;
                    break;
                case '(':
                    roundBrackets++;
                    break;
                case ')':
                    roundBrackets--;
                    break;
                case '{':
                    curlyBraces++;
                    break;
                case '}':
                    curlyBraces--;
                    break;
            }
        }

        // Check for common syntax errors
        if (line.includes('-->') && line.includes('-->>')) {
            warnings.push(`Line ${lineNum}: Mixed arrow styles (-->, -->>)`);
        }

        // Check for invalid node ID patterns (starting with numbers)
        const nodeMatch = line.match(/^\s*(\d+\w*)\s*[\[({]/);
        if (nodeMatch) {
            warnings.push(`Line ${lineNum}: Node ID "${nodeMatch[1]}" starts with a number, which may cause issues`);
        }

        // Check for unclosed quotes in labels
        const quoteCount = (line.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0) {
            errors.push(`Line ${lineNum}: Unclosed quote in label`);
        }
    }

    // Report unbalanced brackets
    if (squareBrackets !== 0) {
        errors.push(`Unbalanced square brackets: ${squareBrackets > 0 ? `${squareBrackets} unclosed [` : `${Math.abs(squareBrackets)} extra ]`}`);
    }
    if (roundBrackets !== 0) {
        errors.push(`Unbalanced parentheses: ${roundBrackets > 0 ? `${roundBrackets} unclosed (` : `${Math.abs(roundBrackets)} extra )`}`);
    }
    if (curlyBraces !== 0) {
        errors.push(`Unbalanced curly braces: ${curlyBraces > 0 ? `${curlyBraces} unclosed {` : `${Math.abs(curlyBraces)} extra }`}`);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
};

/**
 * Parses Mermaid error messages to provide user-friendly explanations.
 */
export const parseMermaidError = (error: string): string => {
    // Common error patterns and their user-friendly explanations
    const errorPatterns: Array<{ pattern: RegExp; message: string }> = [
        {
            pattern: /syntax error/i,
            message: 'Syntax error in diagram code. Check for missing arrows, brackets, or invalid characters.',
        },
        {
            pattern: /unexpected.*token/i,
            message: 'Unexpected character or symbol found. Verify all nodes and connections are properly formatted.',
        },
        {
            pattern: /lexical error/i,
            message: 'Invalid character in diagram. Remove special characters or escape them properly.',
        },
        {
            pattern: /parse error/i,
            message: 'Could not parse diagram structure. Check that the diagram type is correct and syntax follows Mermaid conventions.',
        },
        {
            pattern: /unknown.*diagram.*type/i,
            message: 'Unknown diagram type. Use flowchart, sequenceDiagram, classDiagram, etc.',
        },
        {
            pattern: /duplicate.*node/i,
            message: 'Duplicate node ID found. Each node must have a unique identifier.',
        },
    ];

    for (const { pattern, message } of errorPatterns) {
        if (pattern.test(error)) {
            return message;
        }
    }

    // Return original error if no pattern matches
    return error;
};
