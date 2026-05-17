import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Calendar, TrendingUp, Zap } from 'lucide-react';

export function SidebarUsageBar() {
    const { userCredits } = usePage<SharedData>().props;

    if (!userCredits) return null;

    const { balance: rawBalance, total, used, daysUntilReset } = userCredits;
    const balance = Math.max(0, rawBalance);
    const effectiveTotal = Math.max(total, balance);
    const remainingPercentage = effectiveTotal > 0 ? Math.round((balance / effectiveTotal) * 100) : 0;
    const usedPercentage = 100 - remainingPercentage;

    const isLow = usedPercentage >= 80;
    const isCritical = usedPercentage >= 95;

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={() => router.visit('/settings/usage')}
                        className="group w-full cursor-pointer rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent"
                    >
                        <div className="mb-1.5 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Zap
                                    className={cn(
                                        'h-3.5 w-3.5',
                                        isCritical ? 'text-destructive' : isLow ? 'text-amber-500' : 'text-muted-foreground',
                                    )}
                                />
                                <span className="text-[11px] text-muted-foreground">Credits</span>
                            </div>
                            <span
                                className={cn(
                                    'text-[11px] font-medium',
                                    isCritical ? 'text-destructive' : isLow ? 'text-amber-600' : 'text-foreground',
                                )}
                            >
                                {balance.toLocaleString()}
                            </span>
                        </div>

                        <Progress
                            value={remainingPercentage}
                            className="h-1"
                            indicatorClassName={cn(
                                isCritical ? 'bg-destructive' : isLow ? 'bg-amber-500' : 'bg-foreground/50',
                            )}
                        />
                    </button>
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    align="center"
                    className="w-56 border-border/50 bg-popover p-3 shadow-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <Zap className="h-3.5 w-3.5 text-primary" />
                            Credit Usage
                        </div>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Remaining</span>
                                <span className="font-medium text-foreground">{balance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Used</span>
                                <span className="text-muted-foreground">{used.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total</span>
                                <span className="text-muted-foreground">{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="border-t border-border/40 pt-2">
                            <div className="flex justify-between text-xs">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                    <TrendingUp className="h-3 w-3" />
                                    Usage
                                </span>
                                <span
                                    className={cn(
                                        'font-medium',
                                        isCritical ? 'text-destructive' : isLow ? 'text-amber-600' : 'text-muted-foreground',
                                    )}
                                >
                                    {usedPercentage}%
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-border/40 pt-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                Resets in <span className="font-medium text-foreground">{daysUntilReset}</span>{' '}
                                {daysUntilReset === 1 ? 'day' : 'days'}
                            </div>
                        </div>

                        {isLow && (
                            <div
                                className={cn(
                                    'rounded-md border px-2 py-1.5 text-[11px]',
                                    isCritical
                                        ? 'border-destructive/30 bg-destructive/5 text-destructive'
                                        : 'border-amber-500/30 bg-amber-500/5 text-amber-600',
                                )}
                            >
                                {isCritical ? 'Credits almost depleted.' : 'Running low on credits.'}
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
