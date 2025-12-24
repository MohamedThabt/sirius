import * as React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    icon: LucideIcon;
    title: string;
    value: string | number;
    subtitle?: string;
    colorTheme?: 'blue' | 'emerald' | 'orange' | 'violet' | 'primary';
    className?: string;
}

const colorThemes = {
    blue: {
        iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
        iconShadow: 'shadow-blue-500/25',
        glow: 'bg-blue-500/5 group-hover:bg-blue-500/10',
    },
    emerald: {
        iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        iconShadow: 'shadow-emerald-500/25',
        glow: 'bg-emerald-500/5 group-hover:bg-emerald-500/10',
    },
    orange: {
        iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
        iconShadow: 'shadow-orange-500/25',
        glow: 'bg-orange-500/5 group-hover:bg-orange-500/10',
    },
    violet: {
        iconBg: 'bg-gradient-to-br from-violet-500 to-violet-600',
        iconShadow: 'shadow-violet-500/25',
        glow: 'bg-violet-500/5 group-hover:bg-violet-500/10',
    },
    primary: {
        iconBg: 'bg-gradient-to-br from-primary to-primary/90',
        iconShadow: 'shadow-primary/25',
        glow: 'bg-primary/5 group-hover:bg-primary/10',
    },
};

/**
 * StatCard - A reusable statistics card component with consistent styling.
 * 
 * Used in dashboard and project index pages to display key metrics.
 * Follows the design-styling-standards with premium gradient effects and hover animations.
 */
export function StatCard({
    icon: Icon,
    title,
    value,
    subtitle,
    colorTheme = 'primary',
    className,
}: StatCardProps) {
    const theme = colorThemes[colorTheme];

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-border/50',
                className
            )}
        >
            {/* Decorative glow effect */}
            <div
                className={cn(
                    'absolute top-0 right-0 h-24 w-24 rounded-full blur-2xl transition-all duration-300',
                    theme.glow
                )}
            />
            <div className="relative">
                <div className="mb-3 flex items-center gap-3">
                    <div
                        className={cn(
                            'rounded-lg p-2.5 shadow-lg',
                            theme.iconBg,
                            theme.iconShadow
                        )}
                    >
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                        {title}
                    </span>
                </div>
                <div className="mb-1 text-3xl font-bold text-foreground">
                    {value}
                </div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

export default StatCard;
