import { cn } from '@/lib/utils';
import * as React from 'react';

export type NodeStatus = 'initial' | 'loading' | 'success' | 'error';
export type LoadingVariant = 'border' | 'overlay';

interface NodeStatusIndicatorProps {
    status?: NodeStatus;
    variant?: LoadingVariant;
    children: React.ReactNode;
    className?: string;
}

export const NodeStatusIndicator = React.forwardRef<HTMLDivElement, NodeStatusIndicatorProps>(
    ({ status = 'initial', variant = 'border', children, className }, ref) => {
        const isLoading = status === 'loading';
        const isError = status === 'error';
        const isSuccess = status === 'success';

        return (
            <div ref={ref} className={cn('relative', className)}>
                {/* Border Loading Variant */}
                {isLoading && variant === 'border' && (
                    <div className="pointer-events-none absolute inset-0 rounded-lg">
                        <div className="absolute inset-0 animate-spin rounded-lg border-2 border-transparent border-t-primary" />
                    </div>
                )}

                {/* Overlay Loading Variant */}
                {isLoading && variant === 'overlay' && (
                    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
                    </div>
                )}

                {/* Error State Border */}
                {isError && (
                    <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-red-500 dark:border-red-400" />
                )}

                {/* Success State Border */}
                {isSuccess && (
                    <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-emerald-500 dark:border-emerald-400" />
                )}

                {children}
            </div>
        );
    }
);

NodeStatusIndicator.displayName = 'NodeStatusIndicator';

