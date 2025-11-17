<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\ProjectUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class InvitationController extends Controller
{
    /**
     * Store a new invitation (invite a user to a project).
     */
    public function store(Request $request, Project $project)
    {
        Log::info('Invitation.store called', [
            'project_id' => $project->id,
            'actor_id' => auth()->id(),
        ]);

        // Authorization: check if user can invite members
        $userRole = $project->getMemberRole(auth()->id());
        $isOwner = $project->user_id === auth()->id();
        
        if (!$isOwner && !in_array($userRole, [ProjectUser::ROLE_OWNER, ProjectUser::ROLE_ADMIN])) {
            Log::warning('Invitation.store unauthorized', [
                'project_id' => $project->id,
                'actor_id' => auth()->id(),
                'actor_role' => $userRole,
            ]);
            abort(403, 'You do not have permission to invite members to this project.');
        }

        // Validate request
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['required', Rule::in([ProjectUser::ROLE_ADMIN, ProjectUser::ROLE_DEVELOPER, ProjectUser::ROLE_VIEWER])],
        ]);

        // Check if user is already a member
        if ($project->hasMember($validated['user_id'])) {
            Log::info('Invitation.store member already exists', [
                'project_id' => $project->id,
                'user_id' => $validated['user_id'],
            ]);
            return back()->withErrors(['user_id' => 'This user is already a member of the project.']);
        }

        // Check if user already has a pending invitation
        $existingInvitation = $project->invitations()
            ->where('user_id', $validated['user_id'])
            ->where('status', ProjectInvitation::STATUS_PENDING)
            ->first();

        if ($existingInvitation) {
            Log::info('Invitation.store pending invitation exists', [
                'project_id' => $project->id,
                'user_id' => $validated['user_id'],
            ]);
            return back()->withErrors(['user_id' => 'This user already has a pending invitation.']);
        }

        // Prevent inviting yourself
        if ($validated['user_id'] == auth()->id()) {
            return back()->withErrors(['user_id' => 'You cannot invite yourself.']);
        }

        // Create invitation
        try {
            $invitation = $project->inviteMember($validated['user_id'], $validated['role'], auth()->id());

            Log::info('Invitation.store created', [
                'project_id' => $project->id,
                'invitation_id' => $invitation->id,
                'invited_user_id' => $validated['user_id'],
                'role' => $validated['role'],
                'invited_by' => auth()->id(),
            ]);

            return back()->with('success', 'Invitation sent successfully!');
        } catch (\Exception $e) {
            Log::error('Invitation.store failed', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Accept an invitation.
     */
    public function accept(Request $request, ProjectInvitation $invitation)
    {
        Log::info('Invitation.accept called', [
            'invitation_id' => $invitation->id,
            'project_id' => $invitation->project_id,
            'actor_id' => auth()->id(),
        ]);

        // Check if the invitation belongs to the authenticated user
        if ($invitation->user_id !== auth()->id()) {
            Log::warning('Invitation.accept unauthorized', [
                'invitation_id' => $invitation->id,
                'invitation_user_id' => $invitation->user_id,
                'actor_id' => auth()->id(),
            ]);
            abort(403, 'This invitation does not belong to you.');
        }

        // Check if invitation is still pending
        if (!$invitation->isPending()) {
            Log::info('Invitation.accept not pending', [
                'invitation_id' => $invitation->id,
                'status' => $invitation->status,
            ]);
            return back()->withErrors(['error' => 'This invitation is no longer valid.']);
        }

        $project = $invitation->project;

        // Check if user is already a member
        if ($project->hasMember(auth()->id())) {
            $invitation->accept();
            Log::info('Invitation.accept actor already a member', [
                'project_id' => $project->id,
                'actor_id' => auth()->id(),
                'invitation_id' => $invitation->id,
            ]);
            return redirect()->route('projects.show', $project)->with('message', 'You are already a member of this project.');
        }

        // Add user to project with the role specified in the invitation
        $project->addMember(auth()->id(), $invitation->role);

        // Mark invitation as accepted
        $invitation->accept();

        Log::info('Invitation.accept success', [
            'project_id' => $project->id,
            'actor_id' => auth()->id(),
            'new_role' => $invitation->role,
            'invitation_id' => $invitation->id,
        ]);

        return redirect()->route('projects.show', $project)
            ->with('success', 'You have successfully joined the project!');
    }

    /**
     * Decline an invitation.
     */
    public function decline(Request $request, ProjectInvitation $invitation)
    {
        Log::info('Invitation.decline called', [
            'invitation_id' => $invitation->id,
            'project_id' => $invitation->project_id,
            'actor_id' => auth()->id(),
        ]);

        // Check if the invitation belongs to the authenticated user
        if ($invitation->user_id !== auth()->id()) {
            Log::warning('Invitation.decline unauthorized', [
                'invitation_id' => $invitation->id,
                'invitation_user_id' => $invitation->user_id,
                'actor_id' => auth()->id(),
            ]);
            abort(403, 'This invitation does not belong to you.');
        }

        // Check if invitation is still pending
        if (!$invitation->isPending()) {
            Log::info('Invitation.decline not pending', [
                'invitation_id' => $invitation->id,
                'status' => $invitation->status,
            ]);
            return back()->withErrors(['error' => 'This invitation is no longer valid.']);
        }

        // Mark invitation as declined
        $projectId = $invitation->project_id;
        $invitation->decline();

        Log::info('Invitation.decline success', [
            'invitation_id' => $invitation->id,
            'project_id' => $projectId,
            'actor_id' => auth()->id(),
        ]);

        return back()->with('success', 'Invitation declined successfully.');
    }

    /**
     * Cancel an invitation (by project owner/admin).
     */
    public function destroy(Request $request, Project $project, ProjectInvitation $invitation)
    {
        Log::info('Invitation.destroy called', [
            'invitation_id' => $invitation->id,
            'project_id' => $project->id,
            'actor_id' => auth()->id(),
        ]);

        // Check if the invitation belongs to this project
        if ($invitation->project_id !== $project->id) {
            Log::warning('Invitation.destroy project mismatch', [
                'invitation_id' => $invitation->id,
                'invitation_project_id' => $invitation->project_id,
                'requested_project_id' => $project->id,
                'actor_id' => auth()->id(),
            ]);
            abort(404);
        }

        // Only project owner or admin can cancel invitations
        $userRole = $project->getMemberRole(auth()->id());
        $isOwner = $project->user_id === auth()->id();
        
        if (!$isOwner && !in_array($userRole, [ProjectUser::ROLE_OWNER, ProjectUser::ROLE_ADMIN])) {
            Log::warning('Invitation.destroy unauthorized', [
                'invitation_id' => $invitation->id,
                'project_id' => $project->id,
                'actor_id' => auth()->id(),
                'actor_role' => $userRole,
            ]);
            abort(403, 'Only project owners and admins can cancel invitations.');
        }

        // Delete the invitation
        $invitedUserId = $invitation->user_id;
        $invitation->delete();

        Log::info('Invitation.destroy success', [
            'invitation_id' => $invitation->id,
            'project_id' => $project->id,
            'actor_id' => auth()->id(),
            'invited_user_id' => $invitedUserId,
        ]);

        return back()->with('success', 'Invitation cancelled successfully.');
    }
}
