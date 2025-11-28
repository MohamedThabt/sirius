<?php

namespace App\Http\Controllers\Feature;

use App\Http\Controllers\Controller;
use App\Http\Requests\Feature\CreateSystemFeaturesRequest;
use App\Models\Feature;
use App\Models\Project;
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

            $features = $project->features()
                ->orderBy('order_of_implementation')
                ->get();

            return Inertia::render('features/Index', [
                'project' => $project,
                'features' => $features,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'index', 'project_id' => $project->id]);

            return back()->with('error', 'Failed to load features. Please try again.');
        }
    }

    /**
     * Generate AI-powered feature suggestions for a project based on its base overview.
     *
     * Calls external FastAPI service to analyze project overview and generate feature suggestions.
     * Request data: None (uses project's baseOverviewVersion)
     *
     * @param Project $project The project to generate features for
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function generateSuggestionFeatures(Project $project)
    {
        try {
            // Authorization check
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            // Increase execution time for FastAPI calls
            set_time_limit(180);

            // Get the base overview version for the project
            $baseOverviewVersion = $project->baseOverviewVersion;

            if (! $baseOverviewVersion) {
                return back()->with('error', 'No base overview version found for this project.');
            }

            // Call the external API to generate features
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/features/suggestion/generate', [
                    'project_description' => $baseOverviewVersion->overview,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $generatedFeatures = $data['features'] ?? [];

                return Inertia::render('features/FeaturesSuggestion', [
                    'project' => $project,
                    'generatedFeatures' => $generatedFeatures,
                ]);
            } else {
                return back()->with('error', 'Failed to generate features from the AI service.');
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'generateSuggestionFeatures', 'project_id' => $project->id]);

            return back()->with('error', 'An error occurred while generating features. Please try again.');
        }
    }

    /**
     * Async endpoint for generating AI feature suggestions.
     *
     * This method processes feature generation asynchronously for better UX.
     * Request data: None (uses project's baseOverviewVersion)
     *
     * @param Project $project The project to generate features for
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function generateSuggestionsAsync(Project $project)
    {
        try {
            // Ensure user owns the project
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            // Increase execution time for FastAPI calls
            set_time_limit(180);

            // Get the base overview version for the project
            $baseOverviewVersion = $project->baseOverviewVersion;

            if (! $baseOverviewVersion) {
                return back()->with('error', 'No base overview version found for this project.');
            }

            // Call the external API to generate features
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/features/suggestion/generate', [
                    'project_description' => $baseOverviewVersion->overview,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $generatedFeatures = $data['features'] ?? [];

                return Inertia::render('features/FeaturesSuggestion', [
                    'project' => $project,
                    'generatedFeatures' => $generatedFeatures,
                ]);
            } else {
                return back()->with('error', 'Failed to generate features from the AI service.');
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'generateSuggestionsAsync', 'project_id' => $project->id]);

            return back()->with('error', 'An error occurred while generating features. Please try again.');
        }
    }

    /**
     * Create system features from AI-generated suggestions.
     *
     * Takes validated feature suggestions, enriches them via FastAPI, and stores in database.
     * Request data: Validated via CreateSystemFeaturesRequest (features array with name/description)
     *
     * @param CreateSystemFeaturesRequest $request The validated request containing features
     * @param Project $project The project to create features for
     * @return \Illuminate\Http\RedirectResponse
     */
    public function createSystemFeatures(CreateSystemFeaturesRequest $request, Project $project)
    {
        try {
            // Increase execution time for FastAPI calls
            set_time_limit(180);

            $overview = $project->baseOverviewVersion?->overview;

            $payload = [
                'features' => collect($request->validated('features'))
                    ->map(fn ($feature) => [
                        'name' => $feature['name'],
                        'description' => $feature['description'],
                    ])->values()->all(),
            ];

            if ($overview !== null) {
                $payload['overview'] = $overview;
            }

            // Call the external API to generate detailed features
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/features/detailed/generate', $payload);

            if (! $response->successful()) {
                return back()->with('error', 'Failed to generate detailed features from the AI service.');
            }

            $detailed = $response->json();
            $detailedFeatures = $detailed['features'] ?? [];

            DB::transaction(function () use ($detailedFeatures, $project) {
                foreach ($detailedFeatures as $item) {
                    $priority = $this->sanitizePriority($item['priority'] ?? 'medium');
                    $status = $this->sanitizeStatus($item['status'] ?? 'draft');

                    Feature::create([
                        'project_id' => $project->id,
                        'name' => $item['name'] ?? 'Unnamed Feature',
                        'summary' => $item['summary'] ?? ($item['description'] ?? ''),
                        'priority' => $priority,
                        'status' => $status,
                        'acceptance_criteria' => $item['acceptance_criteria'] ?? null,
                        'order_of_implementation' => (int) ($item['order_of_implementation'] ?? 0),
                        'user_flows' => $item['user_flows'] ?? null,
                        'metrics' => $item['metrics'] ?? null,
                        'description' => $item['description'] ?? null,
                        'erd' => $item['erd'] ?? null,
                        'sequence_diagram' => $item['sequence_diagram'] ?? null,
                        'wireframe' => $item['wireframe'] ?? null,
                    ]);
                }
            });

            return back()->with('success', 'Features created successfully.');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'createSystemFeatures', 'project_id' => $project->id]);

            return back()->with('error', 'An error occurred while creating features. Please try again.');
        }
    }

    /**
     * Create a single feature from user input via AI enrichment.
     *
     * Accepts basic feature details from modal form, enriches via FastAPI and stores in database.
     * Request data: name (required, string, 2-255 chars), description (required, string, 10-5000 chars)
     *
     * @param Request $request The request containing feature name and description
     * @param Project $project The project to create the feature for
     * @return \Illuminate\Http\RedirectResponse
     */
    public function createSingleFeature(Request $request, Project $project)
    {
        try {
            // Ensure user owns the project
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
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

            $payload = [
                'feature' => [
                    'name' => $name,
                    'description' => $description,
                ],
                'prd' => (string) ($project->prd ?? ''),
            ];

            // Call the external API to generate detailed feature
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/features/detailedSingle/generate', $payload);

            if (! $response->successful()) {
                return back()->with('error', 'Failed to generate feature details from the AI service.');
            }

            $detailed = $response->json();
            $detailedFeature = $detailed['feature'] ?? null;

            if (! is_array($detailedFeature)) {
                return back()->with('error', 'Invalid response received from the AI service.');
            }

            DB::transaction(function () use ($detailedFeature, $project) {
                $priority = $this->sanitizePriority($detailedFeature['priority'] ?? 'medium');

                Feature::create([
                    'project_id' => $project->id,
                    'name' => $detailedFeature['name'] ?? 'Unnamed Feature',
                    'summary' => $detailedFeature['summary'] ?? ($detailedFeature['description'] ?? ''),
                    'priority' => $priority,
                    'status' => 'draft',
                    'acceptance_criteria' => $detailedFeature['acceptance_criteria'] ?? null,
                    'order_of_implementation' => (int) ($detailedFeature['order_of_implementation'] ?? 0),
                    'user_flows' => $detailedFeature['user_flows'] ?? null,
                    'metrics' => $detailedFeature['metrics'] ?? null,
                    'description' => $detailedFeature['description'] ?? null,
                    'erd' => null,
                    'sequence_diagram' => null,
                    'wireframe' => null,
                ]);
            });

            return back()->with('success', 'Feature created successfully.');
        } catch (\Throwable $e) {
            $this->logException($e, [
                'action' => 'createSingleFeature',
                'project_id' => $project->id,
                'feature_name' => $request->input('name'),
            ]);

            return back()->with('error', 'An error occurred while creating the feature. Please try again.');
        }
    }

    /**
     * Display a specific feature with its design and diagram sections.
     *
     * @param Feature $feature The feature to display
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function show(Feature $feature)
    {
        try {
            $project = $feature->project;

            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            return Inertia::render('features/FeatureShow', [
                'project' => $project,
                'feature' => $feature,
                'erd' => $feature->erd,
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
     * @param Feature $feature The feature to update
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Feature $feature)
    {
        try {
            $project = $feature->project;

            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            $validated = request()->validate([
                'name' => 'nullable|string|max:255',
                'summary' => 'nullable|string',
                'description' => 'nullable|string',
                'acceptance_criteria' => 'nullable|string',
                'status' => 'nullable|in:draft,in_progress,completed,archived',
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
     * @param Feature $feature The feature to generate specs for
     * @param FeatureSpecService $featureSpecService The service to generate markdown specs
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function specs(Feature $feature, FeatureSpecService $featureSpecService)
    {
        try {
            $project = $feature->project;

            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            $specsMarkdown = $featureSpecService->generateSpecsMarkdown($feature);

            return Inertia::render('features/Specs', [
                'project' => $project,
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
     * @return string Valid status value (draft, in_progress, completed, archived)
     */
    private function sanitizeStatus(string $status): string
    {
        $status = strtolower($status);

        return in_array($status, ['draft', 'in_progress', 'completed', 'archived'], true)
            ? $status
            : 'draft';
    }
}
