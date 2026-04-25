import { z } from 'zod';

/**
 * Admin validation schemas matching Laravel backend rules.
 *
 * Backend reference:
 * - AdminController@store: name: required|string|max:255, email: required|string|email|max:255|unique:admins, password: required|string|min:6, role: required|in:admin,super_admin
 * - AdminController@update: name: required|string|max:255, email: required|string|email|max:255|unique:admins,email,{id}, role: required|in:admin,super_admin, password: nullable|string|min:6
 */

// Admin role enum
export const adminRoleEnum = ['admin', 'super_admin'] as const;
export type AdminRole = (typeof adminRoleEnum)[number];

// Create admin schema
export const createAdminSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address').max(255, 'Email cannot exceed 255 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(adminRoleEnum, {
        errorMap: () => ({ message: 'Please select a valid role' }),
    }),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;

// Update admin schema (password is optional)
export const updateAdminSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address').max(255, 'Email cannot exceed 255 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')), // Allow empty string for "no change"
    role: z.enum(adminRoleEnum, {
        errorMap: () => ({ message: 'Please select a valid role' }),
    }),
});

export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
