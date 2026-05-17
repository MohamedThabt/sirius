import type { FeaturePriority, FeatureStatus } from '@/types/modules';
import { AlertCircleIcon, CheckCircle2, CircleIcon, ClockIcon, type LucideIcon } from 'lucide-react';

export const PRIORITY_COLORS: Record<FeaturePriority | 'default', string> = {
    critical: 'bg-destructive/10 text-destructive border-destructive/20',
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-secondary text-secondary-foreground border-border',
    low: 'bg-muted text-muted-foreground border-border',
    default: 'bg-muted text-muted-foreground border-border',
};

export const STATUS_COLORS: Record<FeatureStatus | 'default', string> = {
    draft: 'bg-muted text-muted-foreground border-border',
    todo: 'bg-muted text-muted-foreground border-border',
    in_progress: 'bg-secondary text-secondary-foreground border-border',
    review: 'bg-secondary text-secondary-foreground border-border',
    done: 'bg-primary/10 text-primary border-primary/20',
    default: 'bg-muted text-muted-foreground border-border',
};

export const STATUS_ICONS: Record<FeatureStatus | 'default', LucideIcon> = {
    draft: CircleIcon,
    todo: CircleIcon,
    in_progress: ClockIcon,
    review: ClockIcon,
    done: CheckCircle2,
    default: CircleIcon,
};

export type HealthLevel = 'excellent' | 'good' | 'fair' | 'attention';

export const HEALTH_COLORS: Record<HealthLevel, string> = {
    excellent: 'text-primary',
    good: 'text-secondary-foreground',
    fair: 'text-secondary-foreground',
    attention: 'text-destructive',
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
