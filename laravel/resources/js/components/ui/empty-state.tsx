import * as React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
    };
    variant?: 'default' | 'card' | 'dashed';
    className?: string;
}

/**
 * EmptyState - A reusable empty state component with consistent styling.
 * 
 * Used across pages to show when no data is available.
 * Follows the design-styling-standards with premium aesthetics.
 * 
 * Variants:
 * - 'default': Simple centered layout
 * - 'card': Wrapped in a subtle card background
 * - 'dashed': Dashed border container (for create/upload states)
 */
export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    variant = 'default',
    className,
}: EmptyStateProps) {
    const ActionIcon = action?.icon;

    const content = (
        <>
            <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/10">
                    <Icon className="h-10 w-10 text-primary" />
                </div>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-foreground">
                {title}
            </h3>
            <p className="mb-6 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                {description}
            </p>
            {action && (
                <Button
                    onClick={action.onClick}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                >
                    {ActionIcon && <ActionIcon className="h-4 w-4" />}
                    {action.label}
                </Button>
            )}
        </>
    );

    const baseClasses = 'flex flex-col items-center justify-center text-center py-12';

    if (variant === 'dashed') {
        return (
            <div
                className={cn(
                    'flex min-h-[400px] items-center justify-center animate-in fade-in zoom-in-95 duration-500',
                    className
                )}
            >
                <div className="max-w-md rounded-2xl border border-dashed border-border/50 bg-muted/20 p-12 backdrop-blur-sm">
                    {content}
                </div>
            </div>
        );
    }

    if (variant === 'card') {
        return (
            <div className={cn('rounded-lg border bg-card', className)}>
                <div className={baseClasses}>{content}</div>
            </div>
        );
    }

    return (
        <div className={cn(baseClasses, 'min-h-[200px]', className)}>
            {content}
        </div>
    );
}

export default EmptyState;
