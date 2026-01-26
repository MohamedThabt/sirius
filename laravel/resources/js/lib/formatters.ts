/**
 * Shared formatting utilities for the application.
 * WHY: Extracted from usage.tsx to avoid duplication and enable reuse.
 */

/**
 * Format a number with locale-aware separators (e.g., 1,234,567).
 */
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format a number as currency (e.g., $12.34).
 */
export const formatCurrency = (amount: number | null, currency = 'USD'): string => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format a date string as relative time (e.g., "5m ago", "2d ago").
 * Falls back to absolute date for older dates using user's browser locale.
 */
export const formatRelativeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
        return 'Just now';
    } else if (diffMins < 60) {
        return `${diffMins}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else if (diffDays < 7) {
        return `${diffDays}d ago`;
    } else {
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    }
};

/**
 * Format a snake_case action type as Title Case (e.g., "generate_prd" → "Generate Prd").
 */
export const formatActionType = (actionType: string): string => {
    return actionType
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
