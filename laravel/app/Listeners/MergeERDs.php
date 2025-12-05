<?php

namespace App\Listeners;

use App\Events\ERDUpdated;
use App\Models\Module;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MergeERDs implements ShouldQueue
{
    use InteractsWithQueue;
    
    public function handle(ERDUpdated $event){
        $module = $event->module;
        $project = $module->project;

        // Get all modules for this project that have ERDs
        $modulesWithERDs = $project->modules()
            ->whereNotNull('erd')
            ->where('erd', '!=', '')
            ->get();

        if ($modulesWithERDs->isEmpty()) {
            Log::info('No modules with ERDs found for project merge', [
                'project_id' => $project->id,
                'module_id' => $module->id
            ]);
            return;
        }

        // Prepare the merge data
        $mergeData = $modulesWithERDs->map(function (Module $module) {
            return [
                'module_name' => $module->name,
                'erd' => $module->erd
            ];
        })->toArray();

        $payload = [
            'merge' => $mergeData
        ];

        try {
            Log::info('Attempting to merge ERDs for project', [
                'project_id' => $project->id,
                'modules_count' => count($mergeData)
            ]);

            $response = Http::timeout(60)->post('http://127.0.0.1:8005/v1/ERD/merge', $payload);

            if (!$response->ok()) {
                Log::error('Failed to merge ERDs', [
                    'project_id' => $project->id,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                return;
            }

            $mergedERD = data_get($response->json(), 'ERD');

            if (is_string($mergedERD) && $mergedERD !== '') {
                // Update project with merged ERD
                $project->erd = $mergedERD;
                $project->save();
                
                Log::info('Successfully merged ERDs for project', [
                    'project_id' => $project->id,
                    'merged_erd_length' => strlen($mergedERD)
                ]);
            } else {
                Log::warning('Invalid merged ERD response', [
                    'project_id' => $project->id,
                    'response' => $response->json()
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Exception occurred while merging ERDs', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
