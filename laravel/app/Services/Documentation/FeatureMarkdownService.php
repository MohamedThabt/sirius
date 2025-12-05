<?php

namespace App\Services\Documentation;

use App\Models\Project;

class FeatureMarkdownService
{
    public function formatProjectFeaturesToMarkdown(Project $project): string
    {
        $project->loadMissing(['modules.features']);

        if ($project->features->isEmpty()) {
            return '';
        }

        $lines = [];
        $counter = 1;

        foreach ($project->features as $feature) {
            $title = trim((string) $feature->name);
            $priority = ucfirst((string) ($feature->priority ?? ''));
            $acceptance = trim((string) ($feature->acceptance_criteria ?? ''));
            $userFlows = trim((string) ($feature->user_flows ?? ''));
            $description = trim((string) ($feature->description ?? ''));

            $lines[] = sprintf('### FR-%d %s', $counter, $title);
            if ($priority !== '') {
                $lines[] = sprintf('**Priority:** %s', $priority);
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
            }

            if ($userFlows !== '') {
                $normalized = preg_replace('/[\r\n]+/', ' ', $userFlows);
                $lines[] = sprintf('**User Flows:** %s', $normalized);
            }

            if ($description !== '') {
                $lines[] = sprintf('**Description:** %s', $description);
            }

            $counter++;
        }

        return implode("\n\n\n", $lines) . "\n\n\n";
    }
}


