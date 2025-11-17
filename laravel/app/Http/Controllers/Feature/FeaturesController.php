<?php

namespace App\Http\Controllers\Feature;

use App\Http\Controllers\Controller;
use App\Http\Requests\Feature\CreateSystemFeaturesRequest;
use App\Models\Feature;
use App\Models\Project;
use App\Services\Feature\FeatureSpecService;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class FeaturesController extends Controller
{
    /**
     * Generate suggestion features for a project based on its base overview version.
     */
    public function generateSuggestionFeatures(Project $project)
    {
        // Increase execution time for FastAPI calls
        set_time_limit(180);
        // Get the base overview version for the project
        $baseOverviewVersion = $project->baseOverviewVersion;

        if (! $baseOverviewVersion) {
            return redirect()->back()->with('error', 'No base overview version found for this project.');
        }

        try {
            // Call the external API to generate features
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/features/suggestion/generate', [
                    'project_description' => $baseOverviewVersion->overview,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $generatedFeatures = $data['features'] ?? [];

                // Return the features to the frontend
                return Inertia::render('features/FeaturesSuggestion', [
                    'project' => $project,
                    'generatedFeatures' => $generatedFeatures,
                ]);
            } else {
                return redirect()->back()->with('error', 'Failed to generate features from the AI service.');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while generating features: '.$e->getMessage());
        }
    }

    /**
     * Async generation endpoint that actually processes the features
     */
    public function generateSuggestionsAsync(Project $project)
    {
        // Increase execution time for FastAPI calls
        set_time_limit(180);

        // Ensure user owns the project
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        // Get the base overview version for the project
        $baseOverviewVersion = $project->baseOverviewVersion;

        if (! $baseOverviewVersion) {
            return redirect()->back()->with('error', 'No base overview version found for this project.');
        }

        try {
            // Call the external API to generate features
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/features/suggestion/generate', [
                    'project_description' => $baseOverviewVersion->overview,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $generatedFeatures = $data['features'] ?? [];

                // Return the features to the frontend
                return Inertia::render('features/FeaturesSuggestion', [
                    'project' => $project,
                    'generatedFeatures' => $generatedFeatures,
                ]);
            } else {
                return redirect()->back()->with('error', 'Failed to generate features from the AI service.');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while generating features: '.$e->getMessage());
        }
    }

    public function createSystemFeatures(CreateSystemFeaturesRequest $request, Project $project)
    {
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

        try {
            // Call the external API to generate detailed features
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/features/detailed/generate', $payload);

            if (! $response->successful()) {
                return redirect()->back()->with('error', 'Failed to generate detailed features from the AI service.');
            }

            $detailed = $response->json();
            $detailedFeatures = $detailed['features'] ?? [];

            DB::transaction(function () use ($detailedFeatures, $project) {
                foreach ($detailedFeatures as $item) {
                    $priority = strtolower($item['priority'] ?? 'medium');
                    if (! in_array($priority, ['low', 'medium', 'high', 'critical'], true)) {
                        $priority = 'medium';
                    }

                    $status = strtolower($item['status'] ?? 'draft');
                    if (! in_array($status, ['draft', 'in_progress', 'completed', 'archived'], true)) {
                        $status = 'draft';
                    }

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

            return redirect()->route('projects.show', ['project' => $project, 'tab' => 'features'])->with('success', 'Features created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while creating features: '.$e->getMessage());
        }
    }

    /**
     * Create a single feature from the modal form via FastAPI
     */
    public function createSingleFeature(Request $request, Project $project)
    {
        // Ensure user owns the project
        if ($project->user_id !== auth()->id()) {
            abort(403);
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

        try {
            // Call the external API to generate detailed feature
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/features/detailedSingle/generate', $payload);

            if (! $response->successful()) {
                Log::error('FastAPI feature generation failed', [
                    'project_id' => $project->id,
                    'feature_name' => $name,
                    'status_code' => $response->status(),
                    'response' => $response->body(),
                ]);
                return redirect()->back()->with('error', 'Failed to generate feature details from the AI service.');
            }

            $detailed = $response->json();
            $detailedFeature = $detailed['feature'] ?? null;

            if (! is_array($detailedFeature)) {
                Log::error('Invalid detailed feature structure returned from FastAPI', [
                    'project_id' => $project->id,
                    'feature_name' => $name,
                    'response' => $detailed,
                ]);

                return redirect()->back()->with('error', 'Invalid response received from the AI service.');
            }

            $createdFeature = null;

            DB::transaction(function () use ($detailedFeature, $project, &$createdFeature) {
                $priority = strtolower($detailedFeature['priority'] ?? 'medium');
                if (! in_array($priority, ['low', 'medium', 'high', 'critical'], true)) {
                    $priority = 'medium';
                }

                $createdFeature = Feature::create([
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

            return redirect()->route('projects.show', ['project' => $project, 'tab' => 'features'])->with('success', 'Feature created successfully.');
        } catch (\Exception $e) {
            Log::error('Feature creation exception', [
                'project_id' => $project->id,
                'feature_name' => $name,
                'error' => $e->getMessage(),
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return redirect()->back()->with('error', 'An error occurred while creating the feature: '.$e->getMessage());
        }
    }

    /**
     * Display a specific feature with its design/diagram sections.
     */
    public function show(Feature $feature)
    {
        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('features/FeatureShow', [
            'project' => $project,
            'feature' => $feature,
            'erd' => $feature->erd,
        ]);
    }

    /**
     * Update a feature's editable fields.
     */
    public function update(Feature $feature)
    {
        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
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

        return redirect()->back()->with('success', 'Feature updated successfully.');
    }

    /**
     * Display feature specifications in markdown format.
     */
    public function specs(Feature $feature, FeatureSpecService $featureSpecService)
    {
        $project = $feature->project;

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $specsMarkdown = $featureSpecService->generateSpecsMarkdown($feature);

        return Inertia::render('features/Specs', [
            'project' => $project,
            'feature' => $feature,
            'specsMarkdown' => $specsMarkdown,
        ]);
    }
}
