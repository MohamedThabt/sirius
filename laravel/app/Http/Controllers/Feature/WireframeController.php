<?php

namespace App\Http\Controllers\Feature;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class WireframeController extends Controller
{
    public function show(Feature $feature)
    {
        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        if (!is_string($feature->wireframe) || $feature->wireframe === '') {
            abort(404, 'Wireframe not found for this feature');
        }

        // Parse the wireframe JSON
        $wireframeSchema = null;
        try {
            $wireframeSchema = json_decode($feature->wireframe, true);
        } catch (\Exception $e) {
            abort(500, 'Invalid wireframe data');
        }

        return Inertia::render('features/WireframePage', [
            'project' => $project,
            'feature' => $feature,
            'schema' => $wireframeSchema,
        ]);
    }

    public function generate(Feature $feature)
    {
        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        // Check if feature has ERD
        if (!is_string($feature->erd) || $feature->erd === '') {
            abort(422, 'Feature ERD is missing. Please generate ERD first.');
        }

        // Store feature data in session for async generation
        session([
            'pending_wireframe_generation' => [
                'feature_id' => $feature->id,
            ]
        ]);

        return Inertia::render('features/WireframePage', [
            'project' => $project,
            'feature' => $feature,
            'schema' => null,
            'isGenerating' => true
        ]);
    }

    /**
     * Generate wireframe asynchronously after initial page load
     */
    public function generateAsync(Feature $feature)
    {
        // Increase execution time for FastAPI calls
        set_time_limit(180);

        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $pendingData = session('pending_wireframe_generation');
        
        if (!$pendingData || $pendingData['feature_id'] !== $feature->id) {
            return response()->json([
                'success' => false,
                'message' => 'No pending generation data found'
            ], 400);
        }

        // Check if feature has ERD
        if (!is_string($feature->erd) || $feature->erd === '') {
            return response()->json([
                'success' => false,
                'message' => 'Feature ERD is missing. Please generate ERD first.'
            ], 422);
        }

        $payload = [
            'erd' => [
                'ERD' => $feature->erd,
            ],
            'feature' => [
                'name' => $feature->name,
                'acceptance_criteria' => $feature->acceptance_criteria,
                'user_flows' => $feature->user_flows,
                'metrics' => $feature->metrics,
                'description' => $feature->description,
            ],
        ];

        try {
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/wireframe/generate', $payload);

            if (!$response->ok()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate wireframe'
                ], 502);
            }

            $wireframe = data_get($response->json(), 'wireframe');

            if (!is_string($wireframe) || $wireframe === '') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid wireframe response'
                ], 500);
            }

            // Persist wireframe to feature
            $feature->wireframe = $wireframe;
            $feature->save();

            // Clear pending session data
            session()->forget('pending_wireframe_generation');

            // Parse the wireframe JSON for rendering
            $wireframeSchema = null;
            try {
                $wireframeSchema = json_decode($wireframe, true);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid wireframe JSON format'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Wireframe generated successfully',
                'schema' => $wireframeSchema
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate wireframe: ' . $e->getMessage()
            ], 500);
        }
    }

    public function aiEdit(Feature $feature)
    {
        // Increase execution time for FastAPI calls
        set_time_limit(180);

        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        // Check if feature has wireframe
        if (!is_string($feature->wireframe) || $feature->wireframe === '') {
            abort(422, 'Feature wireframe is missing. Please generate wireframe first.');
        }

        // Validate request data
        request()->validate([
            'engineer_notes' => 'required|string|min:1',
        ]);

        $payload = [
            'FeatureWireframe' => $feature->wireframe,
            'engineer_notes' => request('engineer_notes'),
        ];

        try {
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/wireframe/edit', $payload);

            if (!$response->ok()) {
                abort(502, 'Failed to edit wireframe with AI');
            }

            $wireframe = data_get($response->json(), 'wireframe');

            if (!is_string($wireframe) || $wireframe === '') {
                abort(500, 'Invalid wireframe response from AI');
            }

            // Persist updated wireframe to feature
            $feature->wireframe = $wireframe;
            $feature->save();

            // Parse the wireframe JSON for rendering
            $wireframeSchema = null;
            try {
                $wireframeSchema = json_decode($wireframe, true);
            } catch (\Exception $e) {
                abort(500, 'Invalid wireframe JSON format');
            }

            return response()->json([
                'success' => true,
                'schema' => $wireframeSchema,
                'message' => 'Wireframe updated successfully with AI',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to edit wireframe with AI: ' . $e->getMessage(),
            ], 500);
        }
    }
}
