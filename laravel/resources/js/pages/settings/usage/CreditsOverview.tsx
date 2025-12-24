import { type Credits, type UsagePlan } from '@/types';
import {
    SparklesIcon,
    ActivityIcon,
    ClockIcon,
    CreditCardIcon,
    AlertCircleIcon,
    CoinsIcon,
} from 'lucide-react';
import { formatNumber } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface CreditsOverviewProps {
    credits: Credits;
    plan: UsagePlan | null;
    purchaseDialogOpen: boolean;
    setPurchaseDialogOpen: (open: boolean) => void;
    onPurchase: () => void;
    processing: boolean;
}

/**
 * Credits overview section displaying remaining credits, usage stats, and plan info.
 * WHY: Extracted from usage.tsx to reduce component size and improve maintainability.
 */
export function CreditsOverview({
    credits,
    plan,
    purchaseDialogOpen,
    setPurchaseDialogOpen,
    onPurchase,
    processing,
}: CreditsOverviewProps) {
    const showUpsellBanner = credits.percentage_used >= 80 || credits.remaining <= 0;

    return (
        <div className="rounded-lg border border-border p-4">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">Credits Overview</h2>
                <p className="text-xs text-muted-foreground">Your current credit usage and plan details</p>
            </div>

            <div className="space-y-4">
                {/* Stats Grid */}
                <div className="grid gap-3 sm:grid-cols-3">
                    {/* Remaining Credits */}
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10">
                                <SparklesIcon className="h-3.5 w-3.5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Remaining</p>
                                <p className="text-lg font-bold text-foreground">{formatNumber(credits.remaining)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Used Credits */}
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                <ActivityIcon className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Used</p>
                                <p className="text-lg font-bold text-foreground">{formatNumber(credits.used)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reset Timer */}
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10">
                                <ClockIcon className="h-3.5 w-3.5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Resets In</p>
                                <p className="text-lg font-bold text-foreground">
                                    {credits.days_until_reset} <span className="text-sm font-normal text-muted-foreground">{credits.days_until_reset === 1 ? 'day' : 'days'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">Credit Usage</span>
                        <span className="font-semibold text-primary">{credits.percentage_used.toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(credits.percentage_used, 100)}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatNumber(credits.used)} used</span>
                        <span>{formatNumber(credits.total)} total</span>
                    </div>
                </div>

                {/* Plan Info */}
                {plan && (
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                <CreditCardIcon className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                                    <p className="text-xs text-muted-foreground">Current Plan</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-foreground">${plan.monthly_price}</p>
                                <p className="text-[10px] text-muted-foreground">per month</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upsell Banner */}
                {showUpsellBanner && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900/50 dark:bg-orange-950/30">
                        <div className="flex items-start gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-orange-500/10">
                                <AlertCircleIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-orange-900 dark:text-orange-100">
                                    {credits.remaining <= 0
                                        ? 'Credits exhausted'
                                        : 'Running low on credits'}
                                </p>
                                <p className="mt-1 text-sm text-orange-800 dark:text-orange-200">
                                    Buy 250 credits for $5 to continue using AI features
                                </p>
                                <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            className="mt-3 bg-orange-500 text-white hover:bg-orange-600"
                                        >
                                            <CoinsIcon className="mr-2 h-4 w-4" />
                                            Purchase Credits
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <CoinsIcon className="h-5 w-5 text-primary" />
                                                Purchase Credits
                                            </DialogTitle>
                                            <DialogDescription>
                                                Buy additional credits to continue using AI features.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 dark:border-primary/30 dark:bg-primary/10">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                                            <SparklesIcon className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-foreground">250 credits</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Perfect for occasional use
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-2xl font-bold text-primary">$5.00</p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={onPurchase}
                                                disabled={processing}
                                                className="w-full bg-primary hover:bg-primary/90"
                                            >
                                                {processing ? 'Processing...' : 'Purchase 250 Credits for $5'}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
