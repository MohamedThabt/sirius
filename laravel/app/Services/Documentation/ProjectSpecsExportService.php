<?php

namespace App\Services\Documentation;

use App\Models\Module;
use App\Models\Project;
use App\Services\Feature\FeatureSpecService;
use App\Services\Documentation\FeatureMarkdownService;
use App\Services\Documentation\MermaidSanitizerService;
use Illuminate\Support\Str;

class ProjectSpecsExportService
{
    public function __construct(
        protected FeatureSpecService $featureSpecService,
        protected FeatureMarkdownService $featureMarkdownService,
        protected MermaidSanitizerService $mermaidSanitizer
    ) {}

    public function build(Project $project): array
    {
        $files = [];

        $project->loadMissing(['modules.features']);

        // Build PRD.md inside specs folder (includes features markdown like PRD page)
        $files[] = [
            'path' => 'specs/PRD.md',
            'content' => $this->buildPrdContent($project),
        ];

        // Build module folders with ERD and feature specs
        foreach ($project->modules as $module) {
            $moduleSlug = Str::slug($module->name);
            $modulePath = "specs/modules/{$moduleSlug}";

            // Add module ERD file
            $files[] = [
                'path' => "{$modulePath}/ERD.md",
                'content' => $this->buildModuleErdContent($module),
            ];

            // Add feature specs for this module
            foreach ($module->features as $feature) {
                $featureSlug = Str::slug($feature->name);

                $files[] = [
                    'path' => "{$modulePath}/{$featureSlug}.md",
                    'content' => $this->featureSpecService->generateSpecsMarkdown($feature),
                ];
            }
        }

        return $files;
    }

    protected function buildPrdContent(Project $project): string
    {
        $prd = trim((string) ($project->prd ?? ''));
        $featuresMarkdown = $this->featureMarkdownService->formatProjectFeaturesToMarkdown($project);

        $content = '';

        if ($prd === '') {
            $content = "# PRD\n\nTBD\n";
        } else {
            $content = $prd;
        }

        // Append features markdown if available (same as PRD page display)
        if ($featuresMarkdown !== '') {
            $content .= "\n\n---\n\n# Features\n\n";
            $content .= $featuresMarkdown;
        }

        return $content;
    }

    protected function buildModuleErdContent(Module $module): string
    {
        $erd = trim((string) ($module->erd ?? ''));

        $content = "# {$module->name} - Database Design\n\n";

        // Add module description if available
        if (!empty($module->description)) {
            $content .= sprintf("*%s*\n\n", trim((string) $module->description));
        }

        // Add ERD section
        if ($erd === '') {
            $content .= "## Entity-Relationship Diagram\n\nTBD\n\n";
        } else {
            $content .= "## Entity-Relationship Diagram\n\n";
            $content .= "```mermaid\n";
            // Sanitize ERD for GitHub compatibility
            $content .= $this->mermaidSanitizer->sanitizeForGithub($erd)."\n";
            $content .= "```\n\n";
        }

        // Add features section
        $content .= $this->buildModuleFeaturesSection($module);

        return $content;
    }

    protected function buildModuleFeaturesSection(Module $module): string
    {
        $module->loadMissing('features');

        if ($module->features->isEmpty()) {
            return '';
        }

        $lines = [];
        $lines[] = '## Features';
        $lines[] = '';

        $counter = 1;
        foreach ($module->features as $feature) {
            $title = trim((string) $feature->name);
            $priority = ucfirst((string) ($feature->priority ?? ''));
            $acceptance = trim((string) ($feature->acceptance_criteria ?? ''));
            $userFlows = trim((string) ($feature->user_flows ?? ''));
            $description = trim((string) ($feature->description ?? ''));

            $lines[] = sprintf('### FR-%d %s', $counter, $title);
            $lines[] = '';

            if ($priority !== '') {
                $lines[] = sprintf('**Priority:** %s', $priority);
                $lines[] = '';
            }

            if ($description !== '') {
                $lines[] = sprintf('**Description:** %s', $description);
                $lines[] = '';
            }

            if ($acceptance !== '') {
                $lines[] = '**Acceptance Criteria:**';
                // Split acceptance criteria into bullet points if looks like multiple items
                $bullets = preg_split('/\r?\n|[\x{2022}\*]/u', $acceptance);
                $bullets = array_filter(array_map('trim', $bullets));
                if (!empty($bullets)) {
                    foreach ($bullets as $item) {
                        $lines[] = sprintf('* %s', rtrim($item, '.')) . '.';
                    }
                } else {
                    $lines[] = sprintf('* %s', $acceptance);
                }
                $lines[] = '';
            }

            if ($userFlows !== '') {
                $normalized = preg_replace('/[\r\n]+/', ' ', $userFlows);
                $lines[] = sprintf('**User Flows:** %s', $normalized);
                $lines[] = '';
            }

            $lines[] = '---';
            $lines[] = '';
            $counter++;
        }

        return implode("\n", $lines);
    }
}
