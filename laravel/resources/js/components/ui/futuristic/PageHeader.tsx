import { cn } from '@/lib/utils';
import { CalendarIcon, SparklesIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface QuickStat {
    label: string;
    value: string | number;
    highlight?: boolean;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    greeting?: string;
    icon?: React.ElementType;
    iconClassName?: string;
    showDate?: boolean;
    quickStats?: QuickStat[];
    actions?: React.ReactNode;
    className?: string;
}

/**
 * PageHeader - Consistent futuristic page header with gradient styling
 * Features gradient text, animated icons, and optional quick stats.
 */
export function PageHeader({
    title,
    subtitle,
    greeting,
    icon: Icon,
    iconClassName,
    showDate = true,
    quickStats,
    actions,
    className,
}: PageHeaderProps) {
    const today = new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date());

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/80 to-card/40 p-6 shadow-sm",
            className
        )}>
            {/* Background decorative elements */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl" />
            
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    {/* Greeting with icon */}
                    {greeting && (
                        <div className="flex items-center gap-2">
                            {Icon ? (
                                <Icon className={cn("h-5 w-5", iconClassName || "text-amber-500")} />
                            ) : (
                                <SparklesIcon className="h-5 w-5 text-amber-500" />
                            )}
                            <span className="text-sm font-medium text-muted-foreground">{greeting}</span>
                        </div>
                    )}
                    
                    {/* Title with gradient */}
                    <h1 className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                        {title}
                    </h1>
                    
                    {/* Subtitle or date */}
                    {(subtitle || showDate) && (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground/60">
                            {showDate && <CalendarIcon className="h-3.5 w-3.5" />}
                            {subtitle || today}
                        </p>
                    )}
                </div>
                
                {/* Quick stats or actions */}
                <div className="flex items-center gap-3">
                    {quickStats && quickStats.length > 0 && (
                        <div className="hidden rounded-xl border border-border/40 bg-muted/30 px-4 py-2.5 backdrop-blur-sm sm:block">
                            <div className="flex items-center gap-6 text-sm">
                                {quickStats.map((stat, index) => (
                                    <div key={stat.label} className="flex items-center gap-4">
                                        {index > 0 && <Separator orientation="vertical" className="h-8" />}
                                        <div className="text-center">
                                            <div className={cn(
                                                "text-lg font-bold",
                                                stat.highlight 
                                                    ? "text-emerald-600 dark:text-emerald-400" 
                                                    : "text-foreground"
                                            )}>
                                                {stat.highlight && typeof stat.value === 'number' && '+'}
                                                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PageHeader;
