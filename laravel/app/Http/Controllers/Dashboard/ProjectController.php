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
        $project->load('user:id,name,email');

        return Inertia::render('dashboard/projects/show', compact('project'));
    }
}
