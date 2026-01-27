<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\AiUsageService;
use App\Services\Documentation\FeatureMarkdownService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use App\Traits\StructuredLogger;

class PRDController extends Controller
{
    use StructuredLogger;

    /**
     * Show the PRD generation page.
     *
     * @param Request $request
     * @param Project $project
     * @param FeatureMarkdownService $featureMarkdownService
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function generate(Request $request, Project $project, FeatureMarkdownService $featureMarkdownService)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            $project->loadMissing(['modules.features', 'baseOverviewVersion']);

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
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'generate', 'project_id' => $project->id]);
            return redirect()->route('projects.show', $project)->with('error', 'Failed to load PRD generation page.');
        }
    }

    /**
     * Generate PRD asynchronously after initial page load.
     *
     * @param Request $request
     * @param Project $project
     * @param FeatureMarkdownService $featureMarkdownService
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateAsync(Request $request, Project $project, FeatureMarkdownService $featureMarkdownService)
    {
        try {
            // Ensure user owns the project
            if ($project->user_id !== auth()->id()) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
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

            $project->loadMissing(['modules.features', 'baseOverviewVersion']);

            // Use enriched features with module context
            $features = $featureMarkdownService->getEnrichedFeaturesForAPI($project);
            $modules = $featureMarkdownService->getModulesWithFeaturesForAPI($project);

            $overviewText = (string) ($project->baseOverviewVersion?->overview ?? '');

            $payload = [
                'project_name' => $project->name,
                'author' => auth()->user()->name ?? 'Unknown',
                'date' => now()->toDateString(),
                'version' => '1',
                'overview' => $overviewText,
                'modules' => $modules,
                'features' => [
                    'features' => $features,
                ],
            ];

            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::fastapi()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/PRD/generate', $payload);

            if ($response->successful()) {
                $data = $response->json();

                // Validate and record usage
                if (!isset($data['usage'])) {
                    throw new \Exception('AI usage data missing from response');
                }

                app(AiUsageService::class)->handle(
                    auth()->user(),
                    'prd_generation',
                    $data['usage'],
                    $data['model'] ?? null
                );

                $combined = $data['combined_file'] ?? null;
                if (is_string($combined) && $combined !== '') {
                    $project->update([
                        'prd' => $combined,
                        'prd_is_synced' => true,
                        'prd_last_synced_at' => now(),
                    ]);
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
                throw new \Exception('FastAPI PRD generation failed: ' . $response->body());
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'generateAsync', 'project_id' => $project->id]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate PRD. Please try again.',
            ], 500);
        }
    }

    /**
     * Show the PRD page.
     *
     * @param Project $project
     * @param FeatureMarkdownService $featureMarkdownService
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function show(Project $project, FeatureMarkdownService $featureMarkdownService)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            // Load modules with their features for proper markdown generation
            $project->loadMissing(['modules.features']);

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

            // Generate markdown for all modules with their features
            $featuresMarkdown = $featureMarkdownService->formatProjectFeaturesToMarkdown($project);

            return Inertia::render('Projects/PRD', [
                'project' => $project,
                'prdVersions' => $prdVersions,
                'featuresMarkdown' => $featuresMarkdown,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'show', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load PRD.');
        }
    }

    /**
     * Save manual PRD edits from the user.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function edit(Request $request, Project $project)
    {
        $validated = $request->validate([
            'prd_content' => 'required|string',
        ]);

        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to edit this PRD.');
            }

            // Manual edits keep sync status true since user intentionally modified it
            $project->update([
                'prd' => $validated['prd_content'],
                'prd_is_synced' => true,
                'prd_last_synced_at' => now(),
            ]);

            return back()->with('success', 'PRD saved successfully.');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'edit', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to save PRD.');
        }
    }

    /**
     * Apply engineer notes to current PRD using external AI edit endpoint and save.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function aiEdit(Request $request, Project $project)
    {
        $validated = $request->validate([
            'engineer_notes' => 'required|string',
        ]);

        try {
            // Increase execution time for FastAPI calls
            set_time_limit(180);

            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to edit this PRD.');
            }

            $currentPrd = (string) ($project->prd ?? '');
            if ($currentPrd === '') {
                return redirect()->route('projects.show', $project)->with('error', 'No existing PRD found to edit. Please generate a PRD first.');
            }

            $payload = [
                'system_PRD' => $currentPrd,
                'engineer_notes' => $validated['engineer_notes'],
            ];

            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::fastapi()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/PRD/edit', $payload);

            if (! $response->successful()) {
                throw new \Exception('FastAPI PRD edit failed: ' . $response->body());
            }

            $responseData = $response->json();

            // Validate and record usage
            if (!isset($responseData['usage'])) {
                throw new \Exception('AI usage data missing from response');
            }

            app(AiUsageService::class)->handle(
                auth()->user(),
                'prd_edit',
                $responseData['usage'],
                $responseData['model'] ?? null
            );

            $updatedPrd = $responseData['PRD'] ?? null;
            if (is_string($updatedPrd) && $updatedPrd !== '') {
                $project->update([
                    'prd' => $updatedPrd,
                    'prd_is_synced' => true,
                    'prd_last_synced_at' => now(),
                ]);
            }

            return back()->with('success', 'PRD updated successfully.');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'aiEdit', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to update PRD with AI.');
        }
    }

    /**
     * Preview a Mermaid diagram from PRD content.
     *
     * @param Request $request
     * @param Project $project
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function previewMermaid(Request $request, Project $project)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'title' => 'nullable|string',
        ]);

        try {
            // Ensure user owns the project
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            return Inertia::render('Projects/MermaidPreview', [
                'content' => $validated['content'],
                'title' => $validated['title'] ?? 'Mermaid Diagram',
                'projectName' => $project->name,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'previewMermaid', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to preview Mermaid diagram.');
        }
    }

    /**
     * Preview the full PRD document in a new tab.
     *
     * @param Request $request
     * @param Project $project
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function previewPrd(Request $request, Project $project)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'title' => 'nullable|string',
        ]);

        try {
            // Ensure user owns the project
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            return Inertia::render('Projects/PrdPreview', [
                'content' => $validated['content'],
                'title' => $validated['title'] ?? 'Product Requirements Document',
                'projectName' => $project->name,
                'project' => $project,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'previewPrd', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to preview PRD.');
        }
    }

    /**
     * Synchronize PRD with current modules and features.
     *
     * @param Request $request
     * @param Project $project
     * @param FeatureMarkdownService $featureMarkdownService
     * @return \Illuminate\Http\RedirectResponse
     */
    public function sync(Request $request, Project $project, FeatureMarkdownService $featureMarkdownService)
    {
        try {
            // Increase execution time for FastAPI calls
            set_time_limit(180);

            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to sync this PRD.');
            }

            $currentPrd = (string) ($project->prd ?? '');
            if ($currentPrd === '') {
                return redirect()->route('prd.generate', $project)->with('error', 'No existing PRD found. Please generate a PRD first.');
            }

            $project->loadMissing(['modules.features', 'baseOverviewVersion']);

            // Build enriched features with module context using the service
            $features = $featureMarkdownService->getEnrichedFeaturesForAPI($project);

            $overviewText = (string) ($project->baseOverviewVersion?->overview ?? '');

            $payload = [
                'project_name' => $project->name,
                'author' => auth()->user()->name ?? 'Unknown',
                'date' => now()->toDateString(),
                'version' => '2',
                'overview' => $overviewText,
                'features' => [
                    'features' => $features,
                ],
                'previous_prd' => $currentPrd,
            ];

            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::fastapi()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/PRD/sync', $payload);

            if (! $response->successful()) {
                throw new \Exception('FastAPI PRD sync failed: ' . $response->body());
            }

            $responseData = $response->json();

            // Validate and record usage
            if (!isset($responseData['usage'])) {
                throw new \Exception('AI usage data missing from response');
            }

            app(AiUsageService::class)->handle(
                auth()->user(),
                'prd_sync',
                $responseData['usage'],
                $responseData['model'] ?? null
            );

            $combined = $responseData['combined_file'] ?? null;
            if (is_string($combined) && $combined !== '') {
                $project->update([
                    'prd' => $combined,
                    'prd_is_synced' => true,
                    'prd_last_synced_at' => now(),
                ]);
            }

            return back()->with('success', 'PRD synchronized successfully with current modules and features.');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'sync', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to synchronize PRD. Please try again.');
        }
    }
}
