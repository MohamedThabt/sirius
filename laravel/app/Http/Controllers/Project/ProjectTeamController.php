<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ProjectTeamController extends Controller
{
    /**
     * Display the team management page.
     */
    public function index(Project $project)
    {
        // Authorization: check if user is a member
        if (!$project->hasMember(auth()->id())) {
            abort(403, 'You do not have access to this project.');
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
            ],
            'members' => $members,
            'invitations' => $invitations,
            'myInvitations' => $myInvitations,
            'userRole' => $project->getMemberRole(auth()->id()) ?? ($project->user_id === auth()->id() ? 'owner' : null),
        ]);
    }

    /**
     * Search for users by email.
     */
    public function searchUsers(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
        ]);
    }

    /**
     * Get pending invitations for the authenticated user.
     */
    public function myInvitations(Request $request)
    {
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
    }

    /**
     * Update a member's role.
     */
    public function updateRole(Request $request, Project $project)
    {
        // Authorization
        $userRole = $project->getMemberRole(auth()->id());
        $isOwner = $project->user_id === auth()->id();
        
        if (!$isOwner && !in_array($userRole, [ProjectUser::ROLE_OWNER, ProjectUser::ROLE_ADMIN])) {
            abort(403, 'You do not have permission to manage team members.');
        }

        // Validate
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['required', Rule::in([ProjectUser::ROLE_ADMIN, ProjectUser::ROLE_DEVELOPER, ProjectUser::ROLE_VIEWER])],
        ]);

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

        return back()->with('success', 'Member role updated successfully!');
    }

    /**
     * Remove a member from the project.
     */
    public function removeMember(Request $request, Project $project, User $user)
    {
        // Authorization
        $userRole = $project->getMemberRole(auth()->id());
        $isOwner = $project->user_id === auth()->id();
        
        if (!$isOwner && !in_array($userRole, [ProjectUser::ROLE_OWNER, ProjectUser::ROLE_ADMIN])) {
            abort(403, 'You do not have permission to remove team members.');
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

        // Remove member
        $project->members()->detach($user->id);

        return back()->with('success', 'Member removed successfully!');
    }

    /**
     * Leave the project.
     */
    public function leave(Request $request, Project $project)
    {
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

        return redirect()->route('projects.index')->with('success', 'You have left the project.');
    }

    /**
     * Get team statistics.
     */
    public function stats(Project $project)
    {
        // Authorization
        if (!$project->hasMember(auth()->id())) {
            abort(403);
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
    }
}
