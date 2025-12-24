/**
 * Status and Priority Color Utilities
 * 
 * Centralized color mapping functions for consistent badge/status styling.
 * Follows design-styling-standards with semantic colors and dark mode support.
 */

/**
 * Get badge color classes for project status values.
 * Used in project cards and status badges.
 */
export function getStatusColor(status: string): string {
    switch (status) {
        case 'draft':
            return 'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-700 border-orange-200/50 dark:from-orange-500/15 dark:to-orange-500/5 dark:text-orange-300 dark:border-orange-500/20';
        case 'in_progress':
            return 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 border-blue-200/50 dark:from-blue-500/15 dark:to-blue-500/5 dark:text-blue-300 dark:border-blue-500/20';
        case 'review':
            return 'bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-700 border-yellow-200/50 dark:from-yellow-500/15 dark:to-yellow-500/5 dark:text-yellow-300 dark:border-yellow-500/20';
        case 'completed':
            return 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200/50 dark:from-emerald-500/15 dark:to-emerald-500/5 dark:text-emerald-300 dark:border-emerald-500/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

/**
 * Get badge color classes for priority values.
 * Used in feature and task priority badges.
 */
export function getPriorityColor(priority: string): string {
    switch (priority) {
        case 'critical':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30';
        case 'high':
            return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
        case 'medium':
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
        case 'low':
            return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

/**
 * Get badge color classes for module status values.
 * Used in module progress indicators.
 */
export function getModuleStatusColor(status: string): string {
    switch (status) {
        case 'planned':
            return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30';
        case 'in_progress':
            return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
        case 'completed':
            return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}
