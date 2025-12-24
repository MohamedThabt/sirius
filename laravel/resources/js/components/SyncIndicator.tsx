import { cn } from '@/lib/utils';

interface SyncIndicatorProps {
    isSynced?: boolean;
    size?: 'sm' | 'md';
    /** Position mode: 'absolute' for overlay on parent, 'inline' for flow */
    position?: 'absolute' | 'inline';
    className?: string;
}

/**
 * WHY: Extracted from Index.tsx and ModuleShow.tsx where this pattern was duplicated.
 * Shows an amber dot to indicate feature/ERD sync status.
 * 
 * Usage:
 * - Wrap parent in `relative` and use `position="absolute"` for overlay
 * - Use `position="inline"` for inline indicators
 */
export function SyncIndicator({
    isSynced,
    size = 'md',
    position = 'absolute',
    className,
}: SyncIndicatorProps) {
    // Only show when explicitly not synced
    if (isSynced !== false) return null;

    const sizeClasses = {
        sm: 'h-2 w-2',
        md: 'h-3 w-3',
    };

    const positionClasses = {
        absolute: '-top-2 -right-2 absolute',
        inline: '',
    };

    return (
        <div
            className={cn(
                'rounded-full bg-amber-500 ring-2 ring-background',
                sizeClasses[size],
                positionClasses[position],
                className
            )}
            title="Feature data models updated - ERD may need syncing"
            role="status"
            aria-label="Sync needed"
        />
    );
}
