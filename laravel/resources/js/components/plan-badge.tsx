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
                    'relative mt-1 inline-flex items-center gap-1 overflow-hidden rounded-md',
                    'bg-gradient-to-r from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-200',
                    'px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest',
                    'text-amber-400 dark:text-amber-600',
                    'ring-1 ring-zinc-700/50 dark:ring-zinc-300/50',
                    'transition-all duration-300 hover:ring-amber-400/50 dark:hover:ring-amber-500/50',
                    className
                )}
            >
                <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
                {plan.name}
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
