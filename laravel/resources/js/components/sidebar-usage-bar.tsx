import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Zap, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SidebarUsageBar() {
    const { userCredits } = usePage<SharedData>().props;

    if (!userCredits) return null;

    const { balance: rawBalance, total, used, daysUntilReset } = userCredits;
    
    // Ensure balance is never negative
    const balance = Math.max(0, rawBalance);
    
    // Calculate percentages locally - handle cases where balance > total (e.g., bonus credits)
    const effectiveTotal = Math.max(total, balance);
    const remainingPercentage = effectiveTotal > 0 ? Math.round((balance / effectiveTotal) * 100) : 0;
    const usedPercentage = 100 - remainingPercentage;
    
    const isLow = usedPercentage >= 80;
    const isCritical = usedPercentage >= 95;

    const handleClick = () => {
        router.visit('/settings/usage');
    };

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button 
                        onClick={handleClick}
                        className="group w-full cursor-pointer rounded-lg border border-border/40 bg-gradient-to-br from-card to-muted/20 p-3 text-left transition-all hover:border-primary/40 hover:shadow-md hover:scale-[1.02]"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                                    isCritical ? "bg-destructive/10 text-destructive" :
                                    isLow ? "bg-amber-500/10 text-amber-600" :
                                    "bg-primary/10 text-primary"
                                )}>
                                    <Zap className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-xs font-medium text-foreground">Credits</span>
                            </div>
                            <span className={cn(
                                "text-xs font-semibold transition-colors",
                                isCritical ? "text-destructive" :
                                isLow ? "text-amber-600" :
                                "text-emerald-600"
                            )}>
                                {balance.toLocaleString()} left
                            </span>
                        </div>
                        
                        <Progress 
                            value={remainingPercentage} 
                            className={cn(
                                "h-1.5 transition-all",
                                "group-hover:h-2"
                            )}
                            indicatorClassName={cn(
                                "transition-colors",
                                isCritical ? "bg-destructive" :
                                isLow ? "bg-amber-500" :
                                "bg-emerald-500"
                            )}
                        />
                        
                        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{balance.toLocaleString()} left</span>
                            <span className="text-primary/70 group-hover:text-primary transition-colors">View details →</span>
                        </div>
                    </button>
                </TooltipTrigger>
                <TooltipContent 
                    side="right" 
                    align="start"
                    className="w-64 border-border/50 bg-background/95 p-4 shadow-lg backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="space-y-3">
                        <div>
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Zap className="h-4 w-4 text-primary" />
                                Credit Usage
                            </h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Remaining:</span>
                                    <span className="font-semibold text-foreground">{balance.toLocaleString()} credits</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Used:</span>
                                    <span className="font-medium text-muted-foreground">{used.toLocaleString()} credits</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Total:</span>
                                    <span className="font-medium text-muted-foreground">{total.toLocaleString()} credits</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border/40 pt-3">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    <span>Usage Rate:</span>
                                </div>
                                <span className={cn(
                                    "font-semibold",
                                    isCritical ? "text-destructive" :
                                    isLow ? "text-amber-600" :
                                    "text-muted-foreground"
                                )}>
                                    {usedPercentage}%
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-border/40 pt-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                    Resets in <span className="font-semibold text-foreground">{daysUntilReset}</span> {daysUntilReset === 1 ? 'day' : 'days'}
                                </span>
                            </div>
                        </div>

                        {isLow && (
                            <div className={cn(
                                "rounded-md border p-2 text-xs",
                                isCritical 
                                    ? "border-destructive/30 bg-destructive/5 text-destructive" 
                                    : "border-amber-500/30 bg-amber-500/5 text-amber-600"
                            )}>
                                {isCritical 
                                    ? "⚠️ Credits almost depleted! Consider upgrading your plan." 
                                    : "⚡ Running low on credits. Monitor your usage."}
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
