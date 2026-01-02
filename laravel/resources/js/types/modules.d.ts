import { LucideIcon } from 'lucide-react';

// ============================================
// Module-related types (shared across pages)
// ============================================

/**
 * Module status enum type.
 * WHY: Ensures type safety and enables exhaustive switch checks.
 */
export type ModuleStatus = 'planned' | 'in_progress' | 'completed';

/**
 * Feature status enum type.
 */
export type FeatureStatus = 'draft' | 'todo' | 'in_progress' | 'review' | 'done';

/**
 * Feature priority enum type.
 */
export type FeaturePriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Core Module entity used across all module pages.
 * WHY: Previously duplicated in 4+ files with slight variations.
 */
export interface ModuleItem {
    id: number;
    name: string;
    description: string;
    metrics: string | null;
    erd?: string | null;
    erd_is_synced?: boolean;
    status: ModuleStatus;
    order_of_implementation: number;
    progress?: number;
    features?: FeatureItem[];
}

/**
 * Feature entity within a module.
 * WHY: Used in ModuleShow.tsx and feature-related pages.
 * Extended with optional artifact fields for feature detail pages.
 */
export interface FeatureItem {
    id: number;
    name: string;
    summary: string | null;
    priority: FeaturePriority;
    status: FeatureStatus;
    order_of_implementation: number;
    // Optional artifact fields (populated on feature detail pages)
    progress?: number | null;
    prd?: string | null;
    description?: string | null;
    acceptance_criteria?: string | null;
    user_flows?: string | null;
    metrics?: string | null;
    datamodel?: string | null;
    sequence_diagram?: string | null;
    wireframe?: string | null;
    // Nested module reference (for breadcrumbs)
    module?: {
        id: number;
        name: string;
    };
}

/**
 * AI-generated feature suggestion (before saving to DB).
 * WHY: Used in FeaturesSuggestion.tsx for selecting features to create.
 */
export interface FeatureSuggestion {
    name: string;
    description: string;
    summary?: string;
    priority?: string;
}

/**
 * Module suggestion structure (for AI-generated modules).
 * WHY: Used in ModulesSuggestion.tsx for AI-generated module candidates.
 */
export interface ModuleSuggestion {
    name: string;
    description: string;
    metrics?: string;
}

// ============================================
// Status configuration types
// ============================================

export interface StatusConfig {
    icon: LucideIcon;
    color: string;
    label: string;
}

export type StatusConfigMap<T extends string> = Record<T, StatusConfig>;
