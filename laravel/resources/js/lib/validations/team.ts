import { z } from 'zod';

/**
 * Team/Project member validation schemas matching Laravel backend rules.
 * 
 * Backend reference:
 * - ProjectTeamController@sendInvitation: user_id: required|exists:users,id, role: required|in:admin,developer,viewer
 * - ProjectTeamController@updateRole: user_id: required|exists:users,id, role: required|in:admin,developer,viewer
 */

// Team member role enum (for invitations and role updates)
export const teamRoleEnum = ['admin', 'developer', 'viewer'] as const;
export type TeamRole = typeof teamRoleEnum[number];

// All project roles including owner (for display purposes)
export const allProjectRolesEnum = ['owner', 'admin', 'developer', 'viewer'] as const;
export type ProjectRole = typeof allProjectRolesEnum[number];

// Invite member schema
export const inviteMemberSchema = z.object({
    user_id: z.number({
        required_error: 'Please select a user to invite',
        invalid_type_error: 'Invalid user selected',
    }).positive('Please select a valid user'),
    role: z.enum(teamRoleEnum, {
        errorMap: () => ({ message: 'Please select a valid role' }),
    }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

// Update role schema
export const updateRoleSchema = z.object({
    user_id: z.number({
        required_error: 'User is required',
        invalid_type_error: 'Invalid user',
    }).positive('Invalid user'),
    role: z.enum(teamRoleEnum, {
        errorMap: () => ({ message: 'Please select a valid role' }),
    }),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

// Search user schema (for finding users to invite)
export const searchUserSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
});

export type SearchUserInput = z.infer<typeof searchUserSchema>;
