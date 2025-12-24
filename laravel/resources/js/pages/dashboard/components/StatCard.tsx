import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUpIcon } from 'lucide-react';
import React from 'react';

interface StatCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: React.ElementType;
    trend?: { value: number; label: string };
    className?: string;
    iconClassName?: string;
    iconBgClassName?: string;
}

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    className,
    iconClassName,
    iconBgClassName
}: StatCardProps) {
    return (
        <Card className={cn(
            "group relative overflow-hidden border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md hover:shadow-primary/5",
            className
        )}>
            {/* Subtle gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground/80">{title}</CardTitle>
                <div className={cn("rounded-xl p-2.5 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md", iconBgClassName || "bg-muted/50 group-hover:bg-muted/80")}>
                    <Icon className={cn("h-4 w-4", iconClassName || "text-muted-foreground")} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
                {trend && (
                    <p className="mt-1 flex items-center gap-1 text-xs">
                        <span className="inline-flex items-center gap-0.5 text-emerald-600/80 dark:text-emerald-400/80">
                            <TrendingUpIcon className="h-3 w-3" />
                            +{trend.value}
                        </span>
                        <span className="text-muted-foreground/70">{trend.label}</span>
                    </p>
                )}
                {subtitle && !trend && (
                    <p className="mt-1 text-xs text-muted-foreground/70">{subtitle}</p>
                )}
            </CardContent>
        </Card>
    );
}
