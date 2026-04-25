import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type GraphData } from '@/types';
import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

interface UsageChartProps {
    graphData: GraphData[];
}

const chartConfig = {
    credits: {
        label: 'Credits',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

export function UsageChart({ graphData }: UsageChartProps) {
    const [timeRange, setTimeRange] = useState('30d');

    const filteredData = useMemo(() => {
        if (!graphData || graphData.length === 0) return [];

        return graphData.filter((item) => {
            const date = new Date(item.date);
            if (isNaN(date.getTime())) return true;

            const now = new Date();
            let daysToSubtract = 30;
            if (timeRange === '90d') {
                daysToSubtract = 90;
            } else if (timeRange === '7d') {
                daysToSubtract = 7;
            }
            const startDate = new Date(now);
            startDate.setDate(startDate.getDate() - daysToSubtract);
            return date >= startDate;
        });
    }, [graphData, timeRange]);

    return (
        <Card className="pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Usage Analytics</CardTitle>
                    <CardDescription>Track your credit consumption over time</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex" aria-label="Select a value">
                        <SelectValue placeholder="Last 30 days" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="90d" className="rounded-lg">
                            Last 3 months
                        </SelectItem>
                        <SelectItem value="30d" className="rounded-lg">
                            Last 30 days
                        </SelectItem>
                        <SelectItem value="7d" className="rounded-lg">
                            Last 7 days
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id="fillCredits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-credits)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-credits)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                if (isNaN(date.getTime())) return value;
                                return date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                });
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        const date = new Date(value);
                                        if (isNaN(date.getTime())) return value;
                                        return date.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        });
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area dataKey="credits" type="natural" fill="url(#fillCredits)" stroke="var(--color-credits)" />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
