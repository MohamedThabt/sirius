<?php

namespace App\Http\Controllers\Feature;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use App\Traits\StructuredLogger;

class WireframeController extends Controller
{
    use StructuredLogger;

    /**
     * Display the wireframe for a feature.
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

            if (!is_string($feature->wireframe) || $feature->wireframe === '') {
                return back()->with('error', 'Wireframe not found for this feature.');
            }

            // Parse the wireframe JSON
            $wireframeSchema = null;
            try {
                $wireframeSchema = json_decode($feature->wireframe, true);
            } catch (\Exception $e) {
                // Log the JSON parse error but don't crash the page, just show error
                $this->logException($e, ['action' => 'show_json_parse', 'feature_id' => $feature->id]);
                return back()->with('error', 'Invalid wireframe data.');
            }

            return Inertia::render('features/WireframePage', [
                'project' => $project,
                'feature' => $feature,
                'schema' => $wireframeSchema,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'show', 'feature_id' => $feature->id]);
            return back()->with('error', 'An error occurred while loading the wireframe.');
        }
    }

    /**
     * Initiate the generation of a wireframe.
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

            // Check if feature has ERD
            if (!is_string($feature->erd) || $feature->erd === '') {
                return back()->with('error', 'Feature ERD is missing. Please generate ERD first.');
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
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'generate', 'feature_id' => $feature->id]);
            return back()->with('error', 'An error occurred while initiating generation.');
        }
    }

    /**
     * Generate wireframe asynchronously.
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

            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/wireframe/generate', $payload);

            if (!$response->ok()) {
                throw new \Exception('FastAPI returned status: ' . $response->status());
            }

            $wireframe = data_get($response->json(), 'wireframe');

            if (!is_string($wireframe) || $wireframe === '') {
                throw new \Exception('Invalid wireframe response from API');
            }

            // Persist wireframe to feature
            $feature->wireframe = $wireframe;
            $feature->save();

            // Clear pending session data
            session()->forget('pending_wireframe_generation');

            // Parse the wireframe JSON for rendering
            $wireframeSchema = json_decode($wireframe, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid wireframe JSON format');
            }

            return response()->json([
                'success' => true,
                'message' => 'Wireframe generated successfully',
                'schema' => $wireframeSchema
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'generateAsync', 'feature_id' => $feature->id]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate wireframe: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Edit the wireframe using AI.
     *
     * @param Request $request
     * @param Feature $feature
     * @return \Illuminate\Http\RedirectResponse
     */
    public function aiEdit(Request $request, Feature $feature)
    {
        $validated = $request->validate([
            'engineer_notes' => 'required|string|min:1',
        ]);

        try {
            // Increase execution time for FastAPI calls
            set_time_limit(180);

            $project = $feature->project;

            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'Unauthorized access.');
            }

            // Check if feature has wireframe
            if (!is_string($feature->wireframe) || $feature->wireframe === '') {
                return back()->with('error', 'Feature wireframe is missing. Please generate wireframe first.');
            }

            $payload = [
                'FeatureWireframe' => $feature->wireframe,
                'engineer_notes' => $validated['engineer_notes'],
            ];

            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');

            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/wireframe/edit', $payload);

            if (!$response->ok()) {
                throw new \Exception('FastAPI returned status: ' . $response->status());
            }

            $wireframe = data_get($response->json(), 'wireframe');

            if (!is_string($wireframe) || $wireframe === '') {
                throw new \Exception('Invalid wireframe response from API');
            }

            // Persist updated wireframe to feature
            $feature->wireframe = $wireframe;
            $feature->save();

            // Validate JSON
            if (json_decode($wireframe, true) === null) {
                throw new \Exception('Invalid wireframe JSON format');
            }

            return back()->with('success', 'Wireframe updated successfully with AI.');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'aiEdit', 'feature_id' => $feature->id]);
            return back()->with('error', 'Failed to edit wireframe with AI.');
        }
    }
}
