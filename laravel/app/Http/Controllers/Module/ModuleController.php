<?php

namespace App\Http\Controllers\Module;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Project;
use App\Models\SuggestedModule;
use App\Traits\StructuredLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ModuleController extends Controller
{
    use StructuredLogger;

    /**
     * Display a listing of modules for the specified project.
     *
     * @param Project $project The project to retrieve modules for
     * @return \Inertia\Response
     */
    public function index(Project $project)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            $modules = $project->modules()
                ->orderBy('order_of_implementation')
                ->get();

            return Inertia::render('modules/Index', [
                'project' => $project,
                'modules' => $modules,
                'repository' => $project->repository,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'index', 'project_id' => $project->id]);

            return back()->with('error', 'Failed to load modules. Please try again.');
        }
    }

    /**
     * Generate AI-powered module suggestions for a project.
     * 
     * Checks if cached suggestions exist, otherwise calls FastAPI to generate new ones.
     *
     * @param Project $project The project to generate modules for
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function generateSuggestionModules(Project $project)
    {
        try {
            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            // If project already has modules, redirect back with info message
            if ($project->modules()->exists()) {
                return back()->with('info', 'This project already has modules. Use "Add Module" to add more.');
            }

            // Check if cached suggestions exist
            $cachedModules = SuggestedModule::where('project_id', $project->id)
                ->orderBy('order_of_implementation')
                ->get();

            if ($cachedModules->isNotEmpty()) {
                // Return cached suggestions
                return Inertia::render('modules/ModulesSuggestion', [
                    'project' => $project,
                    'generatedModules' => $cachedModules->map(function ($module) {
                        return [
                            'name' => $module->name,
                            'description' => $module->description,
                            'metrics' => $module->metrics,
                        ];
                    })->toArray(),
                    'fromCache' => true,
                    'repository' => $project->repository,
                ]);
            }

            // Increase execution time for FastAPI calls
            set_time_limit(180);

            // Get the base overview version for the project
            $baseOverviewVersion = $project->baseOverviewVersion;

            if (!$baseOverviewVersion) {
                return back()->with('error', 'No base overview found for this project. Please create an overview first.');
            }

            // Call the external API to generate modules
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/modules/suggestion/generate', [
                    'project_description' => $baseOverviewVersion->overview,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $generatedModules = $data['modules'] ?? [];

                // Cache the suggestions
                DB::transaction(function () use ($project, $generatedModules) {
                    // Clear any existing suggestions for this project
                    SuggestedModule::where('project_id', $project->id)->delete();

                    // Store new suggestions
                    foreach ($generatedModules as $index => $module) {
                        SuggestedModule::create([
                            'project_id' => $project->id,
                            'name' => $module['name'] ?? '',
                            'description' => $module['description'] ?? '',
                            'metrics' => $module['metrics'] ?? '',
                            'order_of_implementation' => $index + 1,
                        ]);
                    }
                });

                return Inertia::render('modules/ModulesSuggestion', [
                    'project' => $project,
                    'generatedModules' => $generatedModules,
                    'fromCache' => false,
                    'repository' => $project->repository,
                ]);
            } else {
                return back()->with('error', 'Failed to generate modules from the AI service.');
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'generateSuggestionModules', 'project_id' => $project->id]);

            return back()->with('error', 'An error occurred while generating modules. Please try again.');
        }
    }

    /**
     * Regenerate module suggestions with user feedback.
     *
     * @param Request $request
     * @param Project $project The project to regenerate modules for
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function regenerateSuggestionModules(Request $request, Project $project)
    {
        try {
            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            $validated = $request->validate([
                'user_notes' => 'required|string|min:10|max:2000',
                'previous_modules' => 'required|array|min:1',
                'previous_modules.*.name' => 'required|string',
                'previous_modules.*.description' => 'required|string',
            ]);

            // Clear cached suggestions
            SuggestedModule::where('project_id', $project->id)->delete();

            // Increase execution time for FastAPI calls
            set_time_limit(180);

            // Get the base overview version for the project
            $baseOverviewVersion = $project->baseOverviewVersion;

            if (!$baseOverviewVersion) {
                return back()->with('error', 'No base overview found for this project. Please create an overview first.');
            }

            // Call the external API to regenerate modules with user feedback
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/modules/suggestion/regenerate', [
                    'project_description' => $baseOverviewVersion->overview,
                    'previous_modules' => $validated['previous_modules'],
                    'user_notes' => $validated['user_notes'],
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $generatedModules = $data['modules'] ?? [];

                // Cache the new suggestions
                DB::transaction(function () use ($project, $generatedModules) {
                    foreach ($generatedModules as $index => $module) {
                        SuggestedModule::create([
                            'project_id' => $project->id,
                            'name' => $module['name'] ?? '',
                            'description' => $module['description'] ?? '',
                            'metrics' => $module['metrics'] ?? '',
                            'order_of_implementation' => $index + 1,
                        ]);
                    }
                });

                return Inertia::render('modules/ModulesSuggestion', [
                    'project' => $project,
                    'generatedModules' => $generatedModules,
                    'fromCache' => false,
                    'repository' => $project->repository,
                ]);
            } else {
                return back()->with('error', 'Failed to regenerate modules from the AI service.');
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'regenerateSuggestionModules', 'project_id' => $project->id]);

            return back()->with('error', 'An error occurred while regenerating modules. Please try again.');
        }
    }

    /**
     * Create system modules from selected suggestions.
     * 
     * Calls FastAPI to enrich modules with detailed descriptions, metrics, and implementation order.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function createSystemModules(Request $request, Project $project)
    {
        try {
            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            $validated = $request->validate([
                'modules' => 'required|array|min:1',
                'modules.*.name' => 'required|string|max:255',
                'modules.*.description' => 'nullable|string',
                'modules.*.metrics' => 'nullable|string',
            ]);

            // Increase execution time for FastAPI calls
            set_time_limit(180);

            // Get the base overview version for the project
            $baseOverviewVersion = $project->baseOverviewVersion;

            if (!$baseOverviewVersion) {
                return back()->with('error', 'No base overview found for this project. Please create an overview first.');
            }

            // Prepare technical intake if exists
            $technicalIntake = null;
            if ($project->technicalIntake) {
                $tech = $project->technicalIntake;
                $technicalIntake = [
                    'platform_targets' => $tech->platform_targets,
                    'frontend_tech' => $tech->frontend_tech,
                    'backend_tech' => $tech->backend_tech,
                    'database_tech' => $tech->database_tech,
                    'ai_usage' => $tech->ai_usage,
                    'external_services' => $tech->external_services,
                ];
            }

            // Prepare modules for enrichment (only name and description)
            $modulesForEnrichment = array_map(function ($module) {
                return [
                    'name' => $module['name'],
                    'description' => $module['description'] ?? '',
                ];
            }, $validated['modules']);

            // Call FastAPI to enrich modules with details
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/modules/details/generate', [
                    'project_description' => $baseOverviewVersion->overview,
                    'modules' => $modulesForEnrichment,
                    'technical_intake' => $technicalIntake,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $enrichedModules = $data['modules'] ?? [];

                if (empty($enrichedModules)) {
                    return back()->with('error', 'AI enrichment returned no modules. Please try again.');
                }

                // Create modules with enriched data and delete suggested modules
                DB::transaction(function () use ($project, $enrichedModules) {
                    // Delete suggested modules for this project
                    SuggestedModule::where('project_id', $project->id)->delete();

                    // Create enriched modules
                    foreach ($enrichedModules as $index => $moduleData) {
                        Module::create([
                            'project_id' => $project->id,
                            'name' => $moduleData['name'],
                            'description' => $moduleData['description'] ?? null,
                            'metrics' => $moduleData['metrics'] ?? null,
                            'status' => 'planned',
                            'order_of_implementation' => $moduleData['order_of_implementation'] ?? ($index + 1),
                        ]);
                    }

                    // Mark PRD as unsynced since modules changed
                    if ($project->prd !== null) {
                        $project->update(['prd_is_synced' => false]);
                    }
                });

                return redirect()->route('modules.index', $project)
                    ->with('success', 'Modules created and enriched successfully!');
            } else {
                return back()->with('error', 'Failed to enrich modules from the AI service. Please try again.');
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'createSystemModules', 'project_id' => $project->id]);

            return back()->with('error', 'Failed to create modules. Please try again.');
        }
    }

    /**
     * Show a specific module.
     *
     * @param Project $project
     * @param Module $module
     * @return \Inertia\Response
     */
    public function show(Project $project, Module $module)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this module.');
            }

            $module->load('features');

            return Inertia::render('modules/ModuleShow', [
                'project' => $project,
                'module' => $module,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'show', 'module_id' => $module->id]);

            return back()->with('error', 'Failed to load module. Please try again.');
        }
    }

    /**
     * Update a specific module.
     *
     * @param Request $request
     * @param Project $project
     * @param Module $module
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Project $project, Module $module)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to update this module.');
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'sometimes|nullable|string',
                'metrics' => 'sometimes|nullable|string',
                'erd' => 'sometimes|nullable|string',
                'status' => 'sometimes|in:planned,in_progress,completed',
                'order_of_implementation' => 'sometimes|integer|min:1',
            ]);

            $module->update($validated);

            return back()->with('success', 'Module updated successfully!');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'update', 'module_id' => $module->id]);

            return back()->with('error', 'Failed to update module. Please try again.');
        }
    }

    /**
     * Delete a specific module.
     *
     * @param Project $project
     * @param Module $module
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Project $project, Module $module)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to delete this module.');
            }

            // Ensure the module belongs to the project
            if ($module->project_id !== $project->id) {
                return back()->with('error', 'Module does not belong to this project.');
            }

            $moduleName = $module->name;
            $module->delete();

            // Mark PRD as unsynced since modules changed
            if ($project->prd !== null) {
                $project->update(['prd_is_synced' => false]);
            }

            return back()->with('success', "Module '{$moduleName}' deleted successfully!");
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'destroy', 'module_id' => $module->id]);

            return back()->with('error', 'Failed to delete module. Please try again.');
        }
    }

    /**
     * Create a single module for a project using AI enrichment.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function createSingleModule(Request $request, Project $project)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to add modules to this project.');
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string|min:10|max:5000',
            ]);

            // Get project overview for AI context
            $baseOverviewVersion = $project->baseOverviewVersion;
            if (!$baseOverviewVersion) {
                return back()->with('error', 'No base overview found for this project. Please create an overview first.');
            }

            // Increase execution time for FastAPI calls
            set_time_limit(120);

            // Get existing modules for context
            $existingModules = $project->modules()
                ->select('name', 'description', 'order_of_implementation')
                ->orderBy('order_of_implementation')
                ->get()
                ->map(fn($m) => [
                    'name' => $m->name,
                    'description' => $m->description ?? '',
                    'order_of_implementation' => $m->order_of_implementation ?? 0,
                ])
                ->toArray();

            // Call FastAPI dedicated single module endpoint with existing modules context
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(90)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/modules/single/generate', [
                    'project_description' => $baseOverviewVersion->overview,
                    'new_module_name' => $validated['name'],
                    'new_module_description' => $validated['description'],
                    'existing_modules' => $existingModules,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $enrichedModule = $data['module'] ?? null;

                if ($enrichedModule) {
                    // Get the max order considering existing modules
                    $maxOrder = $project->modules()->max('order_of_implementation') ?? 0;
                    $suggestedOrder = $enrichedModule['order_of_implementation'] ?? 1;
                    
                    // If suggested order is lower than or equal to existing, append to end
                    $finalOrder = max($maxOrder + 1, $suggestedOrder);

                    $module = $project->modules()->create([
                        'name' => $enrichedModule['name'] ?? $validated['name'],
                        'description' => $enrichedModule['description'] ?? $validated['description'],
                        'metrics' => $enrichedModule['metrics'] ?? null,
                        'status' => 'planned',
                        'order_of_implementation' => $finalOrder,
                    ]);

                    // Mark PRD as unsynced since a new module was added
                    if ($project->prd !== null) {
                        $project->update(['prd_is_synced' => false]);
                    }

                    return redirect()->route('modules.show', $module)
                        ->with('success', 'Module created and enriched successfully!');
                }
            }

            // Fallback: Create module without AI enrichment if API fails
            $this->logWarning('FastAPI enrichment failed for single module, creating without enrichment', [
                'project_id' => $project->id,
                'response_status' => $response->status(),
            ]);

            $maxOrder = $project->modules()->max('order_of_implementation') ?? 0;
            $module = $project->modules()->create([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'status' => 'planned',
                'order_of_implementation' => $maxOrder + 1,
            ]);

            // Mark PRD as unsynced since a new module was added
            if ($project->prd !== null) {
                $project->update(['prd_is_synced' => false]);
            }

            return redirect()->route('modules.show', $module)
                ->with('success', 'Module created successfully! (AI enrichment unavailable)');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'createSingleModule', 'project_id' => $project->id]);

            return back()->with('error', 'Failed to create module. Please try again.');
        }
    }
}
