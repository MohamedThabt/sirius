<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Traits\StructuredLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ProjectController extends Controller
{
    use StructuredLogger;

    /**
     * Display a paginated list of projects with optional filtering.
     *
     * Supports filtering by:
     * - search: Filter by project name, brief, or user name/email (optional)
     * - status: Filter by project status (optional)
     *
     * @param Request $request The incoming HTTP request
     * @return Response Inertia response rendering the projects index page
     */
    public function index(Request $request): Response
    {
        try {
            $query = Project::with('user:id,name,email');

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('brief', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $perPage = in_array((int) $request->input('per_page'), [10, 25, 50, 100]) ? (int) $request->input('per_page') : 10;

            $projects = $query->latest()
                ->paginate($perPage)
                ->withQueryString();

            $statuses = Project::distinct('status')->pluck('status');

            // Summary stats
            $summary = [
                'total' => Project::count(),
                'by_status' => Project::selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
                'with_prd' => Project::whereNotNull('prd')->where('prd', '!=', '')->count(),
                'with_erd' => Project::whereNotNull('erd')->where('erd', '!=', '')->count(),
                'this_month' => Project::where('created_at', '>=', now()->startOfMonth())->count(),
            ];

            return Inertia::render('dashboard/projects/index', [
                'projects' => $projects,
                'statuses' => $statuses,
                'filters' => $request->only(['search', 'status', 'per_page']),
                'summary' => $summary,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load projects. Please try again.');
        }
    }

    /**
     * Display detailed information about a specific project.
     *
     * Loads comprehensive project data including:
     * - User information with avatar
     * - Overview versions (base and latest)
     * - Features
     * - Technical intake
     * - Repository details
     * - Team members and invitations
     * - User's total projects count
     * - Project metrics (features, completion, etc.)
     *
     * @param Project $project The project to display
     * @return Response Inertia response rendering the project show page
     */
    public function show(Project $project): Response
    {
        try {
            $project->load([
                'user:id,name,email,avatar,created_at',
                'overviewVersions' => function ($query) {
                    $query->orderBy('version_number', 'desc');
                },
                'baseOverviewVersion',
                'latestOverviewVersion',
                'features',
                'technicalIntake',
                'repository',
                'members:id,name,email,avatar',
                'invitations.user:id,name,email',
                'invitations.inviter:id,name',
                'pendingInvitations',
                'projectUsers',
                'modules.features'
            ]);

            // Load user's total projects count
            $project->user->loadCount('projects');

            // Calculate project metrics
            $projectMetrics = [
                'total_features' => $project->features->count(),
                'total_modules' => $project->modules->count(),
                'features_by_status' => $project->features
                    ->groupBy('status')
                    ->map->count()
                    ->toArray(),
                'features_by_priority' => $project->features
                    ->groupBy('priority')
                    ->map->count()
                    ->toArray(),
                'modules_by_status' => $project->modules
                    ->groupBy('status')
                    ->map->count()
                    ->toArray(),
                'total_members' => $project->members->count(),
                'pending_invitations' => $project->pendingInvitations->count(),
                'overview_versions_count' => $project->overviewVersions->count(),
                'has_prd' => !empty($project->prd),
                'has_erd' => !empty($project->erd),
                'has_c4' => !empty($project->c4),
                'has_technical_details' => !empty($project->technical_details),
                'has_repository' => $project->repository !== null,
                'completion_percentage' => $this->calculateProjectCompletion($project),
            ];

            // Prepare project data with explicit relationships
            $projectData = $project->toArray();
            $projectData['overviewVersions'] = $project->overviewVersions->toArray();
            $projectData['baseOverviewVersion'] = $project->baseOverviewVersion?->toArray();
            $projectData['latestOverviewVersion'] = $project->latestOverviewVersion?->toArray();

            return Inertia::render('dashboard/projects/show', [
                'project' => $projectData,
                'projectMetrics' => $projectMetrics,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load project details. Please try again.');
        }
    }

    /**
     * Calculate project completion percentage based on filled sections.
     */
    private function calculateProjectCompletion(Project $project): int
    {
        $sections = [
            !empty($project->brief),
            !empty($project->prd),
            !empty($project->erd),
            !empty($project->c4),
            !empty($project->technical_details),
            $project->modules->isNotEmpty(),
        ];

        $completed = count(array_filter($sections));
        return (int) round(($completed / count($sections)) * 100);
    }

    /**
     * Display the project overview page.
     *
     * Shows the project overview with version history.
     * Loads overview versions and provides the latest/base version content.
     *
     * @param Project $project The project to display
     * @return Response Inertia response rendering the project overview page
     */
    public function overview(Project $project): Response
    {
        try {
            $project->load([
                'user:id,name,email',
                'overviewVersions' => function ($query) {
                    $query->orderBy('version_number', 'desc');
                },
                'latestOverviewVersion',
                'baseOverviewVersion',
            ]);

            // Get the current overview content from the latest version
            $latestVersion = $project->latestOverviewVersion;
            $overviewContent = $latestVersion?->overview ?? '';

            // Prepare project data with overview content
            $projectData = $project->toArray();
            $projectData['overview'] = $overviewContent;

            // Check for pending generation
            $pendingGeneration = session('pending_overview_generation');
            $isGenerating = $pendingGeneration && $pendingGeneration['project_id'] === $project->id;

            return Inertia::render('dashboard/projects/overview', [
                'project' => $projectData,
                'overviewVersions' => $project->overviewVersions->toArray(),
                'isGenerating' => $isGenerating,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'overview', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load project overview. Please try again.');
        }
    }

    /**
     * Display the Product Requirements Document (PRD) page.
     *
     * Loads project features and formats them into markdown using
     * the FeatureMarkdownService.
     *
     * @param Project $project The project to display
     * @return Response Inertia response rendering the PRD page with formatted markdown
     */
    public function prd(Project $project): Response
    {
        try {
            $project->load('user:id,name,email', 'features');

            $featureMarkdownService = app(\App\Services\Documentation\FeatureMarkdownService::class);
            $featuresMarkdown = $featureMarkdownService->formatProjectFeaturesToMarkdown($project);

            return Inertia::render('dashboard/projects/prd', [
                'project' => $project,
                'featuresMarkdown' => $featuresMarkdown,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'prd', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load PRD document. Please try again.');
        }
    }

    /**
     * Display the Entity Relationship Diagram (ERD) page.
     *
     * Shows the database schema design for the project.
     *
     * @param Project $project The project to display
     * @return Response Inertia response rendering the ERD page with project's ERD content
     */
    public function erd(Project $project): Response
    {
        try {
            $project->load('user:id,name,email');

            return Inertia::render('dashboard/projects/erd', [
                'project' => $project,
                'initialContent' => $project->erd ?? '',
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'erd', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load ERD diagram. Please try again.');
        }
    }

    /**
     * Display the C4 architecture diagram page.
     *
     * Shows the system architecture using C4 model notation.
     *
     * @param Project $project The project to display
     * @return Response Inertia response rendering the C4 diagram page
     */
    public function c4(Project $project): Response
    {
        try {
            $project->load('user:id,name,email');

            return Inertia::render('dashboard/projects/c4', compact('project'));
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'c4', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load C4 diagram. Please try again.');
        }
    }

    /**
     * Display the technical details page.
     *
     * Shows comprehensive technical specifications and implementation details.
     * Loads the technical intake to display technology stack information.
     *
     * @param Project $project The project to display
     * @return Response Inertia response rendering the technical details page with technology stack
     */
    public function technicalDetails(Project $project): Response
    {
        try {
            $project->load('user:id,name,email', 'technicalIntake');

            return Inertia::render('dashboard/projects/technical-details', [
                'project' => $project,
                'technicalIntake' => $project->technicalIntake,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'technicalDetails', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load technical details. Please try again.');
        }
    }

    /**
     * Display a preview of the Overview document.
     *
     * Expected request data:
     * - content: string (required) - The markdown content to preview
     * - title: string (required) - The document title
     * - projectName: string (required) - The project name
     *
     * @param Request $request The incoming HTTP request
     * @param Project $project The project being previewed
     * @return Response Inertia response rendering the Overview preview page
     */
    public function overviewPreview(Request $request, Project $project): Response
    {
        try {
            $validated = $request->validate([
                'content' => 'required|string',
                'title' => 'required|string',
                'projectName' => 'required|string',
            ]);

            return Inertia::render('dashboard/projects/overview-preview', [
                'content' => $validated['content'],
                'title' => $validated['title'],
                'projectName' => $validated['projectName'],
                'project' => $project,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'overviewPreview', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load Overview preview. Please try again.');
        }
    }

    /**
     * Display a preview of the PRD document.
     *
     * Expected request data:
     * - content: string (required) - The markdown content to preview
     * - title: string (required) - The document title
     * - projectName: string (required) - The project name
     *
     * @param Request $request The incoming HTTP request
     * @param Project $project The project being previewed
     * @return Response Inertia response rendering the PRD preview page
     */
    public function prdPreview(Request $request, Project $project): Response
    {
        try {
            $validated = $request->validate([
                'content' => 'required|string',
                'title' => 'required|string',
                'projectName' => 'required|string',
            ]);

            return Inertia::render('dashboard/projects/prd-preview', [
                'content' => $validated['content'],
                'title' => $validated['title'],
                'projectName' => $validated['projectName'],
                'project' => $project,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'prdPreview', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load PRD preview. Please try again.');
        }
    }
}
