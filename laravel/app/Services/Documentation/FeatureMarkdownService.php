<?php

namespace App\Services\Documentation;

use App\Models\Project;

class FeatureMarkdownService
{
    public function formatProjectFeaturesToMarkdown(Project $project): string
    {
        $project->loadMissing(['features']);

        if ($project->features->isEmpty()) {
            return '';
        }

        $lines = [];
        $counter = 1;

        foreach ($project->features as $feature) {
            $title = trim((string) $feature->name);
            $summary = trim((string) ($feature->summary ?? ''));
            $priority = ucfirst((string) ($feature->priority ?? ''));
            $order = (int) ($feature->order_of_implementation ?? 0);
            $acceptance = trim((string) ($feature->acceptance_criteria ?? ''));
            $userFlows = trim((string) ($feature->user_flows ?? ''));
            $metrics = trim((string) ($feature->metrics ?? ''));
            $description = trim((string) ($feature->description ?? ''));

            $lines[] = sprintf('### FR-%d %s', $counter, $title);
            if ($summary !== '') {
                $lines[] = sprintf('**Summary:** %s', $summary);
            }
            if ($priority !== '') {
                $lines[] = sprintf('**Priority:** %s', $priority);
            }
            if ($order > 0) {
                $lines[] = sprintf('**Order of Implementation:** %d', $order);
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

            if ($metrics !== '') {
                $lines[] = '**Metrics:**';
                $metricItems = preg_split('/\r?\n|[\x{2022}\*]/u', $metrics);
                $metricItems = array_filter(array_map('trim', $metricItems));
                if (!empty($metricItems)) {
                    foreach ($metricItems as $m) {
                        $lines[] = sprintf('* %s', rtrim($m, '.')) . '.';
                    }
                } else {
                    $lines[] = sprintf('* %s', $metrics);
                }
            }

            if ($description !== '') {
                $lines[] = sprintf('**Description:** %s', $description);
            }

            $counter++;
        }

        return implode("\n\n\n", $lines) . "\n\n\n";
    }
}


