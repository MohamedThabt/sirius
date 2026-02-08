<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectUser;
use App\Models\User;
use App\Support\AppLogger;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Traits\StructuredLogger;

class ProjectTeamController extends Controller
{
    use StructuredLogger;

    /**
     * Display the team management page.
     *
     * @param Request $request
     * @param Project $project
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function index(Request $request, Project $project)
    {
        try {
            // Authorization: check if user is a member
            if (!$project->hasMember(auth()->id())) {
                return back()->with('error', 'You do not have access to this project.');
            }

            // Search for user if email is provided
            $searchedUser = null;
            if ($request->filled('search_email')) {
                $user = User::where('email', $request->search_email)->first();
                if ($user) {
                    $searchedUser = [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->avatar,
                    ];
                }
            }

            // Get project owner
            $owner = $project->user;
            $ownerData = collect([
                [
                    'id' => $owner->id,
                    'name' => $owner->name,
                    'email' => $owner->email,
                    'avatar' => $owner->avatar,
                    'role' => 'owner',
                    'joined_at' => $project->created_at,
                ]
            ]);

            // Get all team members with their pivot data
            $teamMembers = $project->members()
                ->withPivot('role', 'joined_at')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->avatar,
                        'role' => $user->pivot->role,
                        'joined_at' => $user->pivot->joined_at,
                    ];
                });

            // Merge owner with team members (owner first)
            $members = $ownerData->merge($teamMembers);

            // Get pending invitations for this project
            $invitations = $project->pendingInvitations()
                ->with(['user', 'inviter'])
                ->latest('invited_at')
                ->get()
                ->map(function ($invitation) {
                    return [
                        'id' => $invitation->id,
                        'user' => [
                            'id' => $invitation->user->id,
                            'name' => $invitation->user->name,
                            'email' => $invitation->user->email,
                            'avatar' => $invitation->user->avatar,
                        ],
                        'role' => $invitation->role,
                        'invited_by' => $invitation->inviter ? [
                            'id' => $invitation->inviter->id,
                            'name' => $invitation->inviter->name,
                        ] : null,
                        'invited_at' => $invitation->invited_at,
                    ];
                });

            // Get user's pending invitations (for all projects)
            $myInvitations = auth()->user()->pendingProjectInvitations()
                ->latest('invited_at')
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
                        'invited_by' => $invitation->inviter ? [
                            'id' => $invitation->inviter->id,
                            'name' => $invitation->inviter->name,
                            'avatar' => $invitation->inviter->avatar,
                        ] : null,
                        'invited_at' => $invitation->invited_at,
                    ];
                });

            return Inertia::render('Projects/Team', [
                'project' => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'status' => $project->status,
                    'user_id' => $project->user_id,
                    'progress' => $project->progress,
                ],
                'members' => $members,
                'invitations' => $invitations,
                'myInvitations' => $myInvitations,
                'userRole' => $project->getMemberRole(auth()->id()) ?? ($project->user_id === auth()->id() ? 'owner' : null),
                'searchedUser' => $searchedUser,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'index', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to load team data.');
        }
    }

    /**
     * Get pending invitations for the authenticated user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function myInvitations(Request $request)
    {
        try {
            $invitations = auth()->user()->pendingProjectInvitations()
                ->latest('invited_at')
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
                        'invited_by' => $invitation->inviter ? [
                            'id' => $invitation->inviter->id,
                            'name' => $invitation->inviter->name,
                            'avatar' => $invitation->inviter->avatar,
                        ] : null,
                        'invited_at' => $invitation->invited_at,
                    ];
                });

            return response()->json(['invitations' => $invitations]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'myInvitations']);
            return response()->json(['error' => 'Failed to load invitations.'], 500);
        }
    }

    /**
     * Update a member's role.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateRole(Request $request, Project $project)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['required', Rule::in([ProjectUser::ROLE_ADMIN, ProjectUser::ROLE_DEVELOPER, ProjectUser::ROLE_VIEWER])],
        ]);

        try {
            // Authorization
            $userRole = $project->getMemberRole(auth()->id());
            $isOwner = $project->user_id === auth()->id();
            
            if (!$isOwner && !in_array($userRole, [ProjectUser::ROLE_OWNER, ProjectUser::ROLE_ADMIN])) {
                return back()->with('error', 'You do not have permission to manage team members.');
            }

            // Prevent changing owner role
            $targetMemberRole = $project->getMemberRole($validated['user_id']);
            if ($targetMemberRole === ProjectUser::ROLE_OWNER) {
                return back()->withErrors(['error' => 'Cannot change the owner\'s role.']);
            }

            // Prevent user from changing their own role
            if ($validated['user_id'] == auth()->id()) {
                return back()->withErrors(['error' => 'You cannot change your own role.']);
            }

            // Update role
            $project->members()->updateExistingPivot($validated['user_id'], [
                'role' => $validated['role'],
            ]);

            AppLogger::business('team.member.role_updated', [
                'project_id' => $project->id,
                'target_user_id' => $validated['user_id'],
                'new_role' => $validated['role'],
            ]);

            return back()->with('success', 'Member role updated successfully!');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'updateRole', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to update member role.');
        }
    }

    /**
     * Remove a member from the project.
     *
     * @param Request $request
     * @param Project $project
     * @param User $user
     * @return \Illuminate\Http\RedirectResponse
     */
    public function removeMember(Request $request, Project $project, User $user)
    {
        try {
            // Authorization
            $userRole = $project->getMemberRole(auth()->id());
            $isOwner = $project->user_id === auth()->id();
            
            if (!$isOwner && !in_array($userRole, [ProjectUser::ROLE_OWNER, ProjectUser::ROLE_ADMIN])) {
                return back()->with('error', 'You do not have permission to remove team members.');
            }

            // Prevent removing owner
            $targetMemberRole = $project->getMemberRole($user->id);
            if ($targetMemberRole === ProjectUser::ROLE_OWNER || $project->user_id === $user->id) {
                return back()->withErrors(['error' => 'Cannot remove the project owner.']);
            }

            // Prevent user from removing themselves (use leave method instead)
            if ($user->id === auth()->id()) {
                return back()->withErrors(['error' => 'Use the leave project option to remove yourself.']);
            }

            $project->members()->detach($user->id);

            AppLogger::business('team.member.removed', [
                'project_id' => $project->id,
                'removed_user_id' => $user->id,
            ]);

            return back()->with('success', 'Member removed successfully!');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'removeMember', 'project_id' => $project->id, 'user_id' => $user->id]);
            return back()->with('error', 'Failed to remove member.');
        }
    }

    /**
     * Leave the project.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function leave(Request $request, Project $project)
    {
        try {
            // Prevent owner from leaving
            if ($project->user_id === auth()->id()) {
                return back()->withErrors(['error' => 'Project owner cannot leave the project.']);
            }

            $userRole = $project->getMemberRole(auth()->id());
            if ($userRole === ProjectUser::ROLE_OWNER) {
                return back()->withErrors(['error' => 'Project owner cannot leave the project.']);
            }

            // Remove user from project
            $project->members()->detach(auth()->id());

            AppLogger::business('team.member.left', [
                'project_id' => $project->id,
                'user_id' => auth()->id(),
            ]);

            return redirect()->route('projects.index')->with('success', 'You have left the project.');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'leave', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to leave project.');
        }
    }

    /**
     * Get team statistics.
     *
     * @param Project $project
     * @return \Illuminate\Http\JsonResponse
     */
    public function stats(Project $project)
    {
        try {
            // Authorization
            if (!$project->hasMember(auth()->id())) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $totalMembers = $project->members()->count();
            $membersByRole = $project->members()
                ->get()
                ->groupBy('pivot.role')
                ->map->count();

            $recentJoins = $project->members()
                ->wherePivot('joined_at', '>=', now()->subDays(7))
                ->count();

            return response()->json([
                'total_members' => $totalMembers,
                'members_by_role' => $membersByRole,
                'recent_joins' => $recentJoins,
            ]);
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'stats', 'project_id' => $project->id]);
            return response()->json(['error' => 'Failed to load team statistics.'], 500);
        }
    }
}
