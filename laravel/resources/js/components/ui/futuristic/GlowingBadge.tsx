import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const glowingBadgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-300",
    {
        variants: {
            variant: {
                default: "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:shadow-sm hover:shadow-primary/20",
                success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:shadow-sm hover:shadow-emerald-500/20",
                warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 hover:shadow-sm hover:shadow-amber-500/20",
                danger: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:shadow-sm hover:shadow-red-500/20",
                info: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:shadow-sm hover:shadow-blue-500/20",
                purple: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 hover:shadow-sm hover:shadow-purple-500/20",
                cyan: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 hover:shadow-sm hover:shadow-cyan-500/20",
                pink: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border border-pink-500/20 hover:bg-pink-500/20 hover:shadow-sm hover:shadow-pink-500/20",
                slate: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20 hover:bg-slate-500/20",
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
