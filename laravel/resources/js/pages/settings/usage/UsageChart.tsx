import { type GraphData } from '@/types';
import { formatNumber } from '@/lib/formatters';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { TrendingUpIcon, ActivityIcon, ZapIcon, AreaChartIcon, BarChart3Icon, LineChartIcon } from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Line,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ReferenceLine,
} from 'recharts';
import { useState, useMemo, useCallback } from 'react';

export type TimeRange = '7d' | '14d' | '30d' | 'all';
export type ChartType = 'area' | 'bar' | 'line';

interface UsageChartProps {
    graphData: GraphData[];
}

// WHY: Extracted to avoid recreating these constants on every render
const TIME_RANGE_OPTIONS = [
    { value: '7d' as TimeRange, label: '7D' },
    { value: '14d' as TimeRange, label: '14D' },
    { value: '30d' as TimeRange, label: '30D' },
    { value: 'all' as TimeRange, label: 'All' },
];

const CHART_TYPE_OPTIONS = [
    { value: 'area' as ChartType, icon: AreaChartIcon, label: 'Area' },
    { value: 'bar' as ChartType, icon: BarChart3Icon, label: 'Bar' },
    { value: 'line' as ChartType, icon: LineChartIcon, label: 'Line' },
];

const CHART_CONFIG = {
    credits: {
        label: 'Credits Used',
        color: 'hsl(217 91% 60%)', // Vibrant blue
    },
};

// WHY: Enhanced colors for better visual appeal
const CHART_COLORS = {
    primary: 'hsl(217 91% 60%)', // Vibrant blue
    primaryLight: 'hsl(217 91% 75%)', // Lighter for gradients
    gradient: {
        start: 'hsl(217 91% 60%)',
        end: 'hsl(262 83% 58%)', // Purple accent
    },
};

// WHY: Shared axis configuration reduces duplication across chart types
const AXIS_STYLE = {
    axisLine: false,
    tickLine: false,
    tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 },
};

// WHY: Format date for X-axis ticks
const formatXAxisDate = (value: string) => {
    const date = new Date(value);
    return `${date.getMonth() + 1}/${date.getDate()}`;
};

// WHY: Format Y-axis values with k suffix for thousands
const formatYAxisValue = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
};

/**
 * Usage analytics chart with time range and chart type selectors.
 * WHY: Extracted from usage.tsx to reduce 340 lines of duplicated chart code to ~200 lines.
 */
export function UsageChart({ graphData }: UsageChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [chartType, setChartType] = useState<ChartType>('area');

    // WHY: useCallback prevents function recreation on each render
    const handleTimeRangeChange = useCallback((value: TimeRange) => {
        setTimeRange(value);
    }, []);

    const handleChartTypeChange = useCallback((value: ChartType) => {
        setChartType(value);
    }, []);

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
        const peakItem = filteredGraphData.reduce(
            (max, item) => (item.credits > max.credits ? item : max),
            filteredGraphData[0]
        );

        return {
            total,
            average,
            peak: peakItem.credits,
            peakDate: peakItem.date,
        };
    }, [filteredGraphData]);

    // WHY: Shared tooltip content to avoid 3x duplication
    const renderTooltipContent = useCallback(
        ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
            if (active && payload && payload.length && label) {
                const date = new Date(label);
                const formattedDate = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                });
                const value = payload[0].value as number;
                return (
                    <div className="rounded-md border border-border bg-background p-3 shadow-md">
                        <p className="text-xs text-muted-foreground mb-2">{formattedDate}</p>
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                            <span className="text-base font-semibold text-foreground">
                                {formatNumber(value)}
                            </span>
                            <span className="text-xs text-muted-foreground">credits</span>
                        </div>
                    </div>
                );
            }
            return null;
        },
        []
    );

    // WHY: Shared grid and axis components to avoid duplication
    const renderGridAndAxes = () => (
        <>
            <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.gradient.start} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={CHART_COLORS.gradient.end} stopOpacity={0.05} />
                </linearGradient>
            </defs>
            <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted-foreground))"
                strokeOpacity={0.15}
                horizontal={true}
                vertical={true}
            />
            <XAxis
                dataKey="date"
                tickFormatter={formatXAxisDate}
                {...AXIS_STYLE}
                dy={10}
            />
            <YAxis
                {...AXIS_STYLE}
                tickFormatter={formatYAxisValue}
                width={45}
            />
            {chartStats.average > 0 && (
                <ReferenceLine
                    y={chartStats.average}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                />
            )}
        </>
    );

    const renderChart = () => {
        const margin = { top: 15, right: 15, left: 0, bottom: 0 };

        if (chartType === 'area') {
            return (
                <AreaChart data={filteredGraphData} margin={margin}>
                    {renderGridAndAxes()}
                    <ChartTooltip
                        cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                        content={renderTooltipContent}
                    />
                    <Area
                        type="monotone"
                        dataKey="credits"
                        stroke={CHART_COLORS.primary}
                        strokeWidth={2.5}
                        fill="url(#chartGradient)"
                        animationDuration={800}
                        dot={false}
                        activeDot={{ r: 5, fill: CHART_COLORS.primary, stroke: '#fff', strokeWidth: 2 }}
                    />
                </AreaChart>
            );
        }

        if (chartType === 'bar') {
            return (
                <BarChart data={filteredGraphData} margin={margin}>
                    {renderGridAndAxes()}
                    <ChartTooltip
                        cursor={{ fill: 'hsl(var(--muted))', fillOpacity: 0.5 }}
                        content={renderTooltipContent}
                    />
                    <Bar
                        dataKey="credits"
                        fill={CHART_COLORS.primary}
                        radius={[4, 4, 0, 0]}
                        animationDuration={800}
                    />
                </BarChart>
            );
        }

        return (
            <LineChart data={filteredGraphData} margin={margin}>
                {renderGridAndAxes()}
                <ChartTooltip
                    cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={renderTooltipContent}
                />
                <Line
                    type="monotone"
                    dataKey="credits"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2.5}
                    animationDuration={800}
                    dot={false}
                    activeDot={{ r: 5, fill: CHART_COLORS.primary, stroke: '#fff', strokeWidth: 2 }}
                />
            </LineChart>
        );
    };

    return (
        <div className="rounded-lg border border-border p-4">
            {/* Header with controls */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <TrendingUpIcon className="h-4 w-4 text-primary" />
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
                        {TIME_RANGE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleTimeRangeChange(option.value)}
                                aria-pressed={timeRange === option.value}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
                                    timeRange === option.value
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {/* Chart Type Selector */}
                    <div className="flex items-center rounded-lg border border-border/50 bg-muted/30 p-1">
                        {CHART_TYPE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleChartTypeChange(option.value)}
                                aria-label={option.label}
                                aria-pressed={chartType === option.value}
                                title={option.label}
                                className={`p-2 rounded-md transition-all duration-200 ${
                                    chartType === option.value
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                            >
                                <option.icon className="h-3.5 w-3.5" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <ChartContainer config={CHART_CONFIG} className="h-[260px] w-full">
                {renderChart()}
            </ChartContainer>



            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS.primary }} />
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
    );
}
