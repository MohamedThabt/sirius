import { z } from 'zod';

/**
 * Common validation patterns used across multiple schemas.
 * These mirror Laravel's validation rules.
 */

// Non-empty string (matches Laravel's regex:/\S/ for at least one non-whitespace)
export const nonEmptyString = z.string().refine(
    (val) => /\S/.test(val),
    { message: 'This field cannot be empty or contain only whitespace' }
);

// Name field (common pattern: required, max 255)
export const nameField = z.string()
    .min(1, 'Name is required')
    .max(255, 'Name cannot exceed 255 characters');

// Email field
export const emailField = z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email cannot exceed 255 characters');

// Password field (min 6 for admin, min 8 for users with Password::defaults())
export const passwordField = z.string()
    .min(6, 'Password must be at least 6 characters');

export const userPasswordField = z.string()
    .min(8, 'Password must be at least 8 characters');

// Description fields with common min/max values
export const shortDescriptionField = z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description cannot exceed 5000 characters');

export const longDescriptionField = z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(10000, 'Description cannot exceed 10000 characters');

// Engineer notes field (used in AI edit operations)
export const engineerNotesField = z.string()
    .refine((val) => /\S/.test(val), { message: 'Notes cannot be empty' })
    .refine((val) => val.length <= 2000, { message: 'Notes cannot exceed 2000 characters' });

// URL field
export const urlField = z.string()
    .max(500, 'URL cannot exceed 500 characters')
    .optional();
