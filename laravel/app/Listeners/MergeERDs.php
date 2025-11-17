<?php

namespace App\Listeners;

use App\Events\ERDUpdated;
use App\Models\Feature;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MergeERDs implements ShouldQueue
{
    use InteractsWithQueue;
    
    public function handle(ERDUpdated $event){
        $feature = $event->feature;
        $project = $feature->project;

        // Get all features for this project that have ERDs
        $featuresWithERDs = $project->features()
            ->whereNotNull('erd')
            ->where('erd', '!=', '')
            ->get();

        if ($featuresWithERDs->isEmpty()) {
            Log::info('No features with ERDs found for project merge', [
                'project_id' => $project->id,
                'feature_id' => $feature->id
            ]);
            return;
        }

        // Prepare the merge data
        $mergeData = $featuresWithERDs->map(function (Feature $feature) {
            return [
                'feature_name' => $feature->name,
                'erd' => $feature->erd
            ];
        })->toArray();

        $payload = [
            'merge' => $mergeData
        ];

        try {
            Log::info('Attempting to merge ERDs for project', [
                'project_id' => $project->id,
                'features_count' => count($mergeData)
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
