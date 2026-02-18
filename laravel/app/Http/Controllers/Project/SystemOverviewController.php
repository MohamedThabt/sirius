<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectOverviewVersion;
use App\Services\AiUsageService;
use App\Support\AppLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use App\Traits\StructuredLogger;

class SystemOverviewController extends Controller
{
    use StructuredLogger;

    /**
     * Create a new system overview version from project brief.
     *
     * @param Request $request
     * @param Project $project
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function create(Request $request, Project $project)
    {
        // Ensure user owns the project
        if ($project->user_id !== auth()->id()) {
            return back()->with('error', 'You do not have permission to access this project.');
        }

        $validated = $request->validate([
            'why_making' => 'required|string|max:2000',
            'who_for' => 'required|string|max:2000',
            'what_valuable' => 'required|string|max:2000',
            'features_functionality' => 'required|string|max:2000',
            'data_model_details' => 'nullable|string|max:3000',
            'platform_targets' => 'nullable|string|max:2000',
            'frontend_tech' => 'nullable|string|max:2000',
            'backend_tech' => 'nullable|string|max:2000',
            'database_tech' => 'nullable|string|max:2000',
            'ai_usage' => 'nullable|string|max:2000',
            'external_services' => 'nullable|string|max:2000',
            'expected_users' => 'nullable|string|max:50',
        ]);

        try {
            // Create project brief
            $projectBrief = "# Project Brief: {$project->name}\n\n";
            $projectBrief .= "## Project Purpose\n";
            $projectBrief .= $validated['why_making']."\n\n";
            $projectBrief .= "## Target Audience\n";
            $projectBrief .= $validated['who_for']."\n";
            if (! empty($validated['expected_users'])) {
                $projectBrief .= '**Expected User Scale:** '.$validated['expected_users']." users\n";
            }
            $projectBrief .= "\n";
            $projectBrief .= "## Value Proposition\n";
            $projectBrief .= $validated['what_valuable']."\n\n";
            $projectBrief .= "## Features & Functionality\n";
            $projectBrief .= $validated['features_functionality']."\n\n";

            if (! empty($validated['data_model_details'])) {
                $projectBrief .= "## Data Model Details\n";
                $projectBrief .= $validated['data_model_details']."\n\n";
            }

            // Add technical details section if any technical field is provided
            $hasTechnicalDetails = ! empty($validated['platform_targets']) ||
                ! empty($validated['frontend_tech']) ||
                ! empty($validated['backend_tech']) ||
                ! empty($validated['database_tech']) ||
                ! empty($validated['ai_usage']) ||
                ! empty($validated['external_services']);

            if ($hasTechnicalDetails) {
                $projectBrief .= "## Technical Details\n\n";

                if (! empty($validated['platform_targets'])) {
                    $projectBrief .= "### Platform Targets\n";
                    $projectBrief .= $validated['platform_targets']."\n\n";
                }

                if (! empty($validated['frontend_tech'])) {
                    $projectBrief .= "### Frontend Technology\n";
                    $projectBrief .= $validated['frontend_tech']."\n\n";
                }

                if (! empty($validated['backend_tech'])) {
                    $projectBrief .= "### Backend Technology\n";
                    $projectBrief .= $validated['backend_tech']."\n\n";
                }

                if (! empty($validated['database_tech'])) {
                    $projectBrief .= "### Database Technology\n";
                    $projectBrief .= $validated['database_tech']."\n\n";
                }

                if (! empty($validated['ai_usage'])) {
                    $projectBrief .= "### AI Usage\n";
                    $projectBrief .= $validated['ai_usage']."\n\n";
                }

                if (! empty($validated['external_services'])) {
                    $projectBrief .= "### External Services\n";
                    $projectBrief .= $validated['external_services']."\n\n";
                }
            }

            $projectBrief .= "---\n";
            $projectBrief .= '*Brief generated on '.now()->format('F j, Y').'*';

            // Update project with brief
            $project->update([
                'brief' => $projectBrief,
                'status' => 'in_progress',
            ]);

            // Save technical intake data if any technical field is filled
            if (
                ! empty($validated['platform_targets']) ||
                ! empty($validated['frontend_tech']) ||
                ! empty($validated['backend_tech']) ||
                ! empty($validated['database_tech']) ||
                ! empty($validated['ai_usage']) ||
                ! empty($validated['external_services'])
            ) {
                $project->technicalIntake()->updateOrCreate(
                    ['project_id' => $project->id],
                    [
                        'platform_targets' => $validated['platform_targets'] ?? null,
                        'frontend_tech' => $validated['frontend_tech'] ?? null,
                        'backend_tech' => $validated['backend_tech'] ?? null,
                        'database_tech' => $validated['database_tech'] ?? null,
                        'ai_usage' => $validated['ai_usage'] ?? null,
                        'external_services' => $validated['external_services'] ?? null,
                    ],
                );
            }

            AppLogger::business('project.overview.created', [
                'project_id' => $project->id,
                'has_technical_details' => $hasTechnicalDetails,
            ]);

            return redirect()->route('projects.system-overview', $project);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'create', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to create system overview.');
        }
    }

    /**
     * Generate overview asynchronously after initial page load.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateAsync(Request $request, Project $project)
    {
        try {
            // Ensure user owns the project
            if ($project->user_id !== auth()->id()) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            // Increase execution time for FastAPI calls
            set_time_limit(180);

            // Idempotency check: return existing if overview was created in last 30 seconds
            $recentVersion = $project->overviewVersions()
                ->where('created_at', '>=', now()->subSeconds(30))
                ->orderByDesc('created_at')
                ->first();

            if ($recentVersion) {
                return response()->json([
                    'success' => true,
                    'message' => 'Overview already generated',
                    'overviewVersions' => $project->overviewVersions()->get(),
                    'hasModules' => $project->modules()->exists(),
                ]);
            }

            // Use project brief from DB (saved by create()) — no session dependency
            if (empty($project->brief)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Project brief is required. Please prepare your project first.',
                ], 400);
            }

            $projectDescription = $project->brief;

            // Append technical intake if not already included in brief
            if (! str_contains($projectDescription, '## Technical Details')) {
                $project->load('technicalIntake');

                if ($project->technicalIntake) {
                    $technicalIntake = $project->technicalIntake;
                    $hasTechnicalDetails = ! empty($technicalIntake->platform_targets) ||
                        ! empty($technicalIntake->frontend_tech) ||
                        ! empty($technicalIntake->backend_tech) ||
                        ! empty($technicalIntake->database_tech) ||
                        ! empty($technicalIntake->ai_usage) ||
                        ! empty($technicalIntake->external_services);

                    if ($hasTechnicalDetails) {
                        $projectDescription .= "\n\n## Technical Details\n\n";

                        if (! empty($technicalIntake->platform_targets)) {
                            $projectDescription .= "### Platform Targets\n";
                            $projectDescription .= $technicalIntake->platform_targets."\n\n";
                        }

                        if (! empty($technicalIntake->frontend_tech)) {
                            $projectDescription .= "### Frontend Technology\n";
                            $projectDescription .= $technicalIntake->frontend_tech."\n\n";
                        }

                        if (! empty($technicalIntake->backend_tech)) {
                            $projectDescription .= "### Backend Technology\n";
                            $projectDescription .= $technicalIntake->backend_tech."\n\n";
                        }

                        if (! empty($technicalIntake->database_tech)) {
                            $projectDescription .= "### Database Technology\n";
                            $projectDescription .= $technicalIntake->database_tech."\n\n";
                        }

                        if (! empty($technicalIntake->ai_usage)) {
                            $projectDescription .= "### AI Usage\n";
                            $projectDescription .= $technicalIntake->ai_usage."\n\n";
                        }

                        if (! empty($technicalIntake->external_services)) {
                            $projectDescription .= "### External Services\n";
                            $projectDescription .= $technicalIntake->external_services."\n\n";
                        }
                    }
                }
            }


            // Call FastAPI endpoint to generate overview (no retry - creation operations should not retry to prevent duplicates)
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::fastapi()->timeout(120)
                ->post($fastApiBaseUrl.'/v1/Overview/generate', [
                    'project_description' => $projectDescription,
                ]);

            if ($response->successful()) {
                $data = $response->json();

                // Validate and record usage
                if (!isset($data['usage'])) {
                    throw new \Exception('AI usage data missing from response');
                }

                app(AiUsageService::class)->handle(
                    auth()->user(),
                    'system_overview_generation',
                    $data['usage'],
                    $data['model'] ?? null
                );

                $overviewContent = $data['Overview'] ?? '';

                // Get next version number
                $nextVersionNumber = ($project->overviewVersions()->max('version_number') ?? 0) + 1;

                // Create new overview version
                $overviewVersion = ProjectOverviewVersion::create([
                    'project_id' => $project->id,
                    'overview' => $overviewContent,
                    'version_number' => $nextVersionNumber,
                    'is_base_version' => true,
                    'user_prompt' => $projectDescription,
                ]);

                // Mark all other versions as not base
                $project->overviewVersions()
                    ->where('id', '!=', $overviewVersion->id)
                    ->update(['is_base_version' => false]);

                return response()->json([
                    'success' => true,
                    'message' => 'Overview generated successfully',
                    'overviewVersions' => $project->overviewVersions()->get(),
                    'hasModules' => $project->modules()->exists(),
                ]);
            } else {
                throw new \Exception('FastAPI overview generation failed: ' . $response->body());
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'generateAsync', 'project_id' => $project->id]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate system overview. Please try again.',
            ], 500);
        }
    }

    /**
     * Show the system overview page with base version.
     *
     * @param Project $project
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function show(Project $project)
    {
        try {
            // Ensure user owns the project
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            $project->load(['overviewVersions', 'modules']);

            // Project has a brief but no overview versions yet — trigger initial generation
            $isGenerating = ! empty($project->brief) && $project->overviewVersions->isEmpty();

            return Inertia::render('Projects/SystemOverview', [
                'project' => $project,
                'overviewVersions' => $isGenerating ? [] : $project->overviewVersions()->get(),
                'hasModules' => $project->modules()->exists(),
                'isGenerating' => $isGenerating,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'show', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load system overview.');
        }
    }

    /**
     * Regenerate system overview from project brief.
     *
     * @param Request $request
     * @param Project $project
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function regenerate(Request $request, Project $project)
    {
        try {
            // Ensure user owns the project
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You do not have permission to access this project.');
            }

            // Ensure project has a brief
            if (empty($project->brief)) {
                return redirect()
                    ->route('projects.prepare', $project)
                    ->with('error', 'Project brief is required. Please prepare your project first.');
            }

            // Increase execution time for FastAPI calls
            set_time_limit(180);

            // Use project brief as the description
            $projectDescription = $project->brief;

            // Load technical intake if it exists and brief doesn't already include technical details
            // (to avoid duplication - brief created via create() already includes technical details)
            $briefHasTechnicalDetails = str_contains($project->brief, '## Technical Details');

            if (! $briefHasTechnicalDetails) {
                $project->load('technicalIntake');
                if ($project->technicalIntake) {
                    $technicalIntake = $project->technicalIntake;
                    $hasTechnicalDetails = ! empty($technicalIntake->platform_targets) ||
                        ! empty($technicalIntake->frontend_tech) ||
                        ! empty($technicalIntake->backend_tech) ||
                        ! empty($technicalIntake->database_tech) ||
                        ! empty($technicalIntake->ai_usage) ||
                        ! empty($technicalIntake->external_services);

                    if ($hasTechnicalDetails) {
                        $projectDescription .= "\n\n## Technical Details\n\n";

                        if (! empty($technicalIntake->platform_targets)) {
                            $projectDescription .= "### Platform Targets\n";
                            $projectDescription .= $technicalIntake->platform_targets."\n\n";
                        }

                        if (! empty($technicalIntake->frontend_tech)) {
                            $projectDescription .= "### Frontend Technology\n";
                            $projectDescription .= $technicalIntake->frontend_tech."\n\n";
                        }

                        if (! empty($technicalIntake->backend_tech)) {
                            $projectDescription .= "### Backend Technology\n";
                            $projectDescription .= $technicalIntake->backend_tech."\n\n";
                        }

                        if (! empty($technicalIntake->database_tech)) {
                            $projectDescription .= "### Database Technology\n";
                            $projectDescription .= $technicalIntake->database_tech."\n\n";
                        }

                        if (! empty($technicalIntake->ai_usage)) {
                            $projectDescription .= "### AI Usage\n";
                            $projectDescription .= $technicalIntake->ai_usage."\n\n";
                        }

                        if (! empty($technicalIntake->external_services)) {
                            $projectDescription .= "### External Services\n";
                            $projectDescription .= $technicalIntake->external_services."\n\n";
                        }
                    }
                }
            }

            // Call FastAPI endpoint to generate overview
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::fastapi()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/Overview/generate', [
                    'project_description' => $projectDescription,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $overviewContent = $data['Overview'] ?? '';

                // Get next version number
                $nextVersionNumber = ($project->overviewVersions()->max('version_number') ?? 0) + 1;

                // Create new overview version
                $overviewVersion = ProjectOverviewVersion::create([
                    'project_id' => $project->id,
                    'overview' => $overviewContent,
                    'version_number' => $nextVersionNumber,
                    'is_base_version' => true, // New version is base
                    'user_prompt' => 'Regenerated from project brief',
                ]);

                // Mark all other versions as not base
                $project->overviewVersions()
                    ->where('id', '!=', $overviewVersion->id)
                    ->update(['is_base_version' => false]);

                AppLogger::business('project.overview.regenerated', [
                    'project_id' => $project->id,
                    'version_number' => $nextVersionNumber,
                ]);

                $project->load(['overviewVersions', 'modules']);

                // Return JSON for AJAX requests (async frontend calls)
                if ($request->ajax() || $request->wantsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Overview regenerated successfully',
                        'overviewVersions' => $project->overviewVersions()->get(),
                        'hasModules' => $project->modules()->exists(),
                    ]);
                }

                // Return Inertia response for standard navigation
                return Inertia::render('Projects/SystemOverview', [
                    'project' => $project,
                    'overviewVersions' => $project->overviewVersions()->get(),
                    'hasModules' => $project->modules()->exists(),
                ])->with('success', 'Overview regenerated successfully');
            } else {
                throw new \Exception('FastAPI overview regeneration failed: ' . $response->body());
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'regenerate', 'project_id' => $project->id]);

            // Return JSON for AJAX requests
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to regenerate system overview. Please try again.',
                ], 500);
            }

            return back()->with('error', 'Failed to regenerate system overview. Please try again.');
        }
    }

    /**
     * Update overview with AI based on engineer notes.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateWithAi(Request $request, Project $project)
    {
        // Ensure user owns the project
        if ($project->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'system_overview' => 'required|string',
            'engineer_notes' => 'required|string|max:2000',
        ]);

        try {
            // Increase execution time for FastAPI calls
            set_time_limit(180);

            // Call FastAPI endpoint to edit overview
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::fastapi()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/Overview/edit', [
                    'system_overview' => $validated['system_overview'],
                    'engineer_notes' => $validated['engineer_notes'],
                ]);

            if ($response->successful()) {
                $data = $response->json();

                // Validate and record usage
                if (!isset($data['usage'])) {
                    throw new \Exception('AI usage data missing from response');
                }

                app(AiUsageService::class)->handle(
                    auth()->user(),
                    'system_overview_edit',
                    $data['usage'],
                    $data['model'] ?? null
                );

                $updatedOverview = $data['Overview'] ?? '';

                // Get next version number
                $nextVersionNumber = ($project->overviewVersions()->max('version_number') ?? 0) + 1;

                // Create new overview version
                $overviewVersion = ProjectOverviewVersion::create([
                    'project_id' => $project->id,
                    'overview' => $updatedOverview,
                    'version_number' => $nextVersionNumber,
                    'is_base_version' => true, // New AI version becomes the base
                    'user_prompt' => $validated['engineer_notes'],
                ]);

                // Mark all other versions as not base
                $project->overviewVersions()
                    ->where('id', '!=', $overviewVersion->id)
                    ->update(['is_base_version' => false]);

                return response()->json([
                    'success' => true,
                    'message' => 'Overview updated successfully',
                    'overviewVersions' => $project->overviewVersions()->get(),
                    'hasModules' => $project->modules()->exists(),
                ]);
            } else {
                throw new \Exception('FastAPI overview edit failed: ' . $response->body());
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'updateWithAi', 'project_id' => $project->id]);
            return response()->json([
                'success' => false,
                'message' => 'AI overview update is currently unavailable.',
            ], 500);
        }
    }

    /**
     * Update overview version manually by user.
     *
     * @param Request $request
     * @param Project $project
     * @param ProjectOverviewVersion $overviewVersion
     * @return \Illuminate\Http\JsonResponse
     */
    public function userUpdate(Request $request, Project $project, ProjectOverviewVersion $overviewVersion)
    {
        $validated = $request->validate([
            'overview' => 'required|string',
        ]);

        try {
            // Ensure user owns the project and the overview version belongs to the project
            if ($project->user_id !== auth()->id() || $overviewVersion->project_id !== $project->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            // Update the overview version
            $overviewVersion->update([
                'overview' => $validated['overview'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Overview updated successfully',
                'overviewVersions' => $project->overviewVersions()->get(),
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'userUpdate', 'project_id' => $project->id, 'version_id' => $overviewVersion->id]);
            return response()->json(['success' => false, 'message' => 'Failed to update overview.'], 500);
        }
    }

    /**
     * Mark a version as base version.
     *
     * @param Project $project
     * @param ProjectOverviewVersion $overviewVersion
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsBase(Project $project, ProjectOverviewVersion $overviewVersion)
    {
        try {
            // Ensure user owns the project and the overview version belongs to the project
            if ($project->user_id !== auth()->id() || $overviewVersion->project_id !== $project->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            DB::transaction(function () use ($project, $overviewVersion) {
                // Mark all versions as not base
                $project->overviewVersions()->update(['is_base_version' => false]);

                // Mark selected version as base
                $overviewVersion->update(['is_base_version' => true]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Version marked as base successfully',
                'overviewVersions' => $project->overviewVersions()->get(),
                'hasModules' => $project->modules()->exists(),
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'markAsBase', 'project_id' => $project->id, 'version_id' => $overviewVersion->id]);
            return response()->json(['success' => false, 'message' => 'Failed to mark version as base.'], 500);
        }
    }

    /**
     * Preview a Mermaid diagram from System Overview content.
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
     * Preview the full System Overview document in a new tab.
     *
     * @param Request $request
     * @param Project $project
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function previewOverview(Request $request, Project $project)
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

            return Inertia::render('Projects/OverviewPreview', [
                'content' => $validated['content'],
                'title' => $validated['title'] ?? 'System Overview',
                'projectName' => $project->name,
                'project' => $project,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'previewOverview', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to preview System Overview.');
        }
    }
}
