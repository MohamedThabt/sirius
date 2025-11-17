<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of the user's projects.
     */
    public function index(Request $request): Response
    {
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
    }

    /**
     * Display all project invitations for the authenticated user.
     */
    public function invitations(): Response
    {
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
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project)
    {
        // Check if user has access (owner or team member)
        if ($project->user_id !== auth()->id() && !$project->hasMember(auth()->id())) {
            abort(403, 'You do not have access to this project.');
        }

        // If project doesn't have a brief, redirect to prepare page
        if (empty($project->brief)) {
            return redirect()->route('projects.prepare', $project);
        }

        $project->load(['features', 'repository', 'user']);

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
            'sections' => [
                'overview' => $project->baseOverviewVersion,
                'prd' => $project->prd,
                'data_modeling' => $project->erd,
                'wireframes' => null,
                'technical_details' => $project->technical_details,
                'user_stories' => null,
                'non_functional_requirements' => $project->non_functional_requirements,
            ],
            'features' => $project->features,
            'brainstormingCompleted' => ! empty($project->brainstorming_scene),
            'teamMembers' => $teamMembers,
            'teamMembersCount' => $teamMembersCount,
        ]);
    }

    /**
     * Store a newly created project.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $project = Project::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
        ]);

        return redirect()->route('projects.prepare', $project)
            ->with('success', 'Project created successfully!');
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, Project $project)
    {
        // Only owner or admin can update project
        $this->authorizeModify($project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:draft,in_progress,completed,archived',
        ]);

        $project->update($validated);

        return redirect()->route('projects.index')
            ->with('success', 'Project updated successfully!');
    }

    /**
     * Remove the specified project.
     */
    public function destroy(Project $project)
    {
        // Only owner can delete project
        if ($project->user_id !== auth()->id()) {
            abort(403, 'Only the project owner can delete this project.');
        }

        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Project deleted successfully!');
    }

    public function prepare(Project $project)
    {
        // Ensure user has access to the project
        $this->authorizeAccess($project);

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
    }

    /**
     * Get the ERD for the specified project.
     */
    public function getERD(Project $project): Response
    {
        // Ensure user has access to the project
        $this->authorizeAccess($project);

        return Inertia::render('Projects/DatabaseDesigner', [
            'project' => $project,
            'initialContent' => $project->erd,
        ]);
    }

    /**
     * Generate C4 diagram for the specified project.
     */
    public function generateC4(Project $project)
    {
        // Only owner or admin can generate C4
        $this->authorizeModify($project);

        // If C4 already exists, redirect to the C4 page
        if ($project->c4) {
            return redirect()->route('projects.c4', $project);
        }

        // If no PRD exists, redirect back with error
        if (! $project->prd) {
            return redirect()->back()
                ->with('error', 'Please generate a PRD first before creating the C4 diagram.');
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
    }

    /**
     * Generate C4 diagram asynchronously after initial page load
     */
    public function generateC4Async(Request $request, Project $project)
    {
        // Only owner or admin can generate C4
        $this->authorizeModify($project);

        // Increase execution time for FastAPI calls
        set_time_limit(180);

        $pendingData = session('pending_c4_generation');

        if (! $pendingData || $pendingData['project_id'] !== $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'No pending generation data found',
            ], 400);
        }

        try {
            $fastApiBaseUrl = config('app.fastapi_base_url', 'http://127.0.0.1:8005');
            $response = Http::asJson()->acceptJson()->timeout(120)->retry(2, 2000)
                ->post($fastApiBaseUrl.'/v1/C4/generate', [
                    'SystemPRD' => [
                        'PRD' => $project->prd,
                    ],
                ]);

            if ($response->successful()) {
                $data = $response->json();

                // Update project with generated C4 diagram
                $project->update([
                    'c4' => $data['C4'] ?? null,
                ]);

                // Clear pending session data
                session()->forget('pending_c4_generation');

                Log::info('C4 diagram generated successfully for project: '.$project->id);

                return response()->json([
                    'success' => true,
                    'message' => 'C4 diagram generated successfully',
                    'c4' => $project->c4,
                ]);
            } else {
                Log::error('Failed to generate C4 diagram', [
                    'project_id' => $project->id,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate C4 diagram. Please try again.',
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Exception while generating C4 diagram', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while generating the C4 diagram. Please try again.',
            ], 500);
        }
    }

    /**
     * Edit C4 diagram with AI for the specified project.
     */
    public function editC4(Request $request, Project $project): RedirectResponse
    {
        // Only owner or admin can save C4
        $this->authorizeModify($project);

        $validated = $request->validate([
            'engineer_notes' => 'sometimes|string|max:2000',
            'c4_content' => 'sometimes|string',
        ]);

        // If c4_content is provided, just save it directly (manual edit)
        if (isset($validated['c4_content'])) {
            try {
                $project->update([
                    'c4' => $validated['c4_content'],
                ]);

                Log::info('C4 diagram saved manually for project: '.$project->id);

                return redirect()->back()
                    ->with('success', 'C4 diagram saved successfully!');
            } catch (\Exception $e) {
                Log::error('Exception while saving C4 diagram', [
                    'project_id' => $project->id,
                    'error' => $e->getMessage(),
                ]);

                return redirect()->back()
                    ->with('error', 'An error occurred while saving the C4 diagram. Please try again.');
            }
        }

        // If engineer_notes is provided, use AI to edit the diagram
        if (isset($validated['engineer_notes'])) {
            try {
                $response = Http::timeout(60)->post('http://127.0.0.1:8005/v1/C4/edit', [
                    'SystemC4' => $project->c4 ?? '',
                    'engineer_notes' => $validated['engineer_notes'],
                ]);

                if ($response->successful()) {
                    $data = $response->json();

                    // Update project with edited C4 diagram
                    $project->update([
                        'c4' => $data['C4'] ?? $project->c4,
                    ]);

                    Log::info('C4 diagram edited with AI for project: '.$project->id);

                    return redirect()->back()
                        ->with('success', 'C4 diagram updated successfully!');
                } else {
                    Log::error('Failed to edit C4 diagram with AI', [
                        'project_id' => $project->id,
                        'status' => $response->status(),
                        'response' => $response->body(),
                    ]);

                    return redirect()->back()
                        ->with('error', 'Failed to update C4 diagram. Please try again.');
                }
            } catch (\Exception $e) {
                Log::error('Exception while editing C4 diagram with AI', [
                    'project_id' => $project->id,
                    'error' => $e->getMessage(),
                ]);

                return redirect()->back()
                    ->with('error', 'An error occurred while updating the C4 diagram. Please try again.');
            }
        }

        return redirect()->back()
            ->with('error', 'No valid data provided for C4 diagram update.');
    }

    /**
     * Display the C4 diagram for the specified project.
     */
    public function getC4(Project $project): Response
    {
        // Ensure user has access to the project
        $this->authorizeAccess($project);

        return Inertia::render('Projects/SystemArchitecture', [
            'project' => $project,
        ]);
    }

    /**
     * Display technology details for the specified project.
     */
    public function showTechnology(Project $project): Response
    {
        // Ensure user has access to the project
        $this->authorizeAccess($project);

        $project->load(['technicalIntake']);

        return Inertia::render('Projects/Technology', [
            'project' => $project,
            'technicalIntake' => $project->technicalIntake,
        ]);
    }

    /**
     * Check if user has access to the project (owner or team member).
     */
    protected function authorizeAccess(Project $project, array $allowedRoles = []): void
    {
        $userId = auth()->id();
        
        // Owner always has access
        if ($project->user_id === $userId) {
            return;
        }

        // Check if user is a team member
        if (!$project->hasMember($userId)) {
            abort(403, 'You do not have access to this project.');
        }

        // If specific roles are required, check user's role
        if (!empty($allowedRoles)) {
            $userRole = $project->getMemberRole($userId);
            if (!in_array($userRole, $allowedRoles)) {
                abort(403, 'You do not have permission to perform this action.');
            }
        }
    }

    /**
     * Check if user can modify the project (owner or admin).
     */
    protected function authorizeModify(Project $project): void
    {
        $this->authorizeAccess($project, ['owner', 'admin']);
    }
}
