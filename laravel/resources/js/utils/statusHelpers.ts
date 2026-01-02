import { CheckCircle2, CircleIcon, ClockIcon } from 'lucide-react';
import type { FeaturePriority, FeatureStatus, ModuleStatus, StatusConfig } from '@/types/modules';

// ============================================
// Module Status Configuration
// ============================================

/**
 * WHY: These status color/icon mappings were duplicated in Index.tsx, 
 * ModuleShow.tsx, and partially in ModulesSuggestion.tsx. Centralizing them:
 * 1. Ensures visual consistency across all module pages
 * 2. Reduces bundle size (single definition)
 * 3. Makes theme updates trivial (change once, affects everywhere)
 */
export const moduleStatusConfig: Record<ModuleStatus, StatusConfig> = {
    planned: {
        icon: CircleIcon,
        color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30',
        label: 'Planned',
    },
    in_progress: {
        icon: ClockIcon,
        color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
        label: 'In Progress',
    },
    completed: {
        icon: CheckCircle2,
        color: 'bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
        label: 'Completed',
    },
};

/**
 * Get status configuration with fallback to 'planned'.
 * WHY: Provides type-safe access with sensible default.
 */
export function getModuleStatusConfig(status: string): StatusConfig {
    return moduleStatusConfig[status as ModuleStatus] ?? moduleStatusConfig.planned;
}

// ============================================
// Feature Status Configuration
// ============================================

export const featureStatusConfig: Record<FeatureStatus, StatusConfig> = {
    draft: {
        icon: CircleIcon,
        color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30',
        label: 'Draft',
    },
    todo: {
        icon: CircleIcon,
        color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30',
        label: 'To Do',
    },
    in_progress: {
        icon: ClockIcon,
        color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
        label: 'In Progress',
    },
    review: {
        icon: ClockIcon,
        color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30',
        label: 'Review',
    },
    done: {
        icon: CheckCircle2,
        color: 'bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
        label: 'Done',
    },
};

export function getFeatureStatusConfig(status: string): StatusConfig {
    return featureStatusConfig[status as FeatureStatus] ?? featureStatusConfig.draft;
}

// ============================================
// Feature Priority Configuration
// ============================================

export const featurePriorityConfig: Record<FeaturePriority, Omit<StatusConfig, 'icon'>> = {
    critical: {
        color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
        label: 'Critical',
    },
    high: {
        color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30',
        label: 'High',
    },
    medium: {
        color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
        label: 'Medium',
    },
    low: {
        color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30',
        label: 'Low',
    },
};

export function getFeaturePriorityConfig(priority: string): Omit<StatusConfig, 'icon'> {
    return featurePriorityConfig[priority as FeaturePriority] ?? featurePriorityConfig.medium;
}
