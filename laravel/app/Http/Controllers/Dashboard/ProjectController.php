<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
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
    }

    public function show(Project $project): Response
    {
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
    }

    public function overview(Project $project): Response
    {
        $project->load('user:id,name,email');

        return Inertia::render('dashboard/projects/overview', compact('project'));
    }

    public function prd(Project $project): Response
    {
        $project->load('user:id,name,email', 'features');

        $featureMarkdownService = app(\App\Services\Documentation\FeatureMarkdownService::class);
        $featuresMarkdown = $featureMarkdownService->formatProjectFeaturesToMarkdown($project);

        return Inertia::render('dashboard/projects/prd', [
            'project' => $project,
            'featuresMarkdown' => $featuresMarkdown,
        ]);
    }

    public function erd(Project $project): Response
    {
        $project->load('user:id,name,email');

        return Inertia::render('dashboard/projects/erd', compact('project'));
    }

    public function c4(Project $project): Response
    {
        $project->load('user:id,name,email');

        return Inertia::render('dashboard/projects/c4', compact('project'));
    }

    public function technicalDetails(Project $project): Response
    {
        $project->load('user:id,name,email');

        return Inertia::render('dashboard/projects/technical-details', compact('project'));
    }

    public function prdPreview(Request $request, Project $project): Response
    {
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
    }
}
