import { z } from 'zod';

/**
 * Project validation schemas matching Laravel backend rules.
 * 
 * Backend reference:
 * - ProjectController@store: name: required|string|max:255
 * - ProjectController@update: name: required|string|max:255, status: required|in:draft,in_progress,completed,archived
 */

// Project status enum (matches Laravel enum constraint)
export const projectStatusEnum = ['draft', 'in_progress', 'completed', 'archived'] as const;
export type ProjectStatus = typeof projectStatusEnum[number];

// Create project schema
export const createProjectSchema = z.object({
    name: z.string()
        .min(1, 'Project name is required')
        .max(255, 'Project name cannot exceed 255 characters'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// Update project schema
export const updateProjectSchema = z.object({
    name: z.string()
        .min(1, 'Project name is required')
        .max(255, 'Project name cannot exceed 255 characters'),
    status: z.enum(projectStatusEnum, {
        errorMap: () => ({ message: 'Please select a valid status' }),
    }),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// System overview schema (for project setup)
export const systemOverviewSchema = z.object({
    why_making: z.string()
        .min(1, 'Please explain why you are making this project')
        .max(2000, 'This field cannot exceed 2000 characters'),
    who_for: z.string()
        .min(1, 'Please specify who this project is for')
        .max(2000, 'This field cannot exceed 2000 characters'),
    what_valuable: z.string()
        .min(1, 'Please explain what makes this valuable')
        .max(2000, 'This field cannot exceed 2000 characters'),
    features_functionality: z.string()
        .min(1, 'Please describe the features and functionality')
        .max(2000, 'This field cannot exceed 2000 characters'),
    data_model_details: z.string()
        .max(3000, 'This field cannot exceed 3000 characters')
        .optional(),
    platform_targets: z.string()
        .max(2000, 'This field cannot exceed 2000 characters')
        .optional(),
    frontend_tech: z.string()
        .max(2000, 'This field cannot exceed 2000 characters')
        .optional(),
    backend_tech: z.string()
        .max(2000, 'This field cannot exceed 2000 characters')
        .optional(),
    database_tech: z.string()
        .max(2000, 'This field cannot exceed 2000 characters')
        .optional(),
    ai_usage: z.string()
        .max(2000, 'This field cannot exceed 2000 characters')
        .optional(),
    external_services: z.string()
        .max(2000, 'This field cannot exceed 2000 characters')
        .optional(),
    expected_users: z.string()
        .max(50, 'This field cannot exceed 50 characters')
        .optional(),
});

export type SystemOverviewInput = z.infer<typeof systemOverviewSchema>;
