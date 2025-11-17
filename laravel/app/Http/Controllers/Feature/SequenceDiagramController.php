<?php

namespace App\Http\Controllers\Feature;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class SequenceDiagramController extends Controller
{
    public function show(Feature $feature)
    {
        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        if (!is_string($feature->sequence_diagram) || $feature->sequence_diagram === '') {
            abort(404, 'Sequence diagram not found for this feature');
        }

        return Inertia::render('features/SequenceDiagram', [
            'project' => $project,
            'feature' => $feature,
            'initialContent' => $feature->sequence_diagram,
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
            'pending_sequence_generation' => [
                'feature_id' => $feature->id,
            ]
        ]);

        return Inertia::render('features/SequenceDiagram', [
            'project' => $project,
            'feature' => $feature,
            'initialContent' => null,
            'featureId' => $feature->id,
            'isGenerating' => true
        ]);
    }

    /**
     * Generate sequence diagram asynchronously after initial page load
     */
    public function generateAsync(Feature $feature)
    {
        // Increase execution time for FastAPI calls
        set_time_limit(180);

        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $pendingData = session('pending_sequence_generation');
        
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
                ->post($fastApiBaseUrl . '/v1/Sequence/generate', $payload);

            if (!$response->ok()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate sequence diagram'
                ], 502);
            }

            $sequence = data_get($response->json(), 'sequence');

            if (!is_string($sequence) || $sequence === '') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid sequence response'
                ], 500);
            }

            $feature->sequence_diagram = $sequence;
            $feature->save();

            // Clear pending session data
            session()->forget('pending_sequence_generation');

            return response()->json([
                'success' => true,
                'message' => 'Sequence diagram generated successfully',
                'sequence' => $sequence
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate sequence diagram: ' . $e->getMessage()
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
            'FeatureSequence' => (string) ($feature->sequence_diagram ?? ''),
            'engineer_notes' => $engineerNotes,
        ];

        try {
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/Sequence/edit', $payload);

            if (!$response->ok()) {
                abort(502, 'Failed to edit sequence diagram');
            }

            $sequence = data_get($response->json(), 'sequence');

            if (!is_string($sequence) || $sequence === '') {
                abort(500, 'Invalid sequence response');
            }

            $feature->sequence_diagram = $sequence;
            $feature->save();

            return Inertia::render('features/SequenceDiagram', [
                'project' => $project,
                'feature' => $feature,
                'initialContent' => $sequence,
                'featureId' => $feature->id,
            ]);
        } catch (\Exception $e) {
            abort(500, 'Failed to edit sequence diagram: ' . $e->getMessage());
        }
    }

    public function edit(Request $request, Feature $feature)
    {
        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'sequence' => ['required', 'string', 'regex:/\\S/'],
        ]);

        $sequence = trim((string) $validated['sequence']);

        $feature->sequence_diagram = $sequence;
        $feature->save();

        return redirect()->route('features.sequence.show', ['feature' => $feature->id]);
    }
}


