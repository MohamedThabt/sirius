<?php

namespace App\Http\Controllers\Feature;

use App\Events\ERDUpdated;
use App\Http\Controllers\Controller;
use App\Models\Feature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ERDController extends Controller
{
    public function show(Feature $feature)
    {
        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        if (!is_string($feature->erd) || $feature->erd === '') {
            abort(404, 'ERD not found for this feature');
        }

        return Inertia::render('features/DatabaseDesigner', [
            'project' => $project,
            'feature' => $feature,
            'initialContent' => $feature->erd,
            'featureId' => $feature->id,
        ]);
    }

    public function generate(Feature $feature)
    {
        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $prdContent = (string) ($project->prd ?? '');
        if ($prdContent === '') {
            abort(422, 'Project PRD is missing');
        }

        // Store feature data in session for async generation
        session([
            'pending_erd_generation' => [
                'feature_id' => $feature->id,
            ]
        ]);

        return Inertia::render('features/DatabaseDesigner', [
            'project' => $project,
            'feature' => $feature,
            'initialContent' => null,
            'featureId' => $feature->id,
            'isGenerating' => true
        ]);
    }

    /**
     * Generate ERD asynchronously after initial page load
     */
    public function generateAsync(Feature $feature)
    {
        // Increase execution time for FastAPI calls
        set_time_limit(180);

        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $pendingData = session('pending_erd_generation');
        
        if (!$pendingData || $pendingData['feature_id'] !== $feature->id) {
            return response()->json([
                'success' => false,
                'message' => 'No pending generation data found'
            ], 400);
        }

        $prdContent = (string) ($project->prd ?? '');
        if ($prdContent === '') {
            return response()->json([
                'success' => false,
                'message' => 'Project PRD is missing'
            ], 422);
        }

        $payload = [
            'prd' => [
                'PRD' => $prdContent,
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
                ->post($fastApiBaseUrl . '/v1/ERD/generate', $payload);

            if (!$response->ok()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate ERD'
                ], 502);
            }

            $erd = data_get($response->json(), 'ERD');

            if (!is_string($erd) || $erd === '') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid ERD response'
                ], 500);
            }

            // Persist ERD to feature
            $feature->erd = $erd;
            $feature->save();

            // Clear pending session data
            session()->forget('pending_erd_generation');

            // Dispatch event to merge ERDs in background
            ERDUpdated::dispatch($feature);

            return response()->json([
                'success' => true,
                'message' => 'ERD generated successfully',
                'erd' => $erd
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate ERD: ' . $e->getMessage()
            ], 500);
        }
    }

    public function aiEdit(Request $request, Feature $feature)
    {
        // Increase execution time for FastAPI calls
        set_time_limit(180);

        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'engineer_notes' => ['required', 'string', 'regex:/\\S/'],
        ]);
        $engineerNotes = trim((string) ($validated['engineer_notes'] ?? ''));

        $payload = [
            'FeatureERD' => (string) ($feature->erd ?? ''),
            'engineer_notes' => $engineerNotes,
        ];

        try {
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/ERD/edit', $payload);

            if (!$response->ok()) {
                abort(502, 'Failed to edit ERD');
            }

            $erd = data_get($response->json(), 'ERD');

        if (!is_string($erd) || $erd === '') {
            abort(500, 'Invalid ERD response');
        }

            $feature->erd = $erd;
            $feature->save();

            // Dispatch event to merge ERDs in background
            ERDUpdated::dispatch($feature);

        return Inertia::render('features/DatabaseDesigner', [
            'project' => $project,
            'feature' => $feature,
            'initialContent' => $erd,
            'featureId' => $feature->id,
        ]);
        } catch (\Exception $e) {
            abort(500, 'Failed to edit ERD: ' . $e->getMessage());
        }
    }

    public function edit(Request $request, Feature $feature)
    {
        // Increase execution time for FastAPI calls
        set_time_limit(180);

        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'erd' => ['required', 'string', 'regex:/\\S/'],
        ]);

        $erd = trim((string) $validated['erd']);

        $feature->erd = $erd;
        $feature->save();

        // Dispatch event to merge ERDs in background
        ERDUpdated::dispatch($feature);

        return redirect()->route('features.erd.show', ['feature' => $feature->id]);
    }
}


