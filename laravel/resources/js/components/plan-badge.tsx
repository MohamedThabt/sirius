import { cn } from '@/lib/utils';

interface PlanBadgeProps {
    plan: {
        id: number;
        name: string;
        price?: number | string;
        slug?: string;
    };
    className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
    const isPro = plan.name.toLowerCase() === 'pro';

    if (isPro) {
        return (
            <span
                className={cn(
                    'group relative mt-1 inline-flex items-center gap-1.5 overflow-hidden',
                    'rounded-full px-2.5 py-0.5',
                    'bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15',
                    'text-[10px] font-semibold tracking-[0.15em] uppercase',
                    'text-primary',
                    'ring-1 ring-primary/30',
                    'backdrop-blur-sm',
                    'transition-all duration-300',
                    'hover:shadow-[0_0_12px_rgba(100,149,237,0.25)] hover:ring-primary/50',
                    className,
                )}
            >
                {/* Subtle shimmer effect */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                {/* Sparkle icon */}
                <svg className="h-2.5 w-2.5 fill-current opacity-80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>

                <span className="relative">{plan.name}</span>
            </span>
        );
    }

    return (
        <span
            className={cn(
                'mt-1 inline-flex items-center justify-center rounded-full',
                'border border-muted-foreground/20 bg-muted/30',
                'px-2 py-0.5 text-[10px] font-medium text-muted-foreground',
                'transition-colors duration-200 hover:bg-muted/50',
                className,
            )}
        >
            {plan.name}
        </span>
    );
}
