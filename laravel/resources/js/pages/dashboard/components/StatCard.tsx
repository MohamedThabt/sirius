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

export function StatCard({ title, value, subtitle, icon: Icon, trend, className, iconClassName, iconBgClassName }: StatCardProps) {
    return (
        <Card
            className={cn(
                'group relative overflow-hidden border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md',
                className,
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={cn('rounded-lg p-2.5 transition-all duration-200 group-hover:scale-110', iconBgClassName || 'bg-muted')}>
                    <Icon className={cn('h-4.5 w-4.5', iconClassName || 'text-muted-foreground')} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                {trend && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs">
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 font-medium text-emerald-600">
                            <TrendingUpIcon className="h-3 w-3" />+{trend.value}
                        </span>
                        <span className="text-muted-foreground">{trend.label}</span>
                    </p>
                )}
                {subtitle && !trend && <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p>}
            </CardContent>
        </Card>
    );
}
