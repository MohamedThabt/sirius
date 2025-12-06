<?php

namespace App\Http\Controllers\Feature;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use App\Traits\StructuredLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ERDController extends Controller
{
    use StructuredLogger;

    /**
     * Display the data model (ERD) designer page for a specific feature.
     *
     * Validates user authorization and datamodel existence, then renders the database designer interface.
     * The datamodel is auto-generated during feature creation from the module ERD.
     *
     * @param Feature $feature The feature model with datamodel
     * @return Response|RedirectResponse Inertia response or redirect on error
     */
    public function show(Feature $feature): Response|RedirectResponse
    {
        try {
            // Load module relationship and get project through it
            $feature->load('module');
            $project = $feature->module->project;

            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to access this feature.');
            }

            // Datamodel existence check
            if (!is_string($feature->datamodel) || $feature->datamodel === '') {
                return back()->with('error', 'No database schema found for this feature. This feature may not require database operations.');
            }

            return Inertia::render('features/DatabaseDesigner', [
                'project' => $project,
                'feature' => $feature,
                'initialContent' => $feature->datamodel,
                'featureId' => $feature->id,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'feature_id' => $feature->id]);
            return back()->with('error', 'Failed to load database designer. Please try again.');
        }
    }

    /**
     * Edit datamodel using AI based on engineer notes.
     *
     * Sends the current datamodel and engineer notes to FastAPI for AI-powered editing,
     * then persists the updated datamodel.
     * Expects request data: { engineer_notes: string }
     *
     * @param Request $request Contains engineer_notes field with editing instructions
     * @param Feature $feature The feature whose datamodel will be edited
     * @return RedirectResponse Redirect with success or error flash message
     */
    public function aiEdit(Request $request, Feature $feature): RedirectResponse
    {
        try {
            // Increase execution time for FastAPI calls
            $timeout = config('services.fastapi.timeout', 180);
            set_time_limit($timeout);

            // Load module relationship and get project through it
            $feature->load('module');
            $project = $feature->module->project;

            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to access this feature.');
            }

            // Note: Laravel will handle validation exceptions automatically
            $validated = $request->validate([
                'engineer_notes' => ['required', 'string', 'regex:/\S/'],
            ]);
            
            $engineerNotes = trim((string) ($validated['engineer_notes'] ?? ''));

            // Prepare payload matching FastAPI EditModuleERDRequest
            $payload = [
                'ModuleERD' => (string) ($feature->datamodel ?? ''),
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
                return back()->with('error', 'Failed to edit datamodel. The AI service is currently unavailable. Please try again later.');
            }

            // Extract and validate ERD
            $datamodel = data_get($response->json(), 'ERD');

            if (!is_string($datamodel) || $datamodel === '') {
                return back()->with('error', 'Received an invalid datamodel response from AI service. Please try again.');
            }

            // Persist updated datamodel and mark module as out of sync
            DB::transaction(function () use ($feature, $datamodel) {
                $feature->datamodel = $datamodel;
                $feature->save();
                
                $module = $feature->module;
                $module->erd_is_synced = false;
                $module->save();
            });

            return back()->with([
                'success' => 'Datamodel updated successfully using AI suggestions.',
                'erd' => $datamodel
            ]);
        } catch (Throwable $e) {
            $this->logException($e, [
                'action' => 'aiEdit',
                'feature_id' => $feature->id,
                'fastapi_endpoint' => '/v1/ERD/edit'
            ]);

            return back()->with('error', 'Failed to edit datamodel with AI. Please try again.');
        }
    }

    /**
     * Manually edit and save datamodel content.
     *
     * Accepts datamodel content from the frontend editor, validates and persists it to the database.
     * Expects request data: { datamodel: string }
     *
     * @param Request $request Contains datamodel field with manual datamodel content
     * @param Feature $feature The feature whose datamodel will be updated
     * @return RedirectResponse Redirect with success or error flash message
     */
    public function edit(Request $request, Feature $feature): RedirectResponse
    {
        try {
            // Load module relationship and get project through it
            $feature->load('module');
            $project = $feature->module->project;

            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to access this feature.');
            }

            // Note: Laravel will handle validation exceptions automatically
            $validated = $request->validate([
                'datamodel' => ['required', 'string', 'regex:/\S/'],
            ]);

            $datamodel = trim((string) $validated['datamodel']);

            // Persist datamodel and mark module as out of sync
            DB::transaction(function () use ($feature, $datamodel) {
                $feature->datamodel = $datamodel;
                $feature->save();
                
                $module = $feature->module;
                $module->erd_is_synced = false;
                $module->save();
            });

            return back()->with('success', 'Datamodel saved successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'edit', 'feature_id' => $feature->id]);
            
            return back()->with('error', 'Failed to save datamodel. Please try again.');
        }
    }
}
