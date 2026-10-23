/**
 * Status and Priority Color Utilities
 *
 * Centralized color mapping functions for consistent badge/status styling.
 * Follows ElevenLabs minimalist design system.
 */

export function getStatusColor(status: string): string {
    switch (status) {
        case 'completed':
            return 'bg-secondary text-secondary-foreground border-border';
        case 'in_progress':
        case 'review':
            return 'bg-secondary text-secondary-foreground border-border';
        case 'draft':
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

export function getPriorityColor(priority: string): string {
    switch (priority) {
        case 'critical':
        case 'high':
            return 'bg-destructive/10 text-destructive border-destructive/20';
        case 'medium':
            return 'bg-secondary text-secondary-foreground border-border';
        case 'low':
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

export function getModuleStatusColor(status: string): string {
    switch (status) {
        case 'completed':
            return 'bg-secondary text-secondary-foreground border-border';
        case 'in_progress':
            return 'bg-secondary text-secondary-foreground border-border';
        case 'planned':
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}
