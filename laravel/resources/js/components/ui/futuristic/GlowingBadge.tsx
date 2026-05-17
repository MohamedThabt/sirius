import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const glowingBadgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-300",
    {
        variants: {
            variant: {
                default: "bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:shadow-sm",
                success: "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:shadow-sm hover:shadow-primary/20",
                warning: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 hover:shadow-sm",
                danger: "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 hover:shadow-sm hover:shadow-destructive/20",
                info: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 hover:shadow-sm",
                purple: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 hover:shadow-sm",
                cyan: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 hover:shadow-sm",
                pink: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 hover:shadow-sm",
                slate: "bg-muted text-muted-foreground border border-border hover:bg-muted/80 hover:shadow-sm",
            },
            size: {
                sm: "text-[10px] px-2 py-0.5",
                default: "text-xs px-2.5 py-0.5",
                lg: "text-sm px-3 py-1",
            },
            glow: {
                none: "",
                subtle: "shadow-sm",
                animated: "animate-pulse",
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            glow: "none",
        },
    }
);

interface GlowingBadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof glowingBadgeVariants> {
    icon?: React.ReactNode;
}

/**
 * GlowingBadge - Status badge with glow effects and smooth transitions
 * Supports multiple color variants and optional animated glow.
 */
export function GlowingBadge({
    className,
    variant,
    size,
    glow,
    icon,
    children,
    ...props
}: GlowingBadgeProps) {
    return (
        <span
            className={cn(glowingBadgeVariants({ variant, size, glow }), className)}
            {...props}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </span>
    );
}

export default GlowingBadge;
