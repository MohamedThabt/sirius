/**
 * Semantic Color System
 * 
 * Centralized semantic color definitions for consistent theming across the application.
 * Uses theme-based colors with semantic color enhancements for UX clarity.
 * All components should import colors from this file to maintain consistency.
 */

/**
 * Semantic color classes for common UI patterns
 */
export const semanticColors = {
    // Success states (green)
    success: {
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950',
        border: 'border-emerald-200 dark:border-emerald-500/30',
        hover: 'hover:bg-emerald-500/20',
        icon: 'text-emerald-600 dark:text-emerald-400',
    },
    
    // Error/Destructive states (red)
    error: {
        badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950',
        border: 'border-red-200 dark:border-red-500/30',
        hover: 'hover:bg-red-500/20',
        icon: 'text-red-600 dark:text-red-400',
    },
    
    // Warning states (yellow/amber)
    warning: {
        badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950',
        border: 'border-amber-200 dark:border-amber-500/30',
        hover: 'hover:bg-amber-500/20',
        icon: 'text-amber-600 dark:text-amber-400',
    },
    
    // Info states (blue)
    info: {
        badge: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
        text: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950',
        border: 'border-blue-200 dark:border-blue-500/30',
        hover: 'hover:bg-blue-500/20',
        icon: 'text-blue-600 dark:text-blue-400',
    },
    
    // Neutral states (slate/gray)
    neutral: {
        badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30',
        text: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-950',
        border: 'border-slate-200 dark:border-slate-500/30',
        hover: 'hover:bg-slate-500/20',
        icon: 'text-slate-600 dark:text-slate-400',
    },
    
    // Purple states
    purple: {
        badge: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30',
        text: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-950',
        border: 'border-purple-200 dark:border-purple-500/30',
        hover: 'hover:bg-purple-500/20',
        icon: 'text-purple-600 dark:text-purple-400',
    },
    
    // Orange states
    orange: {
        badge: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30',
        text: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-950',
        border: 'border-orange-200 dark:border-orange-500/30',
        hover: 'hover:bg-orange-500/20',
        icon: 'text-orange-600 dark:text-orange-400',
    },
} as const;

/**
 * Log level colors for consistent log display
 */
export const logLevelColors = {
    DEBUG: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    INFO: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    NOTICE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    WARNING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    ERROR: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    ALERT: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    CRITICAL: 'bg-red-600/10 text-red-700 dark:text-red-300 border-red-600/20',
    EMERGENCY: 'bg-red-600/10 text-red-700 dark:text-red-300 border-red-600/20',
} as const;

/**
 * Severity colors for issues
 */
export const severityColors = {
    blocker: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    medium: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    low: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
} as const;

/**
 * Get semantic color for log levels
 */
export function getLogLevelColor(level: string): string {
    const upperLevel = level.toUpperCase() as keyof typeof logLevelColors;
    return logLevelColors[upperLevel] || logLevelColors.INFO;
}

/**
 * Get semantic color for severity levels
 */
export function getSeverityColor(severity: string): string {
    const lowerSeverity = severity.toLowerCase() as keyof typeof severityColors;
    return severityColors[lowerSeverity] || severityColors.medium;
}

/**
 * Health indicator colors for progress displays
 */
export const healthColors = {
    excellent: {
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500',
    },
    good: {
        text: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-500',
    },
    fair: {
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500',
    },
    attention: {
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-500',
    },
} as const;

/**
 * Get health color based on score (0-100)
 */
export function getHealthColor(score: number): { text: string; bg: string } {
    if (score >= 80) return healthColors.excellent;
    if (score >= 60) return healthColors.good;
    if (score >= 40) return healthColors.fair;
    return healthColors.attention;
}
