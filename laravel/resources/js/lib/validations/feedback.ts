import { z } from 'zod';

/**
 * Feedback validation schemas matching Laravel backend rules.
 *
 * Backend reference:
 * - BetaFeedbackController@submit: type: required|in:suggestion,ux,confusion, message: required|string|max:5000, page_url: nullable|string|max:500
 * - BetaIssueReportController@report: title: required|string|max:255, description: required|string|min:20|max:10000, steps: required|string|max:5000, expected: required|string|max:2000, actual: required|string|max:2000, severity: required|in:low,medium,high,blocker
 */

// Feedback type enum
export const feedbackTypeEnum = ['suggestion', 'ux', 'bug'] as const;
export type FeedbackType = (typeof feedbackTypeEnum)[number];

// Feedback status enum (for admin management)
export const feedbackStatusEnum = ['new', 'reviewed', 'planned', 'done'] as const;
export type FeedbackStatus = (typeof feedbackStatusEnum)[number];

// Issue severity enum
export const issueSeverityEnum = ['low', 'medium', 'high', 'blocker'] as const;
export type IssueSeverity = (typeof issueSeverityEnum)[number];

// Issue status enum
export const issueStatusEnum = ['open', 'investigating', 'fixed', 'wont_fix'] as const;
export type IssueStatus = (typeof issueStatusEnum)[number];

// Submit feedback schema
export const submitFeedbackSchema = z.object({
    type: z.enum(feedbackTypeEnum, {
        errorMap: () => ({ message: 'Please select a feedback type' }),
    }),
    message: z.string().min(1, 'Message is required').max(5000, 'Message cannot exceed 5000 characters'),
    page_url: z.string().max(500, 'URL cannot exceed 500 characters').optional(),
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;

// Bug report schema (extended feedback with additional fields)
export const bugReportSchema = z.object({
    type: z.literal('bug'),
    message: z.string().min(1, 'Description is required').max(5000, 'Description cannot exceed 5000 characters'),
    expected: z.string().min(1, 'Expected behavior is required').max(2000, 'Expected behavior cannot exceed 2000 characters'),
    actual: z.string().min(1, 'Actual behavior is required').max(2000, 'Actual behavior cannot exceed 2000 characters'),
    page_url: z.string().max(500, 'URL cannot exceed 500 characters').optional(),
});

export type BugReportInput = z.infer<typeof bugReportSchema>;

// Issue report schema (full issue report)
export const issueReportSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title cannot exceed 255 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters').max(10000, 'Description cannot exceed 10000 characters'),
    steps: z.string().min(1, 'Steps to reproduce are required').max(5000, 'Steps cannot exceed 5000 characters'),
    expected: z.string().min(1, 'Expected behavior is required').max(2000, 'Expected behavior cannot exceed 2000 characters'),
    actual: z.string().min(1, 'Actual behavior is required').max(2000, 'Actual behavior cannot exceed 2000 characters'),
    severity: z.enum(issueSeverityEnum, {
        errorMap: () => ({ message: 'Please select a severity level' }),
    }),
    page_url: z.string().max(500, 'URL cannot exceed 500 characters').optional(),
});

export type IssueReportInput = z.infer<typeof issueReportSchema>;

// Update feedback schema (admin)
export const updateFeedbackSchema = z.object({
    status: z
        .enum(feedbackStatusEnum, {
            errorMap: () => ({ message: 'Please select a valid status' }),
        })
        .optional(),
    internal_notes: z.string().max(5000, 'Notes cannot exceed 5000 characters').optional().nullable(),
});

export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;

// Admin comment on issue schema
export const issueCommentSchema = z.object({
    comment: z.string().min(5, 'Comment must be at least 5 characters').max(5000, 'Comment cannot exceed 5000 characters'),
});

export type IssueCommentInput = z.infer<typeof issueCommentSchema>;
