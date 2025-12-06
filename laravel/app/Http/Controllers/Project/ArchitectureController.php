<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use App\Traits\StructuredLogger;

class ArchitectureController extends Controller
{
    use StructuredLogger;

    /**
     * Generate C4 diagram for the specified project.
     *
     * @param Project $project
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function generateC4(Project $project)
    {
        try {
            // Only owner or admin can generate C4
            $this->ensureModify($project);

            // If C4 already exists, redirect to the C4 page
            if ($project->c4) {
                return redirect()->route('projects.c4', $project);
            }

            // Load base overview version for context
            $project->loadMissing('baseOverviewVersion');
            
            // If no base overview exists, redirect back with error
            if (! $project->baseOverviewVersion?->overview) {
                return back()->with('error', 'Please complete the system overview first before creating the C4 diagram.');
            }

            // Store project data in session for async generation
            session([
                'pending_c4_generation' => [
                    'project_id' => $project->id,
                ],
            ]);

            return Inertia::render('Projects/SystemArchitecture', [
                'project' => $project,
                'isGenerating' => true,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'generateC4', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to initiate C4 generation.');
        }
    }

    /**
     * Generate C4 diagram asynchronously after initial page load.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateC4Async(Request $request, Project $project)
    {
        try {
            // Only owner or admin can generate C4
            $this->ensureModify($project);

            // Increase execution time for FastAPI calls
            set_time_limit(180);

            $pendingData = session('pending_c4_generation');

            if (! $pendingData || $pendingData['project_id'] !== $project->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No pending generation data found',
                ], 400);
            }

            // Load required relationships
            $project->loadMissing(['baseOverviewVersion', 'technicalIntake', 'modules']);
            
            // Get overview text (base version or fallback to brief)
            $overviewText = $project->baseOverviewVersion?->overview ?? $project->brief;
            
            if (empty($overviewText)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No project overview available for C4 generation',
                ], 400);
            }
            
            // Build technical intake payload
            $technicalIntake = null;
            if ($project->technicalIntake) {
                $technicalIntake = [
                    'platform_targets' => $project->technicalIntake->platform_targets,
                    'frontend_tech' => $project->technicalIntake->frontend_tech,
                    'backend_tech' => $project->technicalIntake->backend_tech,
                    'database_tech' => $project->technicalIntake->database_tech,
                    'ai_usage' => $project->technicalIntake->ai_usage,
                    'external_services' => $project->technicalIntake->external_services,
                ];
            }
            
            // Build modules payload (optional)
            $modules = null;
            if ($project->modules->isNotEmpty()) {
                $modules = $project->modules->map(function ($module) {
                    return [
                        'name' => $module->name,
                        'description' => $module->description,
                    ];
                })->values()->all();
            }
            
            $payload = [
                'project_overview' => $overviewText,
                'technical_intake' => $technicalIntake,
                'modules' => $modules,
            ];

            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/C4/generate', $payload);

            if ($response->successful()) {
                $data = $response->json();

                // Update project with generated C4 diagram
                $project->update([
                    'c4' => $data['C4'] ?? null,
                ]);

                // Clear pending session data
                session()->forget('pending_c4_generation');

                return response()->json([
                    'success' => true,
                    'message' => 'C4 diagram generated successfully',
                    'c4' => $project->c4,
                ]);
            } else {
                throw new \Exception('FastAPI returned status: ' . $response->status());
            }
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'generateC4Async', 'project_id' => $project->id]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate C4 diagram. Please try again.',
            ], 500);
        }
    }

    /**
     * Edit C4 diagram with AI for the specified project.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function editC4(Request $request, Project $project)
    {
        $validated = $request->validate([
            'engineer_notes' => 'sometimes|string|max:2000',
            'c4_content' => 'sometimes|string',
        ]);

        try {
            // Only owner or admin can save C4
            $this->ensureModify($project);

            // If c4_content is provided, just save it directly (manual edit)
            if (isset($validated['c4_content'])) {
                $project->update([
                    'c4' => $validated['c4_content'],
                ]);

                return back()->with('success', 'C4 diagram saved successfully!');
            }

            // If engineer_notes is provided, use AI to edit the diagram
            if (isset($validated['engineer_notes'])) {
                $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
                $response = Http::timeout(60)->post($fastApiBaseUrl . '/v1/C4/edit', [
                    'SystemC4' => $project->c4 ?? '',
                    'engineer_notes' => $validated['engineer_notes'],
                ]);

                if ($response->successful()) {
                    $data = $response->json();

                    // Update project with edited C4 diagram
                    $project->update([
                        'c4' => $data['C4'] ?? $project->c4,
                    ]);

                    return back()->with('success', 'C4 diagram updated successfully!');
                } else {
                    throw new \Exception('FastAPI returned status: ' . $response->status());
                }
            }

            return back()->with('error', 'No valid data provided for C4 diagram update.');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'editC4', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to update C4 diagram.');
        }
    }

    /**
     * Display the C4 diagram for the specified project.
     *
     * @param Project $project
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function getC4(Project $project)
    {
        try {
            // Ensure user has access to the project
            $this->ensureAccess($project);

            return Inertia::render('Projects/SystemArchitecture', [
                'project' => $project,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'getC4', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load C4 diagram.');
        }
    }

    /**
     * Check if user has access to the project (owner or team member).
     *
     * @param Project $project
     * @param array $allowedRoles
     * @throws \Exception
     */
    protected function ensureAccess(Project $project, array $allowedRoles = []): void
    {
        $userId = auth()->id();
        
        // Owner always has access
        if ($project->user_id === $userId) {
            return;
        }

        // Check if user is a team member
        if (!$project->hasMember($userId)) {
            throw new \Exception('You do not have access to this project.');
        }

        // If specific roles are required, check user's role
        if (!empty($allowedRoles)) {
            $userRole = $project->getMemberRole($userId);
            if (!in_array($userRole, $allowedRoles)) {
                throw new \Exception('You do not have permission to perform this action.');
            }
        }
    }

    /**
     * Check if user can modify the project (owner or admin).
     *
     * @param Project $project
     * @throws \Exception
     */
    protected function ensureModify(Project $project): void
    {
        $this->ensureAccess($project, ['owner', 'admin']);
    }
}
