<?php

namespace App\Http\Controllers\Module;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Project;
use App\Services\AiUsageService;
use App\Traits\StructuredLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ModuleERDController extends Controller
{
    use StructuredLogger;

    /**
     * Display the ERD designer page for a specific module.
     *
     * Validates user authorization and ERD existence, then renders the database designer interface.
     *
     * @param Project $project The project the module belongs to
     * @param Module $module The module model with erd relationship
     * @return Response|RedirectResponse Inertia response or redirect on error
     */
    public function show(Project $project, Module $module): Response|RedirectResponse
    {
        try {
            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to access this module.');
            }

            // Refresh module to ensure we have the latest data
            $module->refresh();

            // ERD existence check
            if (!is_string($module->erd) || $module->erd === '') {
                return back()->with('error', 'ERD not found for this module. Please generate one first.');
            }

            return Inertia::render('modules/DatabaseDesigner', [
                'project' => $project,
                'module' => $module,
                'initialContent' => $module->erd,
                'moduleId' => $module->id,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Validation exceptions are already handled by Laravel, but log for debugging
            $this->logWarning('Validation failed in ERD show', [
                'module_id' => $module->id,
                'errors' => $e->errors(),
            ]);
            throw $e; // Re-throw to let Laravel handle it
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'module_id' => $module->id]);
            return back()->with('error', 'Failed to load ERD designer. Please try again.');
        }
    }

    /**
     * Prepare the module for ERD generation and render the designer page.
     *
     * Validates user authorization, stores generation session data,
     * and renders the designer in "generating" mode for async ERD creation.
     *
     * @param Project $project The project the module belongs to
     * @param Module $module The module model for ERD generation
     * @return Response|RedirectResponse Inertia response with generation state
     */
    public function generate(Project $project, Module $module): Response|RedirectResponse
    {
        try {
            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to access this module.');
            }

            // Module needs description for ERD generation
            if (empty($module->description)) {
                return back()->with('error', 'Module description is required for ERD generation. Please add a description first.');
            }

            // Store module data in session for async generation
            // Use put() and save() to ensure the session is persisted before the async call
            session()->put('pending_module_erd_generation', [
                'module_id' => $module->id,
            ]);
            session()->save();

            return Inertia::render('modules/DatabaseDesigner', [
                'project' => $project,
                'module' => $module,
                'initialContent' => null,
                'moduleId' => $module->id,
                'isGenerating' => true
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Validation exceptions are already handled by Laravel, but log for debugging
            $this->logWarning('Validation failed in ERD generate', [
                'module_id' => $module->id,
                'errors' => $e->errors(),
            ]);
            throw $e; // Re-throw to let Laravel handle it
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'generate', 'module_id' => $module->id]);
            return back()->with('error', 'Failed to prepare ERD generation. Please try again.');
        }
    }

    /**
     * Generate Module ERD asynchronously via FastAPI service.
     *
     * Called after the designer page loads. Validates session state, sends module
     * data to the FastAPI service, and persists the generated ERD.
     *
     * @param Project $project The project the module belongs to
     * @param Module $module The module model to generate ERD for
     * @return JsonResponse JSON response with success status and ERD content or error
     */
    public function generateAsync(Project $project, Module $module): JsonResponse
    {
        try {
            // Increase execution time for FastAPI calls
            $timeout = config('services.fastapi.timeout', 180);
            set_time_limit($timeout);

            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to access this module.'
                ], 403);
            }

            // Session validation
            $pendingData = session('pending_module_erd_generation');
            
            if (!$pendingData || ($pendingData['module_id'] ?? null) !== $module->id) {
                $this->logWarning('ERD generation session validation failed', [
                    'module_id' => $module->id,
                    'module_name' => $module->name,
                    'session_data' => $pendingData,
                    'expected_module_id' => $module->id,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Generation session expired. Please try again.'
                ], 400);
            }

            // Get project overview
            $baseOverviewVersion = $project->baseOverviewVersion;
            $projectOverview = $baseOverviewVersion ? $baseOverviewVersion->overview : $project->brief;

            // Get existing modules for context (excluding current module)
            $existingModules = $project->modules()
                ->where('id', '!=', $module->id)
                ->select('name', 'description')
                ->get()
                ->map(fn($m) => [
                    'name' => $m->name,
                    'description' => $m->description ?? '',
                ])
                ->toArray();

            // Prepare payload
            $payload = [
                'project_overview' => $projectOverview,
                'module_name' => $module->name,
                'module_description' => $module->description ?? '',
                'module_metrics' => $module->metrics,
                'existing_modules' => $existingModules,
            ];

            // Call FastAPI service
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $httpTimeout = config('services.fastapi.http_timeout', 120);
            $retryTimes = config('services.fastapi.retry_times', 2);
            $retryDelay = config('services.fastapi.retry_delay', 2000);

            $attemptCount = 0;
            $response = Http::asJson()
                ->acceptJson()
                ->timeout($httpTimeout)
                ->retry($retryTimes, $retryDelay, function ($exception, $request) use (&$attemptCount, $module) {
                    $attemptCount++;
                    $this->logWarning('FastAPI ERD generation retry attempt', [
                        'attempt' => $attemptCount,
                        'module_id' => $module->id,
                        'module_name' => $module->name,
                        'error' => $exception->getMessage(),
                    ]);
                    return true; // Always retry
                })
                ->post($fastApiBaseUrl . '/v1/ERD/generate', $payload);

            // Check response status
            if (!$response->ok()) {
                $this->logWarning('FastAPI ERD generation failed - invalid response status', [
                    'module_id' => $module->id,
                    'module_name' => $module->name,
                    'status' => $response->status(),
                    'response_body' => $response->body(),
                ]);
                session()->forget('pending_module_erd_generation');
                return response()->json([
                    'success' => false,
                    'message' => 'ERD generation failed. The AI service returned an error. Please try again.'
                ], 502);
            }

            $responseData = $response->json();

            // Validate and record usage
            if (!isset($responseData['usage'])) {
                $this->logWarning('FastAPI ERD generation failed - missing usage data', [
                    'module_id' => $module->id,
                    'module_name' => $module->name,
                    'response_data' => $responseData,
                ]);
                session()->forget('pending_module_erd_generation');
                return response()->json([
                    'success' => false,
                    'message' => 'AI usage data missing from response. Please try again.'
                ], 500);
            }

            app(AiUsageService::class)->handle(
                auth()->user(),
                'module_erd_generation',
                $responseData['usage'],
                $responseData['model'] ?? null
            );

            // Extract and validate ERD
            $erd = data_get($responseData, 'ERD');

            if (!is_string($erd) || $erd === '') {
                $this->logWarning('FastAPI ERD generation failed - invalid ERD format', [
                    'module_id' => $module->id,
                    'module_name' => $module->name,
                    'erd_type' => gettype($erd),
                    'erd_value' => is_string($erd) ? substr($erd, 0, 200) : $erd,
                    'response_data_keys' => array_keys($responseData ?? []),
                ]);
                session()->forget('pending_module_erd_generation');
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid ERD format received from AI service. Please try again.'
                ], 500);
            }

            // Persist ERD to module and mark as synced
            DB::transaction(function () use ($module, $erd) {
                $module->erd = $erd;
                $module->erd_is_synced = true;
                $module->save();
            });

            // Refresh the module to ensure we have the latest data
            $module->refresh();

            // Clear pending session data
            session()->forget('pending_module_erd_generation');

            return response()->json([
                'success' => true,
                'message' => 'ERD generated successfully.',
                'erd' => $erd
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Validation exceptions are already handled by Laravel, but log for debugging
            $this->logWarning('Validation failed in ERD generateAsync', [
                'module_id' => $module->id,
                'errors' => $e->errors(),
            ]);
            session()->forget('pending_module_erd_generation');
            throw $e; // Re-throw to let Laravel handle it
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            $this->logException($e, [
                'action' => 'generateAsync',
                'module_id' => $module->id,
                'fastapi_endpoint' => '/v1/ERD/generate',
                'error_type' => 'ConnectionException',
            ]);
            session()->forget('pending_module_erd_generation');
            return response()->json([
                'success' => false,
                'message' => 'Unable to connect to AI service. Please check your connection and try again.'
            ], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            $this->logException($e, [
                'action' => 'generateAsync',
                'module_id' => $module->id,
                'fastapi_endpoint' => '/v1/ERD/generate',
                'error_type' => 'RequestException',
            ]);
            session()->forget('pending_module_erd_generation');
            return response()->json([
                'success' => false,
                'message' => 'AI service returned an error. Please try again later.'
            ], 500);
        } catch (Throwable $e) {
            $this->logException($e, [
                'action' => 'generateAsync',
                'module_id' => $module->id,
                'fastapi_endpoint' => '/v1/ERD/generate',
                'error_type' => get_class($e),
            ]);

            session()->forget('pending_module_erd_generation');
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred during ERD generation. Please try again.'
            ], 500);
        }
    }

    /**
     * Edit Module ERD using AI based on engineer notes.
     *
     * Sends the current ERD and engineer notes to FastAPI for AI-powered editing,
     * persists the updated ERD.
     *
     * @param Request $request Contains engineer_notes field with editing instructions
     * @param Project $project The project the module belongs to
     * @param Module $module The module whose ERD will be edited
     * @return RedirectResponse Redirect with success or error flash message
     */
    public function aiEdit(Request $request, Project $project, Module $module): RedirectResponse
    {
        try {
            // Increase execution time for FastAPI calls
            $timeout = config('services.fastapi.timeout', 180);
            set_time_limit($timeout);

            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to access this module.');
            }

            $validated = $request->validate([
                'engineer_notes' => ['required', 'string', 'regex:/\S/'],
            ]);
            
            $engineerNotes = trim((string) ($validated['engineer_notes'] ?? ''));

            // Prepare payload
            $payload = [
                'ModuleERD' => (string) ($module->erd ?? ''),
                'engineer_notes' => $engineerNotes,
            ];

            // Call FastAPI service
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $httpTimeout = config('services.fastapi.http_timeout', 120);
            $retryTimes = config('services.fastapi.retry_times', 2);
            $retryDelay = config('services.fastapi.retry_delay', 2000);

            $attemptCount = 0;
            $response = Http::asJson()
                ->acceptJson()
                ->timeout($httpTimeout)
                ->retry($retryTimes, $retryDelay, function ($exception, $request) use (&$attemptCount, $module) {
                    $attemptCount++;
                    $this->logWarning('FastAPI ERD edit retry attempt', [
                        'attempt' => $attemptCount,
                        'module_id' => $module->id,
                        'module_name' => $module->name,
                        'error' => $exception->getMessage(),
                    ]);
                    return true; // Always retry
                })
                ->post($fastApiBaseUrl . '/v1/ERD/edit', $payload);

            // Check response status
            if (!$response->ok()) {
                $this->logWarning('FastAPI ERD edit failed - invalid response status', [
                    'module_id' => $module->id,
                    'module_name' => $module->name,
                    'status' => $response->status(),
                    'response_body' => $response->body(),
                ]);
                return back()->with('error', 'Failed to edit ERD. The AI service is currently unavailable. Please try again later.');
            }

            // Extract and validate ERD
            $erd = data_get($response->json(), 'ERD');

            if (!is_string($erd) || $erd === '') {
                $this->logWarning('FastAPI ERD edit failed - invalid ERD format', [
                    'module_id' => $module->id,
                    'module_name' => $module->name,
                    'erd_type' => gettype($erd),
                    'erd_value' => is_string($erd) ? substr($erd, 0, 200) : $erd,
                ]);
                return back()->with('error', 'Received an invalid ERD response from AI service. Please try again.');
            }

            // Persist updated ERD and mark as synced
            DB::transaction(function () use ($module, $erd) {
                $module->erd = $erd;
                $module->erd_is_synced = true;
                $module->save();
            });

            // Refresh the module to ensure we have the latest data
            $module->refresh();

            return back()->with([
                'success' => 'ERD updated successfully using AI suggestions.',
                'erd' => $erd
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Validation exceptions are already handled by Laravel, but log for debugging
            $this->logWarning('Validation failed in ERD aiEdit', [
                'module_id' => $module->id,
                'errors' => $e->errors(),
            ]);
            throw $e; // Re-throw to let Laravel handle it
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            $this->logException($e, [
                'action' => 'aiEdit',
                'module_id' => $module->id,
                'fastapi_endpoint' => '/v1/ERD/edit',
                'error_type' => 'ConnectionException',
            ]);
            return back()->with('error', 'Unable to connect to AI service. Please check your connection and try again.');
        } catch (\Illuminate\Http\Client\RequestException $e) {
            $this->logException($e, [
                'action' => 'aiEdit',
                'module_id' => $module->id,
                'fastapi_endpoint' => '/v1/ERD/edit',
                'error_type' => 'RequestException',
            ]);
            return back()->with('error', 'AI service returned an error. Please try again later.');
        } catch (Throwable $e) {
            $this->logException($e, [
                'action' => 'aiEdit',
                'module_id' => $module->id,
                'fastapi_endpoint' => '/v1/ERD/edit',
                'error_type' => get_class($e),
            ]);

            return back()->with('error', 'Failed to edit ERD with AI. Please try again.');
        }
    }

    /**
     * Manually edit and save Module ERD content.
     *
     * Accepts ERD content from the frontend editor, validates and persists it to the database.
     *
     * @param Request $request Contains erd field with manual ERD content
     * @param Project $project The project the module belongs to
     * @param Module $module The module whose ERD will be updated
     * @return RedirectResponse Redirect with success or error flash message
     */
    public function edit(Request $request, Project $project, Module $module): RedirectResponse
    {
        try {
            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to access this module.');
            }

            $validated = $request->validate([
                'erd' => ['required', 'string', 'regex:/\S/'],
            ]);

            $erd = trim((string) $validated['erd']);

            // Persist ERD and mark as synced
            DB::transaction(function () use ($module, $erd) {
                $module->erd = $erd;
                $module->erd_is_synced = true;
                $module->save();
            });

            return back()->with([
                'success' => 'ERD saved successfully.',
                'erd' => $erd
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Validation exceptions are already handled by Laravel, but log for debugging
            $this->logWarning('Validation failed in ERD edit', [
                'module_id' => $module->id,
                'errors' => $e->errors(),
            ]);
            throw $e; // Re-throw to let Laravel handle it
        } catch (Throwable $e) {
            $this->logException($e, [
                'action' => 'edit',
                'module_id' => $module->id,
                'error_type' => get_class($e),
            ]);
            
            return back()->with('error', 'Failed to save ERD. Please try again.');
        }
    }

    /**
     * Sync module ERD from all feature datamodels.
     *
     * Collects all feature ERDs from the module and sends them to FastAPI
     * for AI-powered intelligent merging into a cohesive module-level ERD.
     * Preserves manual customizations while incorporating feature changes.
     *
     * @param Project $project The project the module belongs to
     * @param Module $module The module whose ERD will be synced
     * @return RedirectResponse Redirect with success or error flash message
     */
    public function syncFromFeatures(Project $project, Module $module): RedirectResponse
    {
        try {
            // Increase execution time for FastAPI calls
            $timeout = config('services.fastapi.timeout', 180);
            set_time_limit($timeout);

            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to access this module.');
            }

            // Load features with datamodels
            $features = $module->features()
                ->whereNotNull('datamodel')
                ->where('datamodel', '!=', '')
                ->get();

            // Validate that there are features to sync
            if ($features->isEmpty()) {
                return back()->with('error', 'No features with datamodels found. Please add feature datamodels before syncing.');
            }

            // Collect feature ERDs
            $featureErds = $features->pluck('datamodel')->toArray();

            // Prepare payload for FastAPI
            $payload = [
                'current_module_erd' => $module->erd ?? '',
                'feature_erds' => $featureErds,
                'module_name' => $module->name,
                'module_description' => $module->description ?? '',
            ];

            // Call FastAPI service
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $httpTimeout = config('services.fastapi.http_timeout', 120);
            $retryTimes = config('services.fastapi.retry_times', 2);
            $retryDelay = config('services.fastapi.retry_delay', 2000);

            $attemptCount = 0;
            $response = Http::asJson()
                ->acceptJson()
                ->timeout($httpTimeout)
                ->retry($retryTimes, $retryDelay, function ($exception, $request) use (&$attemptCount, $module) {
                    $attemptCount++;
                    $this->logWarning('FastAPI ERD sync retry attempt', [
                        'attempt' => $attemptCount,
                        'module_id' => $module->id,
                        'module_name' => $module->name,
                        'error' => $exception->getMessage(),
                    ]);
                    return true; // Always retry
                })
                ->post($fastApiBaseUrl . '/v1/ERD/sync', $payload);

            // Check response status
            if (!$response->ok()) {
                $this->logWarning('FastAPI ERD sync failed - invalid response status', [
                    'module_id' => $module->id,
                    'module_name' => $module->name,
                    'status' => $response->status(),
                    'response_body' => $response->body(),
                ]);
                return back()->with('error', 'Failed to sync ERD. The AI service is currently unavailable. Please try again later.');
            }

            // Extract and validate ERD
            $erd = data_get($response->json(), 'ERD');

            if (!is_string($erd) || $erd === '') {
                $this->logWarning('FastAPI ERD sync failed - invalid ERD format', [
                    'module_id' => $module->id,
                    'module_name' => $module->name,
                    'erd_type' => gettype($erd),
                    'erd_value' => is_string($erd) ? substr($erd, 0, 200) : $erd,
                ]);
                return back()->with('error', 'Received an invalid ERD response from AI service. Please try again.');
            }

            // Persist synced ERD and mark as synced
            DB::transaction(function () use ($module, $erd) {
                $module->erd = $erd;
                $module->erd_is_synced = true;
                $module->save();
            });

            return back()->with([
                'success' => 'Module ERD synced successfully from feature datamodels.',
                'erd' => $erd
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Validation exceptions are already handled by Laravel, but log for debugging
            $this->logWarning('Validation failed in ERD syncFromFeatures', [
                'module_id' => $module->id,
                'errors' => $e->errors(),
            ]);
            throw $e; // Re-throw to let Laravel handle it
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            $this->logException($e, [
                'action' => 'syncFromFeatures',
                'module_id' => $module->id,
                'fastapi_endpoint' => '/v1/ERD/sync',
                'error_type' => 'ConnectionException',
            ]);
            return back()->with('error', 'Unable to connect to AI service. Please check your connection and try again.');
        } catch (\Illuminate\Http\Client\RequestException $e) {
            $this->logException($e, [
                'action' => 'syncFromFeatures',
                'module_id' => $module->id,
                'fastapi_endpoint' => '/v1/ERD/sync',
                'error_type' => 'RequestException',
            ]);
            return back()->with('error', 'AI service returned an error. Please try again later.');
        } catch (Throwable $e) {
            $this->logException($e, [
                'action' => 'syncFromFeatures',
                'module_id' => $module->id,
                'fastapi_endpoint' => '/v1/ERD/sync',
                'error_type' => get_class($e),
            ]);

            return back()->with('error', 'Failed to sync ERD from features. Please try again.');
        }
    }
}
