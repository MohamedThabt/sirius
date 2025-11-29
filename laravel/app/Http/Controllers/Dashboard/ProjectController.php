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

            $projects = $query->latest()
                ->paginate(15)
                ->withQueryString();

            $statuses = Project::distinct('status')->pluck('status');

            return Inertia::render('dashboard/projects/index', [
                'projects' => $projects,
                'statuses' => $statuses,
                'filters' => $request->only(['search', 'status']),
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
     *
     * @param Project $project The project to display
     * @return Response Inertia response rendering the project show page
     */
    public function show(Project $project): Response
    {
        try {
            $project->load(
                'user:id,name,email,avatar,created_at',
                'overviewVersions',
                'baseOverviewVersion',
                'latestOverviewVersion',
                'features',
                'technicalIntake',
                'repository',
                'members:id,name,email',
                'invitations',
                'pendingInvitations',
                'projectUsers'
            );

            // Load user's total projects count
            $project->user->loadCount('projects');

            return Inertia::render('dashboard/projects/show', compact('project'));
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load project details. Please try again.');
        }
    }

    /**
     * Display the project overview page.
     *
     * Shows the project overview with basic user information.
     *
     * @param Project $project The project to display
     * @return Response Inertia response rendering the project overview page
     */
    public function overview(Project $project): Response
    {
        try {
            $project->load('user:id,name,email');

            return Inertia::render('dashboard/projects/overview', compact('project'));
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
     * @return Response Inertia response rendering the ERD page
     */
    public function erd(Project $project): Response
    {
        try {
            $project->load('user:id,name,email');

            return Inertia::render('dashboard/projects/erd', compact('project'));
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
     *
     * @param Project $project The project to display
     * @return Response Inertia response rendering the technical details page
     */
    public function technicalDetails(Project $project): Response
    {
        try {
            $project->load('user:id,name,email');

            return Inertia::render('dashboard/projects/technical-details', compact('project'));
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'technicalDetails', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load technical details. Please try again.');
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
