import { z } from 'zod';

/**
 * Module validation schemas matching Laravel backend rules.
 *
 * Backend reference:
 * - ModuleController@createSingleModule: name: required|string|max:255, description: required|string|min:10|max:5000
 * - ModuleController@update: name: sometimes|string|max:255, status: sometimes|in:planned,in_progress,completed
 * - ModuleSuggestionController@regenerateSuggestion: user_notes: required|string|min:10|max:2000
 */

// Module status enum
export const moduleStatusEnum = ['planned', 'in_progress', 'completed'] as const;
export type ModuleStatus = (typeof moduleStatusEnum)[number];

// Create module schema (single module creation)
export const createModuleSchema = z.object({
    name: z.string().min(1, 'Module name is required').max(255, 'Module name cannot exceed 255 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description cannot exceed 5000 characters'),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;

// Update module schema
export const updateModuleSchema = z.object({
    name: z.string().max(255, 'Module name cannot exceed 255 characters').optional(),
    description: z.string().optional().nullable(),
    metrics: z.string().optional().nullable(),
    erd: z.string().optional().nullable(),
    status: z
        .enum(moduleStatusEnum, {
            errorMap: () => ({ message: 'Please select a valid status' }),
        })
        .optional(),
    order_of_implementation: z.number().min(1, 'Order must be at least 1').optional(),
});

export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;

// Regenerate modules suggestion schema
export const regenerateModulesSchema = z.object({
    user_notes: z.string().min(10, 'Please provide at least 10 characters of feedback').max(2000, 'Feedback cannot exceed 2000 characters'),
});

export type RegenerateModulesInput = z.infer<typeof regenerateModulesSchema>;

// Bulk create modules schema (from suggestion)
export const bulkCreateModulesSchema = z.object({
    modules: z
        .array(
            z.object({
                name: z.string().min(1, 'Module name is required').max(255, 'Module name cannot exceed 255 characters'),
                description: z.string().optional().nullable(),
                metrics: z.string().optional().nullable(),
            }),
        )
        .min(1, 'At least one module is required'),
});

export type BulkCreateModulesInput = z.infer<typeof bulkCreateModulesSchema>;
