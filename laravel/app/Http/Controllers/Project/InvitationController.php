<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\ProjectUser;
use App\Support\AppLogger;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Traits\StructuredLogger;

class InvitationController extends Controller
{
    use StructuredLogger;

    /**
     * Store a new invitation (invite a user to a project).
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request, Project $project)
    {
        // Validate request before try/catch to let Laravel handle ValidationException
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['required', Rule::in([ProjectUser::ROLE_ADMIN, ProjectUser::ROLE_DEVELOPER, ProjectUser::ROLE_VIEWER])],
        ]);

        try {
            // Authorization: check if user can invite members
            $userRole = $project->getMemberRole(auth()->id());
            $isOwner = $project->user_id === auth()->id();
            
            if (!$isOwner && !in_array($userRole, [ProjectUser::ROLE_OWNER, ProjectUser::ROLE_ADMIN])) {
                return back()->with('error', 'You do not have permission to invite members to this project.');
            }

            // Check if user is already a member
            if ($project->hasMember($validated['user_id'])) {
                return back()->withErrors(['user_id' => 'This user is already a member of the project.']);
            }

            // Check if user already has a pending invitation
            $existingInvitation = $project->invitations()
                ->where('user_id', $validated['user_id'])
                ->where('status', ProjectInvitation::STATUS_PENDING)
                ->first();

            if ($existingInvitation) {
                return back()->withErrors(['user_id' => 'This user already has a pending invitation.']);
            }

            // Prevent inviting yourself
            if ($validated['user_id'] == auth()->id()) {
                return back()->withErrors(['user_id' => 'You cannot invite yourself.']);
            }

            $project->inviteMember($validated['user_id'], $validated['role'], auth()->id());

            AppLogger::business('team.invitation.sent', [
                'project_id' => $project->id,
                'invitee_user_id' => $validated['user_id'],
                'role' => $validated['role'],
            ]);

            return back()->with('success', 'Invitation sent successfully!');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'store', 'project_id' => $project->id]);
            return back()->with('error', 'Failed to send invitation.');
        }
    }

    /**
     * Accept an invitation.
     *
     * @param Request $request
     * @param ProjectInvitation $invitation
     * @return \Illuminate\Http\RedirectResponse
     */
    public function accept(Request $request, ProjectInvitation $invitation)
    {
        try {
            // Check if the invitation belongs to the authenticated user
            if ($invitation->user_id !== auth()->id()) {
                return back()->with('error', 'This invitation does not belong to you.');
            }

            // Check if invitation is still pending
            if (!$invitation->isPending()) {
                return back()->with('error', 'This invitation is no longer valid.');
            }

            $project = $invitation->project;

            // Check if user is already a member
            if ($project->hasMember(auth()->id())) {
                $invitation->accept();
                return back()->with('success', 'You are already a member of this project.');
            }

            $project->addMember(auth()->id(), $invitation->role);
            $invitation->accept();

            AppLogger::business('team.invitation.accepted', [
                'project_id' => $project->id,
                'invitation_id' => $invitation->id,
                'user_id' => auth()->id(),
            ]);

            return back()->with('success', 'You have successfully joined the project!');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'accept', 'invitation_id' => $invitation->id]);
            return back()->with('error', 'Failed to accept invitation.');
        }
    }

    /**
     * Decline an invitation.
     *
     * @param Request $request
     * @param ProjectInvitation $invitation
     * @return \Illuminate\Http\RedirectResponse
     */
    public function decline(Request $request, ProjectInvitation $invitation)
    {
        try {
            // Check if the invitation belongs to the authenticated user
            if ($invitation->user_id !== auth()->id()) {
                return back()->with('error', 'This invitation does not belong to you.');
            }

            // Check if invitation is still pending
            if (!$invitation->isPending()) {
                return back()->with('error', 'This invitation is no longer valid.');
            }

            // Mark invitation as declined
            $invitation->decline();

            return back()->with('success', 'Invitation declined successfully.');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'decline', 'invitation_id' => $invitation->id]);
            return back()->with('error', 'Failed to decline invitation.');
        }
    }

    /**
     * Cancel an invitation (by project owner/admin).
     *
     * @param Request $request
     * @param Project $project
     * @param ProjectInvitation $invitation
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request, Project $project, ProjectInvitation $invitation)
    {
        try {
            // Check if the invitation belongs to this project
            if ($invitation->project_id !== $project->id) {
                return back()->with('error', 'Invitation not found for this project.');
            }

            // Only project owner or admin can cancel invitations
            $userRole = $project->getMemberRole(auth()->id());
            $isOwner = $project->user_id === auth()->id();
            
            if (!$isOwner && !in_array($userRole, [ProjectUser::ROLE_OWNER, ProjectUser::ROLE_ADMIN])) {
                return back()->with('error', 'Only project owners and admins can cancel invitations.');
            }

            $invitation->delete();

            AppLogger::business('team.invitation.cancelled', [
                'project_id' => $project->id,
                'invitation_id' => $invitation->id,
            ]);

            return back()->with('success', 'Invitation cancelled successfully.');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'destroy', 'project_id' => $project->id, 'invitation_id' => $invitation->id]);
            return back()->with('error', 'Failed to cancel invitation.');
        }
    }
}
