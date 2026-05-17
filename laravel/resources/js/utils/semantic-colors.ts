/**
 * Semantic Color System
 * Follows ElevenLabs minimalist design system.
 */

export const semanticColors = {
    success: {
        badge: 'bg-primary/10 text-primary border-primary/20',
        text: 'text-primary',
        bg: 'bg-secondary',
        border: 'border-border',
        hover: 'hover:bg-secondary/80',
        icon: 'text-primary',
    },
    error: {
        badge: 'bg-destructive/10 text-destructive border-destructive/20',
        text: 'text-destructive',
        bg: 'bg-destructive/10',
        border: 'border-destructive/30',
        hover: 'hover:bg-destructive/20',
        icon: 'text-destructive',
    },
    warning: {
        badge: 'bg-secondary text-secondary-foreground border-border',
        text: 'text-secondary-foreground',
        bg: 'bg-secondary',
        border: 'border-border',
        hover: 'hover:bg-secondary/80',
        icon: 'text-secondary-foreground',
    },
    info: {
        badge: 'bg-secondary text-secondary-foreground border-border',
        text: 'text-secondary-foreground',
        bg: 'bg-secondary',
        border: 'border-border',
        hover: 'hover:bg-secondary/80',
        icon: 'text-secondary-foreground',
    },
    neutral: {
        badge: 'bg-muted text-muted-foreground border-border',
        text: 'text-muted-foreground',
        bg: 'bg-muted',
        border: 'border-border',
        hover: 'hover:bg-muted/80',
        icon: 'text-muted-foreground',
    },
    purple: {
        badge: 'bg-secondary text-secondary-foreground border-border',
        text: 'text-secondary-foreground',
        bg: 'bg-secondary',
        border: 'border-border',
        hover: 'hover:bg-secondary/80',
        icon: 'text-secondary-foreground',
    },
    orange: {
        badge: 'bg-secondary text-secondary-foreground border-border',
        text: 'text-secondary-foreground',
        bg: 'bg-secondary',
        border: 'border-border',
        hover: 'hover:bg-secondary/80',
        icon: 'text-secondary-foreground',
    },
} as const;

export const logLevelColors = {
    DEBUG: 'bg-muted text-muted-foreground border-border',
    INFO: 'bg-secondary text-secondary-foreground border-border',
    NOTICE: 'bg-secondary text-secondary-foreground border-border',
    WARNING: 'bg-secondary text-secondary-foreground border-border',
    ERROR: 'bg-destructive/10 text-destructive border-destructive/20',
    ALERT: 'bg-destructive/10 text-destructive border-destructive/20',
    CRITICAL: 'bg-destructive/20 text-destructive border-destructive/30',
    EMERGENCY: 'bg-destructive/20 text-destructive border-destructive/30',
} as const;

export const severityColors = {
    blocker: 'bg-destructive/20 text-destructive border-destructive/30',
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-secondary text-secondary-foreground border-border',
    low: 'bg-muted text-muted-foreground border-border',
} as const;

export function getLogLevelColor(level: string): string {
    const upperLevel = level.toUpperCase() as keyof typeof logLevelColors;
    return logLevelColors[upperLevel] || logLevelColors.INFO;
}

export function getSeverityColor(severity: string): string {
    const lowerSeverity = severity.toLowerCase() as keyof typeof severityColors;
    return severityColors[lowerSeverity] || severityColors.medium;
}

export const healthColors = {
    excellent: {
        text: 'text-primary',
        bg: 'bg-primary',
    },
    good: {
        text: 'text-secondary-foreground',
        bg: 'bg-secondary',
    },
    fair: {
        text: 'text-secondary-foreground',
        bg: 'bg-secondary',
    },
    attention: {
        text: 'text-destructive',
        bg: 'bg-destructive',
    },
} as const;

export function getHealthColor(score: number): { text: string; bg: string } {
    if (score >= 80) return healthColors.excellent;
    if (score >= 60) return healthColors.good;
    if (score >= 40) return healthColors.fair;
    return healthColors.attention;
}
