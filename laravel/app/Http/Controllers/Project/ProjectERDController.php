<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Support\AppLogger;
use App\Traits\StructuredLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ProjectERDController extends Controller
{
    use StructuredLogger;

    /**
     * Display the ERD designer for the specified project.
     *
     * @param Project $project
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function show(Project $project)
    {
        try {
            $this->ensureAccess($project);

            // If no ERD exists, we might want to automatically trigger merge or just show empty state
            // The frontend handles the logic of "Generate" vs "View"

            return Inertia::render('Projects/DatabaseDesigner', [
                'project' => $project,
                'initialContent' => $project->erd,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'show', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load ERD designer.');
        }
    }

    /**
     * Merge all module ERDs into a single project-level ERD.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function merge(Request $request, Project $project)
    {
        try {
            $this->ensureAccess($project, ['owner', 'admin', 'editor']);

            // Fetch all modules with their ERDs
            $modules = $project->modules()
                ->whereNotNull('erd')
                ->where('erd', '!=', '')
                ->get(['name', 'description', 'erd']);

            if ($modules->isEmpty()) {
                return back()->with('error', 'No module ERDs found to merge.');
            }

            // Prepare payload for FastAPI
            $moduleErds = $modules->map(function ($module) {
                return [
                    'module_name' => $module->name,
                    'module_description' => $module->description,
                    'erd_content' => $module->erd,
                ];
            })->toArray();

            $payload = [
                'project_name' => $project->name,
                'project_overview' => $project->overview ?? $project->brief ?? '',
                'module_erds' => $moduleErds,
            ];

            // Call FastAPI endpoint
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::fastapi()->timeout(120)->post($fastApiBaseUrl . '/v1/ERD/merge-project', $payload);

            if (!$response->successful()) {
                $this->logError('FastAPI Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return back()->with('error', 'Failed to merge ERDs via AI service.');
            }

            $data = $response->json();
            $mergedErd = $data['ERD'] ?? null;

            if (!$mergedErd) {
                return back()->with('error', 'AI service returned invalid ERD content.');
            }

            // Update project with merged ERD
            $project->update(['erd' => $mergedErd]);
            
            // Log usage if available
            if (isset($data['usage'])) {
                // Assuming usage logging service exists, otherwise skip for now
                 // App\Services\AiUsageService::log($data['usage'], $project);
            }

            AppLogger::business('project.erd.merged', [
                'project_id' => $project->id,
                'module_count' => count($modules),
            ]);

            return redirect()->route('projects.erd.get', $project)
                ->with('success', 'Project ERD successfully created from modules.');

        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'merge', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to merge project ERDs.');
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
}
