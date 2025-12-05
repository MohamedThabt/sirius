<?php

namespace App\Http\Controllers\Feature;

use App\Http\Controllers\Controller;
use App\Http\Requests\Feature\CreateSystemFeaturesRequest;
use App\Models\Feature;
use App\Models\Module;
use App\Models\Project;
use App\Models\SuggestedFeature;
use App\Services\Feature\FeatureSpecService;
use App\Traits\StructuredLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class FeaturesController extends Controller
{
    use StructuredLogger;

    /**
     * Generate AI-powered feature suggestions for a module based on its ERD.
     * 
     * Checks if cached suggestions exist, requires ERD to be generated first.
     *
     * @param Project $project The project containing the module
     * @param Module $module The module to generate features for
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function generateSuggestionFeatures(Project $project, Module $module)
    {
        try {
            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this module.');
            }

            // Check if module has ERD
            if (!$module->canGenerateFeatures()) {
                return back()->with('error', 'Module ERD must be generated before creating features.');
            }

            // Check if cached suggestions exist
            $cachedFeatures = SuggestedFeature::where('module_id', $module->id)
                ->orderBy('order_of_implementation')
                ->get();

            if ($cachedFeatures->isNotEmpty()) {
                // Return cached suggestions
                return Inertia::render('features/FeaturesSuggestion', [
                    'project' => $project,
                    'module' => $module,
                    'generatedFeatures' => $cachedFeatures->map(function ($feature) {
                        return [
                            'name' => $feature->name,
                            'description' => $feature->description,
                            'summary' => $feature->summary,
                            'priority' => $feature->priority,
                        ];
                    })->toArray(),
                    'fromCache' => true,
                ]);
            }

            // Increase execution time for FastAPI calls
            set_time_limit(180);

            // Get existing features in the module
            $existingFeatures = $module->features()
                ->orderBy('order_of_implementation')
                ->get(['name', 'description', 'order_of_implementation']);

            // Prepare module context
            $moduleContext = [
                'name' => $module->name,
                'description' => $module->description ?? '',
                'metrics' => $module->metrics,
                'erd' => $module->erd,
            ];

            $existingFeaturesArray = $existingFeatures->map(function ($feature) {
                return [
                    'name' => $feature->name,
                    'description' => $feature->description ?? '',
                    'order_of_implementation' => $feature->order_of_implementation,
                ];
            })->toArray();

            // Call the external API to generate feature suggestions
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/features/module/suggestion/generate', [
                    'module_context' => $moduleContext,
                    'existing_features' => $existingFeaturesArray,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $generatedFeatures = $data['features'] ?? [];

                // Cache the suggestions
                DB::transaction(function () use ($module, $generatedFeatures) {
                    // Clear any existing suggestions for this module
                    SuggestedFeature::where('module_id', $module->id)->delete();

                    // Store new suggestions
                    foreach ($generatedFeatures as $index => $feature) {
                        SuggestedFeature::create([
                            'module_id' => $module->id,
                            'name' => $feature['name'] ?? '',
                            'description' => $feature['description'] ?? '',
                            'priority' => 'medium',
                            'order_of_implementation' => $index + 1,
                        ]);
                    }
                });

                return Inertia::render('features/FeaturesSuggestion', [
                    'project' => $project,
                    'module' => $module,
                    'generatedFeatures' => $generatedFeatures,
                    'fromCache' => false,
                ]);
            } else {
                return back()->with('error', 'Failed to generate features from the AI service.');
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'generateSuggestionFeatures', 'module_id' => $module->id]);

            return back()->with('error', 'An error occurred while generating features. Please try again.');
        }
    }

    /**
     * Regenerate feature suggestions with user feedback.
     *
     * @param Request $request
     * @param Project $project The project containing the module
     * @param Module $module The module to regenerate features for
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function regenerateSuggestionFeatures(Request $request, Project $project, Module $module)
    {
        try {
            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this module.');
            }

            // Check if module has ERD
            if (!$module->canGenerateFeatures()) {
                return back()->with('error', 'Module ERD must exist to regenerate features.');
            }

            $validated = $request->validate([
                'user_notes' => 'required|string|min:10|max:2000',
                'previous_features' => 'required|array|min:1',
                'previous_features.*.name' => 'required|string',
                'previous_features.*.description' => 'required|string',
            ]);

            // Clear cached suggestions
            SuggestedFeature::where('module_id', $module->id)->delete();

            // Increase execution time for FastAPI calls
            set_time_limit(180);

            // Get existing features in the module
            $existingFeatures = $module->features()
                ->orderBy('order_of_implementation')
                ->get(['name', 'description', 'order_of_implementation']);

            // Prepare module context
            $moduleContext = [
                'name' => $module->name,
                'description' => $module->description ?? '',
                'metrics' => $module->metrics,
                'erd' => $module->erd,
            ];

            $existingFeaturesArray = $existingFeatures->map(function ($feature) {
                return [
                    'name' => $feature->name,
                    'description' => $feature->description ?? '',
                    'order_of_implementation' => $feature->order_of_implementation,
                ];
            })->toArray();

            // Call the external API to regenerate features with user feedback
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/features/module/suggestion/regenerate', [
                    'module_context' => $moduleContext,
                    'previous_features' => $validated['previous_features'],
                    'user_notes' => $validated['user_notes'],
                    'existing_features' => $existingFeaturesArray,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $generatedFeatures = $data['features'] ?? [];

                // Cache the new suggestions
                DB::transaction(function () use ($module, $generatedFeatures) {
                    foreach ($generatedFeatures as $index => $feature) {
                        SuggestedFeature::create([
                            'module_id' => $module->id,
                            'name' => $feature['name'] ?? '',
                            'description' => $feature['description'] ?? '',
                            'priority' => 'medium',
                            'order_of_implementation' => $index + 1,
                        ]);
                    }
                });

                return Inertia::render('features/FeaturesSuggestion', [
                    'project' => $project,
                    'module' => $module,
                    'generatedFeatures' => $generatedFeatures,
                    'fromCache' => false,
                ]);
            } else {
                return back()->with('error', 'Failed to regenerate features from the AI service.');
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'regenerateSuggestionFeatures', 'module_id' => $module->id]);

            return back()->with('error', 'An error occurred while regenerating features. Please try again.');
        }
    }

    /**
     * Create system features from selected suggestions for a module.
     * 
     * Calls FastAPI to enrich features with detailed descriptions and acceptance criteria.
     *
     * @param Request $request
     * @param Project $project
     * @param Module $module
     * @return \Illuminate\Http\RedirectResponse
     */
    public function createSystemFeatures(Request $request, Project $project, Module $module)
    {
        try {
            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this module.');
            }

            $validated = $request->validate([
                'features' => 'required|array|min:1',
                'features.*.name' => 'required|string|max:255',
                'features.*.description' => 'nullable|string',
            ]);

            // Increase execution time for FastAPI calls
            set_time_limit(180);

            // Get existing features for context
            $existingFeatures = $module->features()
                ->orderBy('order_of_implementation')
                ->get(['name', 'description', 'order_of_implementation']);

            // Prepare module context
            $moduleContext = [
                'name' => $module->name,
                'description' => $module->description ?? '',
                'metrics' => $module->metrics,
                'erd' => $module->erd,
            ];

            $existingFeaturesArray = $existingFeatures->map(function ($feature) {
                return [
                    'name' => $feature->name,
                    'description' => $feature->description ?? '',
                    'order_of_implementation' => $feature->order_of_implementation,
                ];
            })->toArray();

            // Prepare features for enrichment (only name and description)
            $featuresForEnrichment = array_map(function ($feature) {
                return [
                    'name' => $feature['name'],
                    'description' => $feature['description'] ?? '',
                ];
            }, $validated['features']);

            // Call FastAPI to enrich features with details
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/features/module/details/generate', [
                    'module_context' => $moduleContext,
                    'features' => $featuresForEnrichment,
                    'existing_features' => $existingFeaturesArray,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $enrichedFeatures = $data['features'] ?? [];

                if (empty($enrichedFeatures)) {
                    return back()->with('error', 'AI enrichment returned no features. Please try again.');
                }

                // Create features with enriched data and delete suggested features
                DB::transaction(function () use ($module, $enrichedFeatures) {
                    // Delete suggested features for this module
                    SuggestedFeature::where('module_id', $module->id)->delete();

                    // Create enriched features
                    foreach ($enrichedFeatures as $index => $featureData) {
                        Feature::create([
                            'module_id' => $module->id,
                            'name' => $featureData['name'],
                            'summary' => $featureData['summary'] ?? null,
                            'description' => $featureData['description'] ?? null,
                            'acceptance_criteria' => $featureData['acceptance_criteria'] ?? null,
                            'user_flows' => $featureData['user_flows'] ?? null,
                            'metrics' => $featureData['metrics'] ?? null,
                            'priority' => $this->sanitizePriority($featureData['priority'] ?? 'medium'),
                            'status' => 'draft',
                            'order_of_implementation' => $featureData['order_of_implementation'] ?? ($index + 1),
                        ]);
                    }
                });

                return redirect()->route('modules.show', ['project' => $project, 'module' => $module])
                    ->with('success', 'Features created and enriched successfully!');
            } else {
                return back()->with('error', 'Failed to enrich features from the AI service. Please try again.');
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'createSystemFeatures', 'module_id' => $module->id]);

            return back()->with('error', 'Failed to create features. Please try again.');
        }
    }

    /**
     * Create a single feature for a module using AI enrichment.
     *
     * @param Request $request
     * @param Project $project
     * @param Module $module
     * @return \Illuminate\Http\RedirectResponse
     */
    public function createSingleFeature(Request $request, Project $project, Module $module)
    {
        try {
            // Ensure user owns the project
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this module.');
            }

            // Get and validate request data
            $input = $request->only(['name', 'description']);

            $trimmedInput = collect($input)
                ->map(fn ($value) => is_string($value) ? trim($value) : $value)
                ->toArray();

            $validated = Validator::make($trimmedInput, [
                'name' => ['required', 'string', 'min:2', 'max:255'],
                'description' => ['required', 'string', 'min:10', 'max:5000'],
            ])->validate();

            $name = $validated['name'];
            $description = $validated['description'];

            // Increase execution time for FastAPI calls
            set_time_limit(180);

            // Get existing features for context
            $existingFeatures = $module->features()
                ->orderBy('order_of_implementation')
                ->get(['name', 'description', 'order_of_implementation']);

            // Prepare module context
            $moduleContext = [
                'name' => $module->name,
                'description' => $module->description ?? '',
                'metrics' => $module->metrics,
                'erd' => $module->erd,
            ];

            $existingFeaturesArray = $existingFeatures->map(function ($feature) {
                return [
                    'name' => $feature->name,
                    'description' => $feature->description ?? '',
                    'order_of_implementation' => $feature->order_of_implementation,
                ];
            })->toArray();

            $payload = [
                'module_context' => $moduleContext,
                'new_feature_name' => $name,
                'new_feature_description' => $description,
                'existing_features' => $existingFeaturesArray,
            ];

            // Call the external API to generate detailed feature
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/features/module/single/generate', $payload);

            if (!$response->successful()) {
                return back()->with('error', 'Failed to generate feature details from the AI service.');
            }

            $detailed = $response->json();
            $detailedFeature = $detailed['feature'] ?? null;

            if (!is_array($detailedFeature)) {
                return back()->with('error', 'Invalid response received from the AI service.');
            }

            DB::transaction(function () use ($module, $detailedFeature, $existingFeatures) {
                $priority = $this->sanitizePriority($detailedFeature['priority'] ?? 'medium');
                $suggestedOrder = (int)($detailedFeature['order_of_implementation'] ?? 0);

                // Check for order conflicts
                $finalOrder = $suggestedOrder;
                if ($existingFeatures->contains('order_of_implementation', $suggestedOrder)) {
                    $finalOrder = $existingFeatures->max('order_of_implementation') + 1;
                }

                Feature::create([
                    'module_id' => $module->id,
                    'name' => $detailedFeature['name'] ?? 'Unnamed Feature',
                    'summary' => $detailedFeature['summary'] ?? ($detailedFeature['description'] ?? ''),
                    'description' => $detailedFeature['description'] ?? null,
                    'acceptance_criteria' => $detailedFeature['acceptance_criteria'] ?? null,
                    'user_flows' => $detailedFeature['user_flows'] ?? null,
                    'metrics' => $detailedFeature['metrics'] ?? null,
                    'priority' => $priority,
                    'status' => 'draft',
                    'order_of_implementation' => $finalOrder,
                ]);
            });

            return back()->with('success', 'Feature created successfully.');
        } catch (\Throwable $e) {
            $this->logException($e, [
                'action' => 'createSingleFeature',
                'module_id' => $module->id,
                'feature_name' => $request->input('name'),
            ]);

            return back()->with('error', 'An error occurred while creating the feature. Please try again.');
        }
    }


    /**
     * Display a listing of features for the specified project.
     *
     * @param Project $project The project to retrieve features for
     * @return \Inertia\Response
     */
    public function index(Project $project)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            $project->load('modules.features');
            
            // Get all features across all modules with module status info
            $features = Feature::whereHas('module', function ($query) use ($project) {
                $query->where('project_id', $project->id);
            })
            ->with(['module:id,name,status'])
            ->orderBy('order_of_implementation')
            ->get();

            return Inertia::render('features/Index', [
                'project' => $project,
                'features' => $features,
                'modules' => $project->modules,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'index', 'project_id' => $project->id]);

            return back()->with('error', 'Failed to load features. Please try again.');
        }
    }

    /**
     * Display a specific feature with its design and diagram sections.
     *
     * @param Project $project The project containing the module
     * @param Module $module The module containing the feature
     * @param Feature $feature The feature to display
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function show(Project $project, Module $module, Feature $feature)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this feature.');
            }

            return Inertia::render('features/FeatureShow', [
                'project' => $project,
                'module' => $module,
                'feature' => $feature,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'show', 'feature_id' => $feature->id]);

            return back()->with('error', 'Failed to load feature details. Please try again.');
        }
    }

    /**
     * Update a feature's editable fields.
     *
     * Request data: name, summary, description, acceptance_criteria, status, priority,
     * order_of_implementation, user_flows, metrics (all optional)
     *
     * @param Project $project The project containing the module
     * @param Module $module The module containing the feature
     * @param Feature $feature The feature to update
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Project $project, Module $module, Feature $feature)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to update this feature.');
            }

            $validated = request()->validate([
                'name' => 'nullable|string|max:255',
                'summary' => 'nullable|string',
                'description' => 'nullable|string',
                'acceptance_criteria' => 'nullable|string',
                'status' => 'nullable|in:draft,todo,in_progress,review,done',
                'priority' => 'nullable|in:low,medium,high,critical',
                'order_of_implementation' => 'nullable|integer|min:1',
                'user_flows' => 'nullable|string',
                'metrics' => 'nullable|string',
            ]);

            $feature->update($validated);

            return back()->with('success', 'Feature updated successfully.');
        } catch (\Throwable $e) {
            $this->logException($e, [
                'action' => 'update',
                'feature_id' => $feature->id,
                'input_data' => request()->only([
                    'name', 'summary', 'description', 'acceptance_criteria',
                    'status', 'priority', 'order_of_implementation', 'user_flows', 'metrics',
                ]),
            ]);

            return back()->with('error', 'Failed to update feature. Please try again.');
        }
    }

    /**
     * Display feature specifications in markdown format.
     *
     * Generates comprehensive feature specifications document using the FeatureSpecService.
     *
     * @param Project $project The project containing the module
     * @param Module $module The module containing the feature
     * @param Feature $feature The feature to generate specs for
     * @param FeatureSpecService $featureSpecService The service to generate markdown specs
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function specs(Project $project, Module $module, Feature $feature, FeatureSpecService $featureSpecService)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this feature.');
            }

            $specsMarkdown = $featureSpecService->generateSpecsMarkdown($feature);

            return Inertia::render('features/Specs', [
                'project' => $project,
                'module' => $module,
                'feature' => $feature,
                'specsMarkdown' => $specsMarkdown,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'specs', 'feature_id' => $feature->id]);

            return back()->with('error', 'Failed to generate feature specifications. Please try again.');
        }
    }

    /**
     * Sanitize and validate priority value.
     *
     * @param string $priority The priority value to sanitize
     * @return string Valid priority value (low, medium, high, critical)
     */
    private function sanitizePriority(string $priority): string
    {
        $priority = strtolower($priority);

        return in_array($priority, ['low', 'medium', 'high', 'critical'], true)
            ? $priority
            : 'medium';
    }

    /**
     * Sanitize and validate status value.
     *
     * @param string $status The status value to sanitize
     * @return string Valid status value (draft, todo, in_progress, review, done)
     */
    private function sanitizeStatus(string $status): string
    {
        $status = strtolower($status);

        return in_array($status, ['draft', 'todo', 'in_progress', 'review', 'done'], true)
            ? $status
            : 'draft';
    }
}
