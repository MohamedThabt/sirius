import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
    /** Use 'large' for index/landing pages, 'default' for sub-pages */
    size?: 'default' | 'large';
    /** Enable entry animations */
    animated?: boolean;
}

/**
 * PageHeader - A standardized page header component.
 * 
 * Ensures consistent typography hierarchy across all pages:
 * - 'large' size: For main index pages (text-3xl → text-4xl on sm+)
 * - 'default' size: For sub-pages (text-2xl)
 * 
 * Follows design-styling-standards typography rules.
 */
export function PageHeader({
    title,
    description,
    action,
    className,
    size = 'default',
    animated = false,
}: PageHeaderProps) {
    return (
        <header
            className={cn(
                'mb-8',
                animated && 'animate-in fade-in slide-in-from-bottom-4 duration-700',
                className
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1
                        className={cn(
                            'font-bold tracking-tight text-foreground',
                            size === 'large'
                                ? 'text-3xl sm:text-4xl'
                                : 'text-2xl font-semibold'
                        )}
                    >
                        {title}
                    </h1>
                    {description && (
                        <p
                            className={cn(
                                'text-muted-foreground max-w-2xl',
                                size === 'large' ? 'text-base' : 'text-sm mt-1'
                            )}
                        >
                            {description}
                        </p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
        </header>
    );
}

export default PageHeader;
