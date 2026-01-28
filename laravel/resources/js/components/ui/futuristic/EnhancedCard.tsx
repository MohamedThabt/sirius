import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: 'default' | 'glass' | 'gradient' | 'glow';
    hoverEffect?: boolean;
    glowColor?: 'blue' | 'purple' | 'cyan' | 'emerald' | 'amber' | 'pink';
}

const glowColorMap = {
    blue: 'hover:shadow-blue-500/20 hover:border-blue-500/30',
    purple: 'hover:shadow-purple-500/20 hover:border-purple-500/30',
    cyan: 'hover:shadow-cyan-500/20 hover:border-cyan-500/30',
    emerald: 'hover:shadow-emerald-500/20 hover:border-emerald-500/30',
    amber: 'hover:shadow-amber-500/20 hover:border-amber-500/30',
    pink: 'hover:shadow-pink-500/20 hover:border-pink-500/30',
};

/**
 * EnhancedCard - Glassmorphism card with professional hover effects
 * Features backdrop blur, gradient overlays, and animated glow effects.
 */
export const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
    ({ children, className, variant = 'default', hoverEffect = true, glowColor = 'blue', ...props }, ref) => {
        const baseStyles = "relative overflow-hidden rounded-xl border transition-all duration-300";
        
        const variantStyles = {
            default: "border-border/40 bg-card/80 shadow-sm backdrop-blur-sm",
            glass: "border-white/10 bg-white/5 shadow-lg backdrop-blur-md dark:border-white/5 dark:bg-black/20",
            gradient: "border-border/40 bg-gradient-to-br from-card/90 via-card/70 to-card/50 shadow-sm backdrop-blur-sm",
            glow: "border-border/40 bg-card/80 shadow-lg backdrop-blur-sm",
        };

        const hoverStyles = hoverEffect 
            ? `hover:shadow-lg hover:border-border/60 hover:-translate-y-0.5 ${glowColorMap[glowColor]}`
            : '';

        return (
            <div
                ref={ref}
                className={cn(
                    baseStyles,
                    variantStyles[variant],
                    hoverStyles,
                    "group",
                    className
                )}
                {...props}
            >
                {/* Gradient overlay on hover */}
                {hoverEffect && (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                )}
                
                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        );
    }
);

EnhancedCard.displayName = 'EnhancedCard';

// Enhanced Card sub-components for consistency
export const EnhancedCardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex flex-col space-y-1.5 p-5 pb-3", className)}
            {...props}
        />
    )
);
EnhancedCardHeader.displayName = 'EnhancedCardHeader';

export const EnhancedCardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn("text-sm font-semibold leading-none tracking-tight text-foreground/90", className)}
            {...props}
        />
    )
);
EnhancedCardTitle.displayName = 'EnhancedCardTitle';

export const EnhancedCardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
    )
);
EnhancedCardContent.displayName = 'EnhancedCardContent';

export default EnhancedCard;
