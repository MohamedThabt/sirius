<?php

namespace App\Services\Documentation;

class MermaidSanitizerService
{
    /**
     * Sanitize Mermaid ERD code for GitHub compatibility
     * Removes inline `--` comments that work locally but break on GitHub
     * Preserves block-level `%%` comments and entity-level comments
     * 
     * @param string $mermaidCode Raw Mermaid ERD code
     * @return string GitHub-compatible Mermaid code
     */
    public function sanitizeForGithub(string $mermaidCode): string
    {
        $lines = explode("\n", $mermaidCode);
        $sanitizedLines = [];
        $inEntityBlock = false;

        foreach ($lines as $line) {
            $trimmed = trim($line);
            
            // Track if we're inside an entity block (between { and })
            if (preg_match('/\w+\s*\{/', $trimmed)) {
                $inEntityBlock = true;
            }
            if (preg_match('/^\}/', $trimmed)) {
                $inEntityBlock = false;
            }

            // Remove inline `--` comments ONLY within entity blocks (attribute definitions)
            // Preserve `--` in relationship lines and entity-level comments outside blocks
            if ($inEntityBlock && str_contains($line, '--') && !str_starts_with($trimmed, '%%')) {
                // Check if this is an attribute line (has type and name before --)
                // Pattern: "    type name" optionally with constraints, then --
                if (preg_match('/^\s+\w+\s+\w+/', $line)) {
                    // Remove everything after and including --
                    $line = preg_replace('/\s+--.*$/', '', $line);
                }
            }

            $sanitizedLines[] = $line;
        }

        return implode("\n", $sanitizedLines);
    }
}
