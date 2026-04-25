import { z } from 'zod';

/**
 * ERD (Entity Relationship Diagram) validation schemas matching Laravel backend rules.
 *
 * Backend reference:
 * - ModuleERDController@aiEdit: engineer_notes: required|string|regex:/\S/
 * - ModuleERDController@manualEdit: erd: required|string|regex:/\S/
 * - FeatureDatamodelController@aiEdit: engineer_notes: required|string|regex:/\S/
 * - FeatureDatamodelController@manualEdit: datamodel: required|string|regex:/\S/
 * - FeatureSequenceController@aiEdit: engineer_notes: required|string|regex:/\S/
 * - FeatureSequenceController@manualEdit: sequence: required|string|regex:/\S/
 */

// Non-empty content validator (must contain at least one non-whitespace character)
const nonWhitespaceOnly = (fieldName: string) =>
    z.string().refine((val) => /\S/.test(val), { message: `${fieldName} cannot be empty or contain only whitespace` });

// AI edit schema (engineer notes)
export const aiEditSchema = z.object({
    engineer_notes: nonWhitespaceOnly('Notes'),
});

export type AiEditInput = z.infer<typeof aiEditSchema>;

// AI edit with max length (for some controllers)
export const aiEditWithLimitSchema = z.object({
    engineer_notes: z
        .string()
        .refine((val) => /\S/.test(val), { message: 'Notes cannot be empty' })
        .refine((val) => val.length <= 2000, { message: 'Notes cannot exceed 2000 characters' }),
});

export type AiEditWithLimitInput = z.infer<typeof aiEditWithLimitSchema>;

// Manual ERD edit schema
export const manualErdEditSchema = z.object({
    erd: nonWhitespaceOnly('ERD content'),
});

export type ManualErdEditInput = z.infer<typeof manualErdEditSchema>;

// Manual datamodel edit schema
export const manualDatamodelEditSchema = z.object({
    datamodel: nonWhitespaceOnly('Datamodel content'),
});

export type ManualDatamodelEditInput = z.infer<typeof manualDatamodelEditSchema>;

// Manual sequence edit schema
export const manualSequenceEditSchema = z.object({
    sequence: nonWhitespaceOnly('Sequence content'),
});

export type ManualSequenceEditInput = z.infer<typeof manualSequenceEditSchema>;

// Table field schema (for ERD table dialogs)
export const tableFieldSchema = z.object({
    name: z
        .string()
        .min(1, 'Field name is required')
        .max(64, 'Field name cannot exceed 64 characters')
        .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Field name must start with a letter or underscore and contain only letters, numbers, and underscores'),
    type: z.string().min(1, 'Field type is required'),
    isPrimaryKey: z.boolean().default(false),
    isForeignKey: z.boolean().default(false),
    isUnique: z.boolean().default(false),
    isNotNull: z.boolean().default(false),
    foreignKeyReference: z
        .object({
            referencedTable: z.string(),
            referencedField: z.string(),
        })
        .optional(),
});

export type TableFieldInput = z.infer<typeof tableFieldSchema>;

// Add table schema
export const addTableSchema = z.object({
    tableName: z
        .string()
        .min(1, 'Table name is required')
        .max(64, 'Table name cannot exceed 64 characters')
        .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Table name must start with a letter or underscore and contain only letters, numbers, and underscores'),
    fields: z.array(tableFieldSchema).min(1, 'At least one field is required'),
});

export type AddTableInput = z.infer<typeof addTableSchema>;

// Edit table schema
export const editTableSchema = z.object({
    tableName: z
        .string()
        .min(1, 'Table name is required')
        .max(64, 'Table name cannot exceed 64 characters')
        .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Table name must start with a letter or underscore and contain only letters, numbers, and underscores'),
    fields: z.array(tableFieldSchema).min(1, 'At least one field is required'),
});

export type EditTableInput = z.infer<typeof editTableSchema>;

// Mermaid preview schema
export const mermaidPreviewSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    title: z.string().optional().nullable(),
});

export type MermaidPreviewInput = z.infer<typeof mermaidPreviewSchema>;
