<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\Documentation\FeatureMarkdownService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class PRDController extends Controller
{
    public function generate(Request $request, Project $project, FeatureMarkdownService $featureMarkdownService)
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $project->loadMissing(['features', 'baseOverviewVersion']);

        $overviewText = (string) ($project->baseOverviewVersion?->overview ?? '');

        if ($overviewText === '') {
            return redirect()->route('projects.show', $project)->with('error', 'Please create a base System Overview before generating the PRD.');
        }

        // Store project data in session for async generation
        session([
            'pending_prd_generation' => [
                'project_id' => $project->id,
            ],
        ]);

        $featuresMarkdown = $featureMarkdownService->formatProjectFeaturesToMarkdown($project);

        return Inertia::render('Projects/PRD', [
            'project' => $project,
            'prdVersions' => [],
            'featuresMarkdown' => $featuresMarkdown,
            'isGenerating' => true,
        ]);
    }

    /**
     * Generate PRD asynchronously after initial page load
     */
    public function generateAsync(Request $request, Project $project, FeatureMarkdownService $featureMarkdownService)
    {
        // Ensure user owns the project
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        // Increase execution time for FastAPI calls
        set_time_limit(180);

        $pendingData = session('pending_prd_generation');

        if (! $pendingData || $pendingData['project_id'] !== $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'No pending generation data found',
            ], 400);
        }

        try {
            $project->loadMissing(['features', 'baseOverviewVersion']);

            $features = $project->features->map(function ($feature) {
                return [
                    'name' => $feature->name,
                    'summary' => $feature->summary,
                    'priority' => ucfirst((string) $feature->priority),
                    'acceptance_criteria' => $feature->acceptance_criteria,
                    'order_of_implementation' => (int) $feature->order_of_implementation,
                    'user_flows' => $feature->user_flows,
                    'metrics' => $feature->metrics,
                    'description' => $feature->description,
                ];
            })->values()->all();

            $overviewText = (string) ($project->baseOverviewVersion?->overview ?? '');

            $payload = [
                'project_name' => $project->name,
                'author' => auth()->user()->name ?? 'Unknown',
                'date' => now()->toDateString(),
                'version' => '1',
                'overview' => $overviewText,
                'features' => [
                    'features' => $features,
                ],
            ];

            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/PRD/generate', $payload);

            if ($response->successful()) {
                $combined = $response->json('combined_file');
                if (is_string($combined) && $combined !== '') {
                    $project->update(['prd' => $combined]);
                }

                // Clear pending session data
                session()->forget('pending_prd_generation');

                // Prepare PRD versions
                $prdVersions = [];
                if (! empty($project->prd)) {
                    $prdVersions[] = [
                        'id' => 0,
                        'project_id' => $project->id,
                        'prd_content' => $project->prd,
                        'version_number' => 1,
                        'is_base_version' => true,
                        'user_prompt' => null,
                        'created_at' => $project->created_at?->toISOString() ?? now()->toISOString(),
                        'updated_at' => $project->updated_at?->toISOString() ?? now()->toISOString(),
                    ];
                }

                // Include featuresMarkdown using the injected service (same as show method)
                $featuresMarkdown = $featureMarkdownService->formatProjectFeaturesToMarkdown($project);

                return response()->json([
                    'success' => true,
                    'message' => 'PRD generated successfully',
                    'prdVersions' => $prdVersions,
                    'featuresMarkdown' => $featuresMarkdown,
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate PRD',
                ], 500);
            }
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'PRD generation error: '.$e->getMessage(),
            ], 500);
        }
    }

    public function show(Project $project, FeatureMarkdownService $featureMarkdownService): Response
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $project->loadMissing(['features']);

        $prdVersions = [];
        if (! empty($project->prd)) {
            $prdVersions[] = [
                'id' => 0,
                'project_id' => $project->id,
                'prd_content' => $project->prd,
                'version_number' => 1,
                'is_base_version' => true,
                'user_prompt' => null,
                'created_at' => $project->created_at?->toISOString() ?? now()->toISOString(),
                'updated_at' => $project->updated_at?->toISOString() ?? now()->toISOString(),
            ];
        }

        $featuresMarkdown = $featureMarkdownService->formatProjectFeaturesToMarkdown($project);

        return Inertia::render('Projects/PRD', [
            'project' => $project,
            'prdVersions' => $prdVersions,
            'featuresMarkdown' => $featuresMarkdown,
        ]);
    }

    /**
     * Save manual PRD edits from the user.
     */
    public function edit(Request $request, Project $project)
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'prd_content' => 'required|string',
        ]);

        $project->update(['prd' => $validated['prd_content']]);

        return redirect()->route('projects.prd', $project)
            ->with('message', 'PRD saved successfully.');
    }

    /**
     * Apply engineer notes to current PRD using external AI edit endpoint and save.
     */
    public function aiEdit(Request $request, Project $project)
    {
        // Increase execution time for FastAPI calls
        set_time_limit(180);

        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'engineer_notes' => 'required|string',
        ]);

        $currentPrd = (string) ($project->prd ?? '');
        if ($currentPrd === '') {
            return redirect()->route('projects.show', $project)->with('error', 'No existing PRD found to edit. Please generate a PRD first.');
        }

        $payload = [
            'system_PRD' => $currentPrd,
            'engineer_notes' => $validated['engineer_notes'],
        ];

        try {
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/PRD/edit', $payload);
            if (! $response->successful()) {
                return redirect()->route('projects.prd', $project)->with('error', 'Failed to apply PRD edit.');
            }

            $updatedPrd = $response->json('PRD');
            if (is_string($updatedPrd) && $updatedPrd !== '') {
                $project->update(['prd' => $updatedPrd]);
            }

            return redirect()->route('projects.prd', $project)->with('success', 'PRD updated successfully.');
        } catch (\Throwable $e) {
            return redirect()->route('projects.prd', $project)->with('error', 'PRD edit error: '.$e->getMessage());
        }
    }

    /**
     * Preview a Mermaid diagram from PRD content
     */
    public function previewMermaid(Request $request, Project $project)
    {
        // Ensure user owns the project
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'content' => 'required|string',
            'title' => 'nullable|string',
        ]);

        return Inertia::render('Projects/MermaidPreview', [
            'content' => $validated['content'],
            'title' => $validated['title'] ?? 'Mermaid Diagram',
            'projectName' => $project->name,
        ]);
    }
}

