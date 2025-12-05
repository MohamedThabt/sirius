<?php

namespace App\Services\Documentation;

use App\Models\Project;
use App\Services\Feature\FeatureSpecService;
use Illuminate\Support\Str;

class ProjectSpecsExportService
{
    public function __construct(
        protected FeatureSpecService $featureSpecService
    ) {}

    public function build(Project $project): array
    {
        $files = [];

        $project->loadMissing(['modules.features']);

        // Build PRD.md
        $files[] = [
            'path' => 'specs/prd.md',
            'content' => $this->buildPrdContent($project),
        ];

        // Build DatabaseDesign.md
        $files[] = [
            'path' => 'specs/DatabaseDesign.md',
            'content' => $this->buildDatabaseDesignContent($project),
        ];

        // Build feature specs
        $features = $project->features;
        foreach ($features as $index => $feature) {
            $order = $index + 1;
            $slug = Str::slug($feature->name);
            $filename = sprintf('FR-%d-%s.md', $order, $slug);

            $files[] = [
                'path' => "specs/features/{$filename}",
                'content' => $this->featureSpecService->generateSpecsMarkdown($feature),
            ];
        }

        return $files;
    }

    protected function buildPrdContent(Project $project): string
    {
        $prd = trim((string) ($project->prd ?? ''));

        if ($prd === '') {
            return "# PRD\n\nTBD\n";
        }

        return $prd;
    }

    protected function buildDatabaseDesignContent(Project $project): string
    {
        $erd = trim((string) ($project->erd ?? ''));

        $content = "# Database Design\n\n";

        if ($erd === '') {
            $content .= "TBD\n";
        } else {
            $content .= "## Entity-Relationship Diagram\n\n";
            $content .= "```mermaid\n";
            $content .= $erd."\n";
            $content .= "```\n";
        }

        return $content;
    }
}
