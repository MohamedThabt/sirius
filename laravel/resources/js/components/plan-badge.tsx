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
                    'relative mt-1 inline-flex items-center justify-center overflow-hidden rounded-full border border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg',
                    'bg-[length:200%_100%] animate-shimmer',
                    className
                )}
            >
                <span className="relative z-10 flex items-center gap-1">
                    <span className="relative inline-block">
                        ✨
                        <span className="absolute inset-0 animate-ping opacity-75">✨</span>
                    </span>
                    {plan.name}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine pointer-events-none" />
            </span>
        );
    }

    return (
        <span
            className={cn(
                'mt-1 inline-flex items-center justify-center rounded-full border border-muted-foreground/30 bg-transparent px-2 py-0.5 text-[10px] font-medium text-muted-foreground',
                className
            )}
        >
            {plan.name}
        </span>
    );
}
