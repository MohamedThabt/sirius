<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectOverviewVersion;
use App\Services\AiUsageService;
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

            // Store the validated data in session for async generation
            session([
                'pending_overview_generation' => [
                    'project_id' => $project->id,
                    'why_making' => $validated['why_making'],
                    'who_for' => $validated['who_for'],
                    'what_valuable' => $validated['what_valuable'],
                    'features_functionality' => $validated['features_functionality'],
                    'data_model_details' => $validated['data_model_details'] ?? null,
                    'expected_users' => $validated['expected_users'] ?? null,
                    'platform_targets' => $validated['platform_targets'] ?? null,
                    'frontend_tech' => $validated['frontend_tech'] ?? null,
                    'backend_tech' => $validated['backend_tech'] ?? null,
                    'database_tech' => $validated['database_tech'] ?? null,
                    'ai_usage' => $validated['ai_usage'] ?? null,
                    'external_services' => $validated['external_services'] ?? null,
                ],
            ]);

            // Load modules for the response
            $project->load('modules');

            return Inertia::render('Projects/SystemOverview', [
                'project' => $project,
                'overviewVersions' => [],
                'overviewChat' => $project->overview_chat ?? [],
                'hasModules' => $project->modules()->exists(),
                'isGenerating' => true,
            ]);
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

            $pendingData = session('pending_overview_generation');

            if (! $pendingData || $pendingData['project_id'] !== $project->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No pending generation data found',
                ], 400);
            }

            // Build description from multi-step form data (matching brief format for consistency)
            $projectDescription = "# Project Brief: {$project->name}\n\n";
            $projectDescription .= "## Project Purpose\n";
            $projectDescription .= $pendingData['why_making']."\n\n";
            $projectDescription .= "## Target Audience\n";
            $projectDescription .= $pendingData['who_for']."\n";
            if (! empty($pendingData['expected_users'])) {
                $projectDescription .= '**Expected User Scale:** '.$pendingData['expected_users']." users\n";
            }
            $projectDescription .= "\n";
            $projectDescription .= "## Value Proposition\n";
            $projectDescription .= $pendingData['what_valuable']."\n\n";
            $projectDescription .= "## Features & Functionality\n";
            $projectDescription .= $pendingData['features_functionality']."\n\n";

            if (! empty($pendingData['data_model_details'])) {
                $projectDescription .= "## Data Model Details\n";
                $projectDescription .= $pendingData['data_model_details']."\n\n";
            }

            // Add technical details section if any technical field is provided
            $hasTechnicalDetails = ! empty($pendingData['platform_targets']) ||
                ! empty($pendingData['frontend_tech']) ||
                ! empty($pendingData['backend_tech']) ||
                ! empty($pendingData['database_tech']) ||
                ! empty($pendingData['ai_usage']) ||
                ! empty($pendingData['external_services']);

            if ($hasTechnicalDetails) {
                $projectDescription .= "## Technical Details\n\n";

                if (! empty($pendingData['platform_targets'])) {
                    $projectDescription .= "### Platform Targets\n";
                    $projectDescription .= $pendingData['platform_targets']."\n\n";
                }

                if (! empty($pendingData['frontend_tech'])) {
                    $projectDescription .= "### Frontend Technology\n";
                    $projectDescription .= $pendingData['frontend_tech']."\n\n";
                }

                if (! empty($pendingData['backend_tech'])) {
                    $projectDescription .= "### Backend Technology\n";
                    $projectDescription .= $pendingData['backend_tech']."\n\n";
                }

                if (! empty($pendingData['database_tech'])) {
                    $projectDescription .= "### Database Technology\n";
                    $projectDescription .= $pendingData['database_tech']."\n\n";
                }

                if (! empty($pendingData['ai_usage'])) {
                    $projectDescription .= "### AI Usage\n";
                    $projectDescription .= $pendingData['ai_usage']."\n\n";
                }

                if (! empty($pendingData['external_services'])) {
                    $projectDescription .= "### External Services\n";
                    $projectDescription .= $pendingData['external_services']."\n\n";
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
                    'is_base_version' => true, // First version is base
                    'user_prompt' => $projectDescription,
                ]);

                // Mark all other versions as not base
                $project->overviewVersions()
                    ->where('id', '!=', $overviewVersion->id)
                    ->update(['is_base_version' => false]);

                // Clear pending session data
                session()->forget('pending_overview_generation');

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

            // Load project with overview versions and modules
            $project->load(['overviewVersions', 'modules']);

            return Inertia::render('Projects/SystemOverview', [
                'project' => $project,
                'overviewVersions' => $project->overviewVersions()->get(),
                'overviewChat' => $project->overview_chat ?? [],
                'hasModules' => $project->modules()->exists(),
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

                // Return an Inertia response (or redirect) so Inertia visit succeeds
                $project->load(['overviewVersions', 'modules']);

                return Inertia::render('Projects/SystemOverview', [
                    'project' => $project,
                    'overviewVersions' => $project->overviewVersions()->get(),
                    'overviewChat' => $project->overview_chat ?? [],
                    'hasModules' => $project->modules()->exists(),
                ])->with('success', 'Overview regenerated successfully');
            } else {
                throw new \Exception('FastAPI overview regeneration failed: ' . $response->body());
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'regenerate', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to regenerate system overview. Please try again.');
        }
    }

    /**
     * Chat with AI agent for overview assistance (ask, suggest, or execute edits).
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateWithAi(Request $request, Project $project)
    {
        if ($project->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:2000',
            'mode' => 'sometimes|string|in:ask,agent',
        ]);

        try {
            set_time_limit(180);

            $mode = $validated['mode'] ?? 'agent';
            $chat = is_array($project->overview_chat) ? $project->overview_chat : [];

            // Seed missing overview versions into chat so legacy projects keep versions visible.
            $existingVersionIds = collect($chat)
                ->filter(fn ($message) =>
                    is_array($message)
                    && ($message['type'] ?? null) === 'version'
                    && isset($message['version_id'])
                    && $message['version_id'] !== null
                )
                ->map(fn ($message) => (int) $message['version_id'])
                ->unique();

            $seededVersionMessages = $project->overviewVersions()
                ->orderBy('version_number')
                ->get()
                ->filter(fn (ProjectOverviewVersion $version) => ! $existingVersionIds->contains($version->id))
                ->map(fn (ProjectOverviewVersion $version) => [
                    'id' => 'seeded-version-' . $version->id,
                    'type' => 'version',
                    'role' => 'agent',
                    'content' => 'Version ' . str_pad((string) $version->version_number, 2, '0', STR_PAD_LEFT),
                    'version_id' => $version->id,
                    'intent' => null,
                    'created_at' => $version->created_at?->toISOString() ?? now()->toISOString(),
                ])
                ->values()
                ->all();

            if (! empty($seededVersionMessages)) {
                $chat = array_merge($seededVersionMessages, $chat);
            }

            $baseVersion = $project->baseOverviewVersion;
            $currentOverview = $baseVersion?->overview ?? '';

            // Append user message to chat
            $userMessage = [
                'id' => 'msg-' . now()->timestamp . '-' . mt_rand(1000, 9999),
                'type' => 'message',
                'role' => 'user',
                'content' => $validated['message'],
                'version_id' => null,
                'intent' => null,
                'created_at' => now()->toISOString(),
            ];
            $chat[] = $userMessage;

            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::fastapi()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl . '/v1/chat/generate-intent', [
                    'message' => $validated['message'],
                    'thread_id' => $project->id,
                    'mode' => $mode,
                    'project_overview' => $currentOverview,
                    'project_brief' => $project->brief ?? '',
                ]);

            if (! $response->successful()) {
                throw new \Exception('FastAPI intent chat failed: ' . $response->body());
            }

            $data = $response->json();
            $intent = $data['intent'] ?? 'ask';
            $aiResponseText = $data['response'] ?? '';
            $updatedOverview = $data['updated_project_overview'] ?? '';

            $overviewVersions = null;
            $newVersionId = null;

            $isExecuteWithEdit = $intent === 'execute'
                && ! empty($updatedOverview)
                && $updatedOverview !== $currentOverview;

            if ($isExecuteWithEdit) {
                $nextVersionNumber = ($project->overviewVersions()->max('version_number') ?? 0) + 1;

                $overviewVersion = ProjectOverviewVersion::create([
                    'project_id' => $project->id,
                    'overview' => $updatedOverview,
                    'version_number' => $nextVersionNumber,
                    'is_base_version' => true,
                    'user_prompt' => $validated['message'],
                ]);

                $project->overviewVersions()
                    ->where('id', '!=', $overviewVersion->id)
                    ->update(['is_base_version' => false]);

                $newVersionId = $overviewVersion->id;
                $overviewVersions = $project->overviewVersions()->get();
            }

            $agentMessage = [
                'id' => 'msg-' . now()->timestamp . '-' . mt_rand(1000, 9999),
                'type' => $isExecuteWithEdit ? 'version' : 'message',
                'role' => 'agent',
                'content' => $aiResponseText,
                'version_id' => $newVersionId,
                'intent' => $intent,
                'created_at' => now()->toISOString(),
            ];
            $chat[] = $agentMessage;

            $project->update(['overview_chat' => $chat]);

            $responsePayload = [
                'success' => true,
                'message' => $aiResponseText,
                'intent' => $intent,
                'chat' => $chat,
                'hasModules' => $project->modules()->exists(),
            ];

            if ($overviewVersions) {
                $responsePayload['overviewVersions'] = $overviewVersions;
            }

            return response()->json($responsePayload);
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
