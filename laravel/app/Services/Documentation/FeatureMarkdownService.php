<?php

namespace App\Services\Documentation;

use App\Models\Project;

class FeatureMarkdownService
{
    public function formatProjectFeaturesToMarkdown(Project $project): string
    {
        $project->loadMissing(['modules.features']);

        if ($project->modules->isEmpty() && $project->features->isEmpty()) {
            return '';
        }

        $lines = [];
        $counter = 1;

        // Group features by module
        foreach ($project->modules as $module) {
            if ($module->features->isEmpty()) {
                continue;
            }

            // Add module header
            $lines[] = sprintf('## Module: %s', trim((string) $module->name));
            if (!empty($module->description)) {
                $lines[] = sprintf('*%s*', trim((string) $module->description));
            }
            $lines[] = '';

            // Add features within this module
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

                if ($description !== '') {
                    $lines[] = sprintf('**Description:** %s', $description);
                    $lines[] = '';
                }

                $lines[] = '';
                $counter++;
            }

            $lines[] = '---';
            $lines[] = '';
        }

        // Handle features not assigned to any module (if any)
        $orphanFeatures = $project->features->filter(function ($feature) {
            return is_null($feature->module_id);
        });

        if ($orphanFeatures->isNotEmpty()) {
            $lines[] = '## Unassigned Features';
            $lines[] = '';

            foreach ($orphanFeatures as $feature) {
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

                if ($acceptance !== '') {
                    $lines[] = '**Acceptance Criteria:**';
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

                if ($description !== '') {
                    $lines[] = sprintf('**Description:** %s', $description);
                    $lines[] = '';
                }

                $lines[] = '';
                $counter++;
            }
        }

        return implode("\n", $lines);
    }
}


