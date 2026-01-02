import { AlertCircleIcon, CheckCircle2, CircleIcon, ClockIcon, type LucideIcon } from 'lucide-react';
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
    todo: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
    review: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30',
    done: 'bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
    default: 'bg-muted text-muted-foreground border-border',
};

/**
 * Status icon mapping.
 */
export const STATUS_ICONS: Record<FeatureStatus | 'default', LucideIcon> = {
    draft: CircleIcon,
    todo: CircleIcon,
    in_progress: ClockIcon,
    review: ClockIcon,
    done: CheckCircle2,
    default: CircleIcon,
};

/**
 * Health indicator styles for feature progress displays.
 * WHY: Centralizes hardcoded colors from FeatureShow.tsx health indicator.
 */
export type HealthLevel = 'excellent' | 'good' | 'fair' | 'attention';

export const HEALTH_COLORS: Record<HealthLevel, string> = {
    excellent: 'text-emerald-600 dark:text-emerald-400',
    good: 'text-blue-600 dark:text-blue-400',
    fair: 'text-orange-600 dark:text-orange-400',
    attention: 'text-red-600 dark:text-red-400',
};

export const HEALTH_ICONS: Record<HealthLevel, LucideIcon> = {
    excellent: CheckCircle2,
    good: CheckCircle2,
    fair: AlertCircleIcon,
    attention: AlertCircleIcon,
};

export function getHealthIndicator(progress: number): { label: HealthLevel; Icon: LucideIcon; color: string } {
    if (progress >= 80) return { label: 'excellent', Icon: HEALTH_ICONS.excellent, color: HEALTH_COLORS.excellent };
    if (progress >= 60) return { label: 'good', Icon: HEALTH_ICONS.good, color: HEALTH_COLORS.good };
    if (progress >= 40) return { label: 'fair', Icon: HEALTH_ICONS.fair, color: HEALTH_COLORS.fair };
    return { label: 'attention', Icon: HEALTH_ICONS.attention, color: HEALTH_COLORS.attention };
}

export function getPriorityColor(priority: string): string {
    return PRIORITY_COLORS[priority as FeaturePriority] ?? PRIORITY_COLORS.default;
}

export function getStatusColor(status: string): string {
    return STATUS_COLORS[status as FeatureStatus] ?? STATUS_COLORS.default;
}

export function getStatusIcon(status: string): LucideIcon {
    return STATUS_ICONS[status as FeatureStatus] ?? STATUS_ICONS.default;
}
