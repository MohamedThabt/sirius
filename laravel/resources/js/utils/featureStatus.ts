import { CheckCircle2, CircleIcon, ClockIcon, type LucideIcon } from 'lucide-react';
import type { FeaturePriority, FeatureStatus } from '@/types/modules';

/**
 * Feature priority color classes for badges.
 * WHY: Duplicated in Index.tsx, FeatureShow.tsx, and other files.
 */
export const PRIORITY_COLORS: Record<FeaturePriority | 'default', string> = {
    critical: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
    high: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30',
    medium: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
    low: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30',
    default: 'bg-muted text-muted-foreground border-border',
};

/**
 * Feature status color classes for badges.
 */
export const STATUS_COLORS: Record<FeatureStatus | 'default', string> = {
    draft: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
    completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
    archived: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30',
    default: 'bg-muted text-muted-foreground border-border',
};

/**
 * Status icon mapping.
 */
export const STATUS_ICONS: Record<FeatureStatus | 'default', LucideIcon> = {
    draft: CircleIcon,
    in_progress: ClockIcon,
    completed: CheckCircle2,
    archived: CircleIcon,
    default: CircleIcon,
};

export function getPriorityColor(priority: string): string {
    return PRIORITY_COLORS[priority as FeaturePriority] ?? PRIORITY_COLORS.default;
}

export function getStatusColor(status: string): string {
    return STATUS_COLORS[status as FeatureStatus] ?? STATUS_COLORS.default;
}

export function getStatusIcon(status: string): LucideIcon {
    return STATUS_ICONS[status as FeatureStatus] ?? STATUS_ICONS.default;
}
