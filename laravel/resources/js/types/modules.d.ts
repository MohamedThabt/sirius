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
export type FeatureStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

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
    features?: FeatureItem[];
}

/**
 * Feature entity within a module.
 * WHY: Used in ModuleShow.tsx and feature-related pages.
 */
export interface FeatureItem {
    id: number;
    name: string;
    summary: string;
    priority: FeaturePriority;
    status: FeatureStatus;
    order_of_implementation: number;
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
