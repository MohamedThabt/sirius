<?php

namespace App\Http\Controllers\Feature;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use App\Traits\StructuredLogger;

class SequenceDiagramController extends Controller
{
    use StructuredLogger;

    /**
     * Display the sequence diagram for a feature.
     *
     * @param Feature $feature
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function show(Feature $feature)
    {
        try {
            $project = $feature->project;

            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to view this project.');
            }

            if (!is_string($feature->sequence_diagram) || $feature->sequence_diagram === '') {
                return back()->with('error', 'Sequence diagram not found for this feature.');
            }

            return Inertia::render('features/SequenceDiagram', [
                'project' => $project,
                'feature' => $feature,
                'initialContent' => $feature->sequence_diagram,
                'featureId' => $feature->id,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'show', 'feature_id' => $feature->id]);
            return back()->with('error', 'An error occurred while loading the sequence diagram.');
        }
    }

    /**
     * Initiate the generation of a sequence diagram.
     *
     * @param Feature $feature
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function generate(Feature $feature)
    {
        try {
            $project = $feature->project;

            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to perform this action.');
            }

            $prdContent = (string) ($project->prd ?? '');
            if ($prdContent === '') {
                return back()->with('error', 'Project PRD is missing.');
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
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'generate', 'feature_id' => $feature->id]);
            return back()->with('error', 'An error occurred while initiating generation.');
        }
    }

    /**
     * Generate sequence diagram asynchronously.
     *
     * @param Feature $feature
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateAsync(Feature $feature)
    {
        try {
            // Increase execution time for FastAPI calls
            set_time_limit(180);

            $project = $feature->project;

            if ($project->user_id !== auth()->id()) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
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

            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/Sequence/generate', $payload);

            if (!$response->ok()) {
                throw new \Exception('FastAPI returned status: ' . $response->status());
            }

            $sequence = data_get($response->json(), 'sequence');

            if (!is_string($sequence) || $sequence === '') {
                throw new \Exception('Invalid sequence response from API');
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
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'generateAsync', 'feature_id' => $feature->id]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate sequence diagram. Please try again.'
            ], 500);
        }
    }

    /**
     * Edit the sequence diagram using AI.
     *
     * @param Request $request
     * @param Feature $feature
     * @return \Illuminate\Http\RedirectResponse
     */
    public function aiEdit(Request $request, Feature $feature)
    {
        $validated = $request->validate([
            'engineer_notes' => ['required', 'string', 'regex:/\S/'],
        ]);

        try {
            // Increase execution time for FastAPI calls
            set_time_limit(180);

            $project = $feature->project;

            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'Unauthorized access.');
            }

            $engineerNotes = trim((string) ($validated['engineer_notes'] ?? ''));

            $payload = [
                'FeatureSequence' => (string) ($feature->sequence_diagram ?? ''),
                'engineer_notes' => $engineerNotes,
            ];

            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/Sequence/edit', $payload);

            if (!$response->ok()) {
                throw new \Exception('FastAPI returned status: ' . $response->status());
            }

            $sequence = data_get($response->json(), 'sequence');

            if (!is_string($sequence) || $sequence === '') {
                throw new \Exception('Invalid sequence response from API');
            }

            $feature->sequence_diagram = $sequence;
            $feature->save();

            return back()->with('success', 'Sequence diagram updated successfully.');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'aiEdit', 'feature_id' => $feature->id]);
            return back()->with('error', 'Failed to update sequence diagram with AI.');
        }
    }

    /**
     * Manually update the sequence diagram.
     *
     * @param Request $request
     * @param Feature $feature
     * @return \Illuminate\Http\RedirectResponse
     */
    public function edit(Request $request, Feature $feature)
    {
        $validated = $request->validate([
            'sequence' => ['required', 'string', 'regex:/\S/'],
        ]);

        try {
            $project = $feature->project;

            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'Unauthorized access.');
            }

            $sequence = trim((string) $validated['sequence']);

            $feature->sequence_diagram = $sequence;
            $feature->save();

            return back()->with('success', 'Sequence diagram saved successfully.');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'edit', 'feature_id' => $feature->id]);
            return back()->with('error', 'Failed to save sequence diagram.');
        }
    }
}
