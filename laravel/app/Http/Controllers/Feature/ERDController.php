<?php

namespace App\Http\Controllers\Feature;

use App\Events\ERDUpdated;
use App\Http\Controllers\Controller;
use App\Models\Feature;
use App\Traits\StructuredLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ERDController extends Controller
{
    use StructuredLogger;

    /**
     * Display the ERD designer page for a specific feature.
     *
     * Validates user authorization and ERD existence, then renders the database designer interface.
     * Expects the feature to have a valid ERD string stored.
     *
     * @param Feature $feature The feature model with erd relationship
     * @return Response|RedirectResponse Inertia response or redirect on error
     */
    public function show(Feature $feature): Response|RedirectResponse
    {
        try {
            $project = $feature->project;

            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to access this feature.');
            }

            // ERD existence check
            if (!is_string($feature->erd) || $feature->erd === '') {
                return back()->with('error', 'ERD not found for this feature. Please generate one first.');
            }

            return Inertia::render('features/DatabaseDesigner', [
                'project' => $project,
                'feature' => $feature,
                'initialContent' => $feature->erd,
                'featureId' => $feature->id,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show']);
            return back()->with('error', 'Failed to load ERD designer. Please try again.');
        }
    }

    /**
     * Prepare the feature for ERD generation and render the designer page.
     *
     * Validates user authorization and PRD existence, stores generation session data,
     * and renders the designer in "generating" mode for async ERD creation.
     *
     * @param Feature $feature The feature model for ERD generation
     * @return Response|RedirectResponse Inertia response with generation state
     */
    public function generate(Feature $feature): Response|RedirectResponse
    {
        try {
            $project = $feature->project;

            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to access this feature.');
            }

            // PRD validation
            $prdContent = (string) ($project->prd ?? '');
            if ($prdContent === '') {
                return back()->with('error', 'Project PRD is required for ERD generation. Please create a PRD first.');
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
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'generate']);
            return back()->with('error', 'Failed to prepare ERD generation. Please try again.');
        }
    }

    /**
     * Generate ERD asynchronously via FastAPI service.
     *
     * Called after the designer page loads. Validates session state, sends PRD and feature
     * data to the FastAPI service, persists the generated ERD, and dispatches a merge event.
     * Expects request data: none (uses session 'pending_erd_generation')
     *
     * @param Feature $feature The feature model to generate ERD for
     * @return JsonResponse JSON response with success status and ERD content
     */
    public function generateAsync(Feature $feature): JsonResponse
    {
        try {
            // Increase execution time for FastAPI calls
            $timeout = config('services.fastapi.timeout', 180);
            set_time_limit($timeout);

            $project = $feature->project;

            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to access this feature.'
                ], 403);
            }

            // Session validation
            $pendingData = session('pending_erd_generation');
            
            if (!$pendingData || ($pendingData['feature_id'] ?? null) !== $feature->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid pending generation session found. Please refresh and try again.'
                ], 400);
            }

            // PRD validation
            $prdContent = (string) ($project->prd ?? '');
            if ($prdContent === '') {
                return response()->json([
                    'success' => false,
                    'message' => 'Project PRD is required for ERD generation.'
                ], 422);
            }

            // Prepare payload
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

            // Call FastAPI service
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $httpTimeout = config('services.fastapi.http_timeout', 120);
            $retryTimes = config('services.fastapi.retry_times', 2);
            $retryDelay = config('services.fastapi.retry_delay', 2000);

            $response = Http::asJson()
                ->acceptJson()
                ->timeout($httpTimeout)
                ->retry($retryTimes, $retryDelay)
                ->post($fastApiBaseUrl . '/v1/ERD/generate', $payload);

            // Check response status
            if (!$response->ok()) {
                return response()->json([
                    'success' => false,
                    'message' => 'ERD generation failed. The AI service returned an error. Please try again later.'
                ], 502);
            }

            // Extract and validate ERD
            $erd = data_get($response->json(), 'ERD');

            if (!is_string($erd) || $erd === '') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid ERD format received from AI service. Please try again.'
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
                'message' => 'ERD generated successfully.',
                'erd' => $erd
            ]);
        } catch (Throwable $e) {
            $this->logException($e, [
                'action' => 'generateAsync',
                'fastapi_endpoint' => '/v1/ERD/generate'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred during ERD generation. Please try again.'
            ], 500);
        }
    }

    /**
     * Edit ERD using AI based on engineer notes.
     *
     * Sends the current ERD and engineer notes to FastAPI for AI-powered editing,
     * persists the updated ERD, and dispatches a merge event.
     * Expects request data: { engineer_notes: string }
     *
     * @param Request $request Contains engineer_notes field with editing instructions
     * @param Feature $feature The feature whose ERD will be edited
     * @return RedirectResponse Redirect with success or error flash message
     */
    public function aiEdit(Request $request, Feature $feature): RedirectResponse
    {
        try {
            // Increase execution time for FastAPI calls
            $timeout = config('services.fastapi.timeout', 180);
            set_time_limit($timeout);

            $project = $feature->project;

            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to access this feature.');
            }

            // Note: Laravel will handle validation exceptions automatically
            $validated = $request->validate([
                'engineer_notes' => ['required', 'string', 'regex:/\S/'],
            ]);
            
            $engineerNotes = trim((string) ($validated['engineer_notes'] ?? ''));

            // Prepare payload
            $payload = [
                'FeatureERD' => (string) ($feature->erd ?? ''),
                'engineer_notes' => $engineerNotes,
            ];

            // Call FastAPI service
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $httpTimeout = config('services.fastapi.http_timeout', 120);
            $retryTimes = config('services.fastapi.retry_times', 2);
            $retryDelay = config('services.fastapi.retry_delay', 2000);

            $response = Http::asJson()
                ->acceptJson()
                ->timeout($httpTimeout)
                ->retry($retryTimes, $retryDelay)
                ->post($fastApiBaseUrl . '/v1/ERD/edit', $payload);

            // Check response status
            if (!$response->ok()) {
                return back()->with('error', 'Failed to edit ERD. The AI service is currently unavailable. Please try again later.');
            }

            // Extract and validate ERD
            $erd = data_get($response->json(), 'ERD');

            if (!is_string($erd) || $erd === '') {
                return back()->with('error', 'Received an invalid ERD response from AI service. Please try again.');
            }

            // Persist updated ERD
            $feature->erd = $erd;
            $feature->save();

            // Dispatch event to merge ERDs in background
            ERDUpdated::dispatch($feature);

            return back()->with('success', 'ERD updated successfully using AI suggestions.');
        } catch (Throwable $e) {
            $this->logException($e, [
                'action' => 'aiEdit',
                'fastapi_endpoint' => '/v1/ERD/edit'
            ]);

            return back()->with('error', 'Failed to edit ERD with AI. Please try again.');
        }
    }

    /**
     * Manually edit and save ERD content.
     *
     * Accepts ERD content from the frontend editor, validates and persists it to the database,
     * and dispatches a merge event for project-wide ERD consolidation.
     * Expects request data: { erd: string }
     *
     * @param Request $request Contains erd field with manual ERD content
     * @param Feature $feature The feature whose ERD will be updated
     * @return RedirectResponse Redirect with success or error flash message
     */
    public function edit(Request $request, Feature $feature): RedirectResponse
    {
        try {
            $project = $feature->project;

            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to access this feature.');
            }

            // Note: Laravel will handle validation exceptions automatically
            $validated = $request->validate([
                'erd' => ['required', 'string', 'regex:/\S/'],
            ]);

            $erd = trim((string) $validated['erd']);

            // Persist ERD
            $feature->erd = $erd;
            $feature->save();

            // Dispatch event to merge ERDs in background
            ERDUpdated::dispatch($feature);

            return back()->with('success', 'ERD saved successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'edit']);
            
            return back()->with('error', 'Failed to save ERD. Please try again.');
        }
    }
}
