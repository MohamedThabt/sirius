import { z } from 'zod';

/**
 * Feature validation schemas matching Laravel backend rules.
 *
 * Backend reference:
 * - FeatureController@createSingleFeature: name: required|string|min:2|max:255, description: required|string|min:10|max:5000
 * - FeatureController@update: name: nullable|string|max:255, status: nullable|in:draft,todo,in_progress,review,done, priority: nullable|in:low,medium,high,critical
 * - FeatureSuggestionController@regenerateSuggestion: user_notes: required|string|min:10|max:2000
 */

// Feature status enum
export const featureStatusEnum = ['draft', 'todo', 'in_progress', 'review', 'done'] as const;
export type FeatureStatus = (typeof featureStatusEnum)[number];

// Feature priority enum
export const featurePriorityEnum = ['low', 'medium', 'high', 'critical'] as const;
export type FeaturePriority = (typeof featurePriorityEnum)[number];

// Create feature schema (single feature creation)
export const createFeatureSchema = z.object({
    name: z.string().min(2, 'Feature name must be at least 2 characters').max(255, 'Feature name cannot exceed 255 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description cannot exceed 5000 characters'),
});

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>;

// Update feature schema
export const updateFeatureSchema = z.object({
    name: z.string().max(255, 'Feature name cannot exceed 255 characters').optional().nullable(),
    summary: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    acceptance_criteria: z.string().optional().nullable(),
    status: z
        .enum(featureStatusEnum, {
            errorMap: () => ({ message: 'Please select a valid status' }),
        })
        .optional()
        .nullable(),
    priority: z
        .enum(featurePriorityEnum, {
            errorMap: () => ({ message: 'Please select a valid priority' }),
        })
        .optional()
        .nullable(),
    order_of_implementation: z.number().min(1, 'Order must be at least 1').optional().nullable(),
    user_flows: z.string().optional().nullable(),
    metrics: z.string().optional().nullable(),
});

export type UpdateFeatureInput = z.infer<typeof updateFeatureSchema>;

// Regenerate features suggestion schema
export const regenerateFeaturesSchema = z.object({
    user_notes: z.string().min(10, 'Please provide at least 10 characters of feedback').max(2000, 'Feedback cannot exceed 2000 characters'),
});

export type RegenerateFeaturesInput = z.infer<typeof regenerateFeaturesSchema>;

// Bulk create features schema (from suggestion)
export const bulkCreateFeaturesSchema = z.object({
    features: z
        .array(
            z.object({
                name: z.string().min(2, 'Feature name must be at least 2 characters').max(255, 'Feature name cannot exceed 255 characters'),
                description: z.string().optional().nullable(),
            }),
        )
        .min(1, 'At least one feature is required'),
});

export type BulkCreateFeaturesInput = z.infer<typeof bulkCreateFeaturesSchema>;
