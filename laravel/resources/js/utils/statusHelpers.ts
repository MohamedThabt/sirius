import type { FeaturePriority, FeatureStatus, ModuleStatus, StatusConfig } from '@/types/modules';
import { CheckCircle2, CircleIcon, ClockIcon } from 'lucide-react';

// ============================================
// Module Status Configuration
// ============================================

export const moduleStatusConfig: Record<ModuleStatus, StatusConfig> = {
    planned: {
        icon: CircleIcon,
        color: 'bg-muted text-muted-foreground border-border',
        label: 'Planned',
    },
    in_progress: {
        icon: ClockIcon,
        color: 'bg-secondary text-secondary-foreground border-border',
        label: 'In Progress',
    },
    completed: {
        icon: CheckCircle2,
        color: 'bg-primary/10 text-primary border-primary/20',
        label: 'Completed',
    },
};

export function getModuleStatusConfig(status: string): StatusConfig {
    return moduleStatusConfig[status as ModuleStatus] ?? moduleStatusConfig.planned;
}

// ============================================
// Feature Status Configuration
// ============================================

export const featureStatusConfig: Record<FeatureStatus, StatusConfig> = {
    draft: {
        icon: CircleIcon,
        color: 'bg-muted text-muted-foreground border-border',
        label: 'Draft',
    },
    todo: {
        icon: CircleIcon,
        color: 'bg-muted text-muted-foreground border-border',
        label: 'To Do',
    },
    in_progress: {
        icon: ClockIcon,
        color: 'bg-secondary text-secondary-foreground border-border',
        label: 'In Progress',
    },
    review: {
        icon: ClockIcon,
        color: 'bg-secondary text-secondary-foreground border-border',
        label: 'Review',
    },
    done: {
        icon: CheckCircle2,
        color: 'bg-primary/10 text-primary border-primary/20',
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
        color: 'bg-destructive/10 text-destructive border-destructive/20',
        label: 'Critical',
    },
    high: {
        color: 'bg-destructive/10 text-destructive border-destructive/20',
        label: 'High',
    },
    medium: {
        color: 'bg-secondary text-secondary-foreground border-border',
        label: 'Medium',
    },
    low: {
        color: 'bg-muted text-muted-foreground border-border',
        label: 'Low',
    },
};

export function getFeaturePriorityConfig(priority: string): Omit<StatusConfig, 'icon'> {
    return featurePriorityConfig[priority as FeaturePriority] ?? featurePriorityConfig.medium;
}
