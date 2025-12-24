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
