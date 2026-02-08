<?php

namespace App\Services\Feature;

use App\Models\Feature;
use App\Services\Documentation\MermaidSanitizerService;

class FeatureSpecService
{
    public function __construct(
        protected MermaidSanitizerService $mermaidSanitizer
    ) {}

    public function generateSpecsMarkdown(Feature $feature): string
    {
        $lines = [];

        // Feature name as H1 header
        $lines[] = sprintf('# %s', trim((string) $feature->name));

        // Order of implementation
        $order = (int) ($feature->order_of_implementation ?? 0);
        if ($order > 0) {
            $lines[] = '';
            $lines[] = sprintf('**Order of Implementation:** %d', $order);
        }

        // Summary
        $summary = trim((string) ($feature->summary ?? ''));
        if ($summary !== '') {
            $lines[] = '';
            $lines[] = '## Summary';
            $lines[] = '';
            $lines[] = $summary;
        }

        // Description
        $description = trim((string) ($feature->description ?? ''));
        if ($description !== '') {
            $lines[] = '';
            $lines[] = '## Description';
            $lines[] = '';
            $lines[] = $description;
        }

        // Acceptance Criteria
        $acceptanceCriteria = trim((string) ($feature->acceptance_criteria ?? ''));
        if ($acceptanceCriteria !== '') {
            $lines[] = '';
            $lines[] = '## Acceptance Criteria';
            $lines[] = '';
            $lines[] = $acceptanceCriteria;
        }

        // Priority
        $priority = trim((string) ($feature->priority ?? ''));
        if ($priority !== '') {
            $lines[] = '';
            $lines[] = '## Priority';
            $lines[] = '';
            $lines[] = ucfirst($priority);
        }

        // Metrics
        $metrics = trim((string) ($feature->metrics ?? ''));
        if ($metrics !== '') {
            $lines[] = '';
            $lines[] = '## Metrics';
            $lines[] = '';
            $lines[] = $metrics;
        }

        // User Flows/Journey
        $userFlows = trim((string) ($feature->user_flows ?? ''));
        if ($userFlows !== '') {
            $lines[] = '';
            $lines[] = '## User Journey';
            $lines[] = '';
            $lines[] = $userFlows;
        }

        // Data Model (wrapped in mermaid code block)
        $datamodel = trim((string) ($feature->datamodel ?? ''));
        if ($datamodel !== '') {
            $lines[] = '';
            $lines[] = '## Database Schema';
            $lines[] = '';
            $lines[] = '```mermaid';
            // Sanitize for GitHub compatibility
            $lines[] = $this->mermaidSanitizer->sanitizeForGithub($datamodel);
            $lines[] = '```';
        }

        // Sequence Diagram (wrapped in mermaid code block)
        $sequenceDiagram = trim((string) ($feature->sequence_diagram ?? ''));
        if ($sequenceDiagram !== '') {
            $lines[] = '';
            $lines[] = '## Sequence Diagram';
            $lines[] = '';
            $lines[] = '```mermaid';
            $lines[] = $sequenceDiagram;
            $lines[] = '```';
        }

        return implode("\n", $lines);
    }
}
