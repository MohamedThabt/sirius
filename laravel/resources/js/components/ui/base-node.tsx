import { cn } from '@/lib/utils';
import * as React from 'react';

const BaseNode = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'rounded-lg border-2 border-border bg-background shadow-md transition-all',
            'hover:shadow-lg',
            className
        )}
        {...props}
    />
));
BaseNode.displayName = 'BaseNode';

const BaseNodeHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex items-center gap-2 border-b border-border/50 bg-muted/30 px-3 py-2',
            className
        )}
        {...props}
    />
));
BaseNodeHeader.displayName = 'BaseNodeHeader';

const BaseNodeHeaderTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-sm font-semibold leading-none tracking-tight text-foreground', className)}
            {...props}
        />
    )
);
BaseNodeHeaderTitle.displayName = 'BaseNodeHeaderTitle';

const BaseNodeContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-3 text-sm', className)} {...props} />
));
BaseNodeContent.displayName = 'BaseNodeContent';

const BaseNodeFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex items-center gap-2 border-t border-border/50 bg-muted/20 px-3 py-2',
            className
        )}
        {...props}
    />
));
BaseNodeFooter.displayName = 'BaseNodeFooter';

export { BaseNode, BaseNodeContent, BaseNodeFooter, BaseNodeHeader, BaseNodeHeaderTitle };

