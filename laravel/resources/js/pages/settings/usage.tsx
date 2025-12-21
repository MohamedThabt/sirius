import { Head, router, useForm } from '@inertiajs/react';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ActivityIcon, AlertCircleIcon, CoinsIcon, ClockIcon, SparklesIcon, CreditCardIcon, TrendingUpIcon, BarChart3Icon, LineChartIcon, AreaChartIcon, ZapIcon, CalendarIcon } from 'lucide-react';
import SettingsLayout from '@/layouts/settings/layout';
import { Area, AreaChart, Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts';
import { useState, useMemo } from 'react';

// @ts-ignore - route helper is available globally via Ziggy
declare function route(name: string, params?: any): string;

interface Credits {
    total: number;
    remaining: number;
    used: number;
    percentage_used: number;
    days_until_reset: number;
}

interface Plan {
    name: string;
    monthly_price: number;
}

interface GraphData {
    date: string;
    credits: number;
}

interface UsageLog {
    id: number;
    action_type: string;
    model: string | null;
    credits_used: number;
    cost: number | null;
    created_at: string;
}

interface PaginatedUsageLogs {
    data: UsageLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    credits: Credits;
    plan: Plan | null;
    graphData: GraphData[];
    usageLogs: PaginatedUsageLogs;
    totalConsumedCredits: number;
}

type TimeRange = '7d' | '14d' | '30d' | 'all';
type ChartType = 'area' | 'bar' | 'line';

function Usage({ credits, plan, graphData, usageLogs, totalConsumedCredits }: Props) {
    useFlashToasts();
    const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [chartType, setChartType] = useState<ChartType>('area');

    const { post, processing } = useForm({
        credits_package: '250',
    });

    // Filter graph data based on selected time range
    const filteredGraphData = useMemo(() => {
        if (timeRange === 'all') return graphData;
        
        const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return graphData.filter((item) => new Date(item.date) >= cutoffDate);
    }, [graphData, timeRange]);

    // Calculate chart statistics
    const chartStats = useMemo(() => {
        if (filteredGraphData.length === 0) {
            return { total: 0, average: 0, peak: 0, peakDate: '' };
        }

        const total = filteredGraphData.reduce((sum, item) => sum + item.credits, 0);
        const average = Math.round(total / filteredGraphData.length);
        const peakItem = filteredGraphData.reduce((max, item) => 
            item.credits > max.credits ? item : max, filteredGraphData[0]
        );

        return {
            total,
            average,
            peak: peakItem.credits,
            peakDate: peakItem.date,
        };
    }, [filteredGraphData]);

    const handlePurchase = () => {
        post(route('usage.purchase'), {
            preserveScroll: true,
            onSuccess: () => {
                setPurchaseDialogOpen(false);
            },
        });
    };

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const formatCurrency = (amount: number | null): string => {
        if (amount === null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
            });
        }
    };

    const formatActionType = (actionType: string): string => {
        return actionType
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const showUpsellBanner = credits.percentage_used >= 80 || credits.remaining <= 0;

    const chartConfig = {
        credits: {
            label: 'Credits Used',
            color: 'hsl(var(--chart-1))',
        },
    };

    return (
        <>
            <Head title="Usage & Credits" />

            <header className="mb-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">Usage & Credits</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">Monitor your AI usage and credit consumption</p>
                </div>
            </header>

            <div className="space-y-4">
                {/* Credits Overview Card */}
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
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-500/10">
                                        <ActivityIcon className="h-3.5 w-3.5 text-violet-500" />
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
                                <span className="font-semibold text-violet-500">{credits.percentage_used.toFixed(1)}%</span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-violet-500 transition-all duration-500 ease-out"
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
                                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-500/10">
                                            <CreditCardIcon className="h-3.5 w-3.5 text-violet-500" />
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
                                                        <CoinsIcon className="h-5 w-5 text-violet-500" />
                                                        Purchase Credits
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Buy additional credits to continue using AI features.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900/50 dark:bg-violet-950/30">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500">
                                                                    <SparklesIcon className="h-5 w-5 text-white" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-foreground">250 credits</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Perfect for occasional use
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <p className="text-2xl font-bold text-violet-500">$5.00</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={handlePurchase}
                                                        disabled={processing}
                                                        className="w-full bg-violet-500 hover:bg-violet-600"
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

                {/* Usage Graph */}
                <div className="rounded-lg border border-border p-4">
                    <div>
                        {/* Header with controls */}
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <TrendingUpIcon className="h-4 w-4 text-violet-500" />
                                    Usage Analytics
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Track your credit consumption over time
                                </p>
                            </div>
                            
                            {/* Controls */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Time Range Selector */}
                                <div className="flex items-center rounded-lg border border-border/50 bg-muted/30 p-1">
                                    {[
                                        { value: '7d', label: '7D' },
                                        { value: '14d', label: '14D' },
                                        { value: '30d', label: '30D' },
                                        { value: 'all', label: 'All' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setTimeRange(option.value as TimeRange)}
                                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
                                                timeRange === option.value
                                                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Chart Type Selector */}
                                <div className="flex items-center rounded-lg border border-border/50 bg-muted/30 p-1">
                                    {[
                                        { value: 'area', icon: AreaChartIcon, label: 'Area' },
                                        { value: 'bar', icon: BarChart3Icon, label: 'Bar' },
                                        { value: 'line', icon: LineChartIcon, label: 'Line' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setChartType(option.value as ChartType)}
                                            className={`p-2 rounded-md transition-all duration-200 ${
                                                chartType === option.value
                                                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                            }`}
                                            title={option.label}
                                        >
                                            <option.icon className="h-3.5 w-3.5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <ChartContainer config={chartConfig} className="h-[260px] w-full">
                            {chartType === 'area' ? (
                                <AreaChart data={filteredGraphData} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke="hsl(var(--muted-foreground))" 
                                        strokeOpacity={0.1}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                        tickFormatter={(value) => {
                                            if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                                            return value.toString();
                                        }}
                                        width={45}
                                    />
                                    {chartStats.average > 0 && (
                                        <ReferenceLine 
                                            y={chartStats.average} 
                                            stroke="hsl(var(--muted-foreground))" 
                                            strokeDasharray="4 4" 
                                            strokeOpacity={0.4}
                                        />
                                    )}
                                    <ChartTooltip
                                        cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const date = new Date(label);
                                                const formattedDate = date.toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                });
                                                const value = payload[0].value as number;
                                                return (
                                                    <div className="rounded-md border border-border bg-background p-3 shadow-md">
                                                        <p className="text-xs text-muted-foreground mb-2">{formattedDate}</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                                                            <span className="text-base font-semibold text-foreground">
                                                                {formatNumber(value)}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">credits</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="credits"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="#8b5cf6"
                                        fillOpacity={0.1}
                                        animationDuration={800}
                                        dot={false}
                                        activeDot={{ 
                                            r: 4, 
                                            fill: '#8b5cf6', 
                                            stroke: '#fff', 
                                            strokeWidth: 2
                                        }}
                                    />
                                </AreaChart>
                            ) : chartType === 'bar' ? (
                                <BarChart data={filteredGraphData} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke="hsl(var(--muted-foreground))" 
                                        strokeOpacity={0.1}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                        tickFormatter={(value) => {
                                            if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                                            return value.toString();
                                        }}
                                        width={45}
                                    />
                                    {chartStats.average > 0 && (
                                        <ReferenceLine 
                                            y={chartStats.average} 
                                            stroke="hsl(var(--muted-foreground))" 
                                            strokeDasharray="4 4" 
                                            strokeOpacity={0.4}
                                        />
                                    )}
                                    <ChartTooltip
                                        cursor={{ fill: 'hsl(var(--muted))', fillOpacity: 0.5 }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const date = new Date(label);
                                                const formattedDate = date.toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                });
                                                const value = payload[0].value as number;
                                                return (
                                                    <div className="rounded-md border border-border bg-background p-3 shadow-md">
                                                        <p className="text-xs text-muted-foreground mb-2">{formattedDate}</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2.5 w-2.5 rounded-sm bg-violet-500" />
                                                            <span className="text-base font-semibold text-foreground">
                                                                {formatNumber(value)}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">credits</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar
                                        dataKey="credits"
                                        fill="#8b5cf6"
                                        radius={[3, 3, 0, 0]}
                                        animationDuration={800}
                                    />
                                </BarChart>
                            ) : (
                                <LineChart data={filteredGraphData} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke="hsl(var(--muted-foreground))" 
                                        strokeOpacity={0.1}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                        tickFormatter={(value) => {
                                            if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                                            return value.toString();
                                        }}
                                        width={45}
                                    />
                                    {chartStats.average > 0 && (
                                        <ReferenceLine 
                                            y={chartStats.average} 
                                            stroke="hsl(var(--muted-foreground))" 
                                            strokeDasharray="4 4" 
                                            strokeOpacity={0.4}
                                        />
                                    )}
                                    <ChartTooltip
                                        cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const date = new Date(label);
                                                const formattedDate = date.toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                });
                                                const value = payload[0].value as number;
                                                return (
                                                    <div className="rounded-md border border-border bg-background p-3 shadow-md">
                                                        <p className="text-xs text-muted-foreground mb-2">{formattedDate}</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                                                            <span className="text-base font-semibold text-foreground">
                                                                {formatNumber(value)}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">credits</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="credits"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        animationDuration={800}
                                        dot={false}
                                        activeDot={{ 
                                            r: 4, 
                                            fill: '#8b5cf6', 
                                            stroke: '#fff', 
                                            strokeWidth: 2
                                        }}
                                    />
                                </LineChart>
                            )}
                        </ChartContainer>

                        {/* Stats Summary */}
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-lg border border-border bg-muted/30 p-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-500/10">
                                        <TrendingUpIcon className="h-4 w-4 text-violet-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total Usage</p>
                                        <p className="text-lg font-semibold text-foreground">{formatNumber(chartStats.total)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-muted/30 p-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10">
                                        <ActivityIcon className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Daily Average</p>
                                        <p className="text-lg font-semibold text-foreground">{formatNumber(chartStats.average)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-muted/30 p-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10">
                                        <ZapIcon className="h-4 w-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Peak Usage</p>
                                        <p className="text-lg font-semibold text-foreground">{formatNumber(chartStats.peak)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                                <span>Credits Used</span>
                            </div>
                            {chartStats.average > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <div className="h-0 w-3 border-t border-dashed border-muted-foreground" />
                                    <span>Avg ({formatNumber(chartStats.average)})</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Usage Logs Table */}
                <div className="rounded-lg border border-border p-4">
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-foreground">Usage Logs</h2>
                        <p className="text-xs text-muted-foreground">Detailed log of all AI operations</p>
                    </div>

                    <div>
                        {usageLogs.data.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">No usage logs found</p>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-md border border-border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Action
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium text-muted-foreground w-32">
                                                    Credits
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium text-muted-foreground w-40">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {usageLogs.data.map((log) => (
                                                <tr key={log.id} className="hover:bg-muted/30">
                                                    <td className="px-4 py-3 text-foreground">
                                                        {formatActionType(log.action_type)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">
                                                        {log.credits_used < 0 ? (
                                                            <span className="text-emerald-600">
                                                                +{formatNumber(Math.abs(log.credits_used))}
                                                            </span>
                                                        ) : (
                                                            <span className="text-foreground">{formatNumber(log.credits_used)}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-muted-foreground">
                                                        {formatDate(log.created_at)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {usageLogs.last_page > 1 && (
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Showing {usageLogs.data.length} of {usageLogs.total} logs
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={usageLogs.current_page === 1}
                                                onClick={() =>
                                                    router.get(route('usage.index'), {
                                                        page: usageLogs.current_page - 1,
                                                    })
                                                }
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={usageLogs.current_page === usageLogs.last_page}
                                                onClick={() =>
                                                    router.get(route('usage.index'), {
                                                        page: usageLogs.current_page + 1,
                                                    })
                                                }
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Total Consumed Credits */}
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-foreground">
                                            Total Consumed Credits
                                        </span>
                                        <span className="text-lg font-semibold text-foreground">
                                            {formatNumber(totalConsumedCredits)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Usage.layout = (page: React.ReactNode) => <SettingsLayout>{page}</SettingsLayout>;

export default Usage;

