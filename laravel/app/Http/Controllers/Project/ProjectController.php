<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Support\AppLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use App\Traits\StructuredLogger;

class ProjectController extends Controller
{
    use StructuredLogger;

    /**
     * Display a listing of the user's projects.
     *
     * @param Request $request
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function index(Request $request)
    {
        try {
            $user = auth()->user();
            
            // Get owned projects
            $ownedProjects = $user->projects();
            
            // Get collaborated projects (where user is a team member)
            $teamProjects = $user->teamProjects();

            // Add search functionality to both queries
            if ($request->filled('search')) {
                $search = $request->get('search');
                
                $ownedProjects->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('overview', 'like', "%{$search}%")
                        ->orWhere('brief', 'like', "%{$search}%");
                });
                
                $teamProjects->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('overview', 'like', "%{$search}%")
                        ->orWhere('brief', 'like', "%{$search}%");
                });
            }

            // Get the projects
            $owned = $ownedProjects->orderBy('projects.created_at', 'desc')->get();
            $team = $teamProjects->orderBy('projects.created_at', 'desc')->get();
            
            // Merge and remove duplicates (in case user is both owner and member)
            $projects = $owned->merge($team)->unique('id')->sortByDesc('created_at')->values();

            // Get pending invitations for the user
            $invitations = $user->projectInvitations()
                ->with(['project:id,name,brief', 'invitedBy:id,name,avatar'])
                ->where('status', 'pending')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($invitation) {
                    return [
                        'id' => $invitation->id,
                        'project' => [
                            'id' => $invitation->project->id,
                            'name' => $invitation->project->name,
                            'brief' => $invitation->project->brief,
                        ],
                        'role' => $invitation->role,
                        'invited_by' => $invitation->invitedBy ? [
                            'id' => $invitation->invitedBy->id,
                            'name' => $invitation->invitedBy->name,
                            'avatar' => $invitation->invitedBy->avatar,
                        ] : null,
                        'invited_at' => $invitation->created_at->toISOString(),
                    ];
                });

            return Inertia::render('Projects/Index', [
                'projects' => $projects,
                'invitations' => $invitations,
                'ownedCount' => $owned->count(),
                'teamCount' => $team->count(),
                'search' => $request->get('search', ''),
                'invitationsCount' => $invitations->count(),
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load projects.');
        }
    }

    /**
     * Display all project invitations for the authenticated user.
     *
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function invitations()
    {
        try {
            $user = auth()->user();

            // Get pending invitations for the user
            $invitations = $user->projectInvitations()
                ->with(['project:id,name,brief', 'invitedBy:id,name,avatar'])
                ->where('status', 'pending')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($invitation) {
                    return [
                        'id' => $invitation->id,
                        'project' => [
                            'id' => $invitation->project->id,
                            'name' => $invitation->project->name,
                            'brief' => $invitation->project->brief,
                        ],
                        'role' => $invitation->role,
                        'invited_by' => $invitation->invitedBy ? [
                            'id' => $invitation->invitedBy->id,
                            'name' => $invitation->invitedBy->name,
                            'avatar' => $invitation->invitedBy->avatar,
                        ] : null,
                        'invited_at' => $invitation->created_at->toISOString(),
                    ];
                });

            return Inertia::render('Projects/Invitations', [
                'invitations' => $invitations,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'invitations']);
            return back()->with('error', 'Failed to load invitations.');
        }
    }

    /**
     * Display the specified project.
     *
     * @param Project $project
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function show(Project $project)
    {
        try {
            // Check if user has access (owner or team member)
            if ($project->user_id !== auth()->id() && !$project->hasMember(auth()->id())) {
                return back()->with('error', 'You do not have access to this project.');
            }

            // If project doesn't have a brief, redirect to prepare page
            if (empty($project->brief)) {
                return redirect()->route('projects.prepare', $project);
            }

            $project->load(['features', 'repository', 'user', 'technicalIntake']);

            // Get team members including owner (first 5 for preview)
            $owner = $project->user;
            $teamMembers = collect([
                [
                    'id' => $owner->id,
                    'name' => $owner->name,
                    'email' => $owner->email,
                    'avatar' => $owner->avatar,
                ]
            ]);

            // Add other team members
            $otherMembers = $project->members()
                ->take(4)
                ->get(['users.id', 'users.name', 'users.email', 'users.avatar'])
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->avatar,
                    ];
                });

            $teamMembers = $teamMembers->merge($otherMembers);

            // Count includes owner + team members
            $teamMembersCount = 1 + $project->members()->count();

            // Get current user's role in the project
            $userRole = $project->getMemberRole(auth()->id());

            return Inertia::render('Projects/Show', [
                'project' => $project,
                'repository' => $project->repository,
                'userRole' => $userRole, // Add user's role for permission checks in frontend
                'hasTechnicalIntake' => $project->technicalIntake !== null,
                'sections' => [
                    'overview' => $project->baseOverviewVersion,
                    'prd' => $project->prd,
                    'data_modeling' => $project->erd,
                    'wireframes' => null,
                    'technical_details' => $project->technical_details,
                    'user_stories' => null,
                    'non_functional_requirements' => $project->non_functional_requirements,
                ],
                'modules' => $project->modules()->with('features')->orderBy('order_of_implementation')->get(),
                'brainstormingCompleted' => ! empty($project->brainstorming_scene),
                'teamMembers' => $teamMembers,
                'teamMembersCount' => $teamMembersCount,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'show', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load project details.');
        }
    }

    /**
     * Store a newly created project.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        try {
            $project = Project::create([
                'user_id' => auth()->id(),
                'name' => $validated['name'],
            ]);

            AppLogger::business('project.created', [
                'project_id' => $project->id,
                'name' => $project->name,
            ]);

            return redirect()->route('projects.prepare', $project)
                ->with('success', 'Project created successfully!');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'store']);
            return back()->with('error', 'Failed to create project.');
        }
    }

    /**
     * Update the specified project.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:draft,in_progress,completed,archived',
        ]);

        try {
            // Only owner or admin can update project
            $this->ensureModify($project);

            $project->update($validated);

            return redirect()->route('projects.index')
                ->with('success', 'Project updated successfully!');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'update', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to update project: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified project.
     *
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Project $project)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'Only the project owner can delete this project.');
            }

            $name = $project->name;
            $id = $project->id;
            $project->delete();

            AppLogger::business('project.deleted', [
                'project_id' => $id,
                'name' => $name,
            ]);

            return redirect()->route('projects.index')
                ->with('success', 'Project deleted successfully!');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'destroy', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to delete project.');
        }
    }

    /**
     * Display the project preparation page.
     *
     * @param Project $project
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function prepare(Project $project)
    {
        try {
            // Ensure user has access to the project
            $this->ensureAccess($project);

            // Get all user projects for sidebar navigation (owned + team projects)
            $ownedProjects = Project::where('user_id', auth()->id())
                ->orderBy('projects.updated_at', 'desc')
                ->get(['projects.id', 'projects.name', 'projects.status']);
                
            $teamProjects = auth()->user()->teamProjects()
                ->orderBy('projects.updated_at', 'desc')
                ->get(['projects.id', 'projects.name', 'projects.status']);
                
            $projects = $ownedProjects->merge($teamProjects)
                ->unique('id')
                ->sortByDesc('updated_at')
                ->values()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'status' => $p->status,
                ]);

            return Inertia::render('Projects/Prepare', [
                'projectId' => $project->id,
                'projectName' => $project->name,
                'projects' => $projects,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'prepare', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load project preparation.');
        }
    }





    /**
     * Display technology details for the specified project.
     *
     * @param Project $project
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function showTechnology(Project $project)
    {
        try {
            // Ensure user has access to the project
            $this->ensureAccess($project);

            $project->load(['technicalIntake']);

            return Inertia::render('Projects/Technology', [
                'project' => $project,
                'technicalIntake' => $project->technicalIntake,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'showTechnology', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load technology details.');
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
