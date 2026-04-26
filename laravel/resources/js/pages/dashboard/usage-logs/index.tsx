import { PaginationControls } from '@/components/PaginationControls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ActivityIcon, CalendarIcon, CoinsIcon, CpuIcon, DollarSignIcon, ZapIcon } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface UsageLog {
    id: number;
    user_id: number;
    action_type: string;
    model: string | null;
    input_tokens: number;
    output_tokens: number;
    credits_used: number;
    cost: string | null;
    created_at: string;
    user: User;
}

interface ActionTypeOption {
    value: string;
    label: string;
}

interface ModelOption {
    value: string;
    label: string;
}

interface Summary {
    total_logs: number;
    total_credits: number;
    total_tokens: number;
    total_cost: string;
    today_credits: number;
    this_week_credits: number;
    this_month_credits: number;
}

interface Props {
    logs: {
        data: UsageLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    actionTypes: ActionTypeOption[];
    models: ModelOption[];
    filters: {
        search?: string;
        action_type?: string;
        model?: string;
        date_from?: string;
        date_to?: string;
        user_id?: string;
        per_page?: number;
    };
    summary: Summary;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Usage Logs',
        href: '/admin/usage-logs',
    },
];

export default function UsageLogsIndex({ logs, actionTypes, models, filters, summary }: Props) {
    useFlashToasts();
    const [search, setSearch] = useState(filters.search || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const applyFilters = (newFilters: Partial<typeof filters> = {}) => {
        const filterData: Record<string, string> = {};

        const searchValue = newFilters.search !== undefined ? newFilters.search : search;
        const actionTypeValue = newFilters.action_type !== undefined ? newFilters.action_type : filters.action_type || 'all';
        const modelValue = newFilters.model !== undefined ? newFilters.model : filters.model || 'all';
        const dateFromValue = newFilters.date_from !== undefined ? newFilters.date_from : dateFrom;
        const dateToValue = newFilters.date_to !== undefined ? newFilters.date_to : dateTo;

        if (searchValue) filterData.search = searchValue;
        if (actionTypeValue && actionTypeValue !== 'all') filterData.action_type = actionTypeValue;
        if (modelValue && modelValue !== 'all') filterData.model = modelValue;
        if (dateFromValue) filterData.date_from = dateFromValue;
        if (dateToValue) filterData.date_to = dateToValue;
        if (filters.user_id) filterData.user_id = filters.user_id;

        router.get('/admin/usage-logs', filterData, { preserveState: true });
    };

    const handleActionTypeChange = (newActionType: string) => {
        applyFilters({ action_type: newActionType });
    };

    const handleModelChange = (newModel: string) => {
        applyFilters({ model: newModel });
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyFilters({ search });
        }
    };

    const handleDateChange = () => {
        applyFilters({ date_from: dateFrom, date_to: dateTo });
    };

    const clearFilters = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/usage-logs');
    };

    const formatActionType = (actionType: string) => {
        return actionType
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getActionTypeColor = (actionType: string) => {
        if (actionType.includes('generation')) {
            return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
        }
        if (actionType.includes('edit')) {
            return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
        }
        if (actionType.includes('sync')) {
            return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
        }
        if (actionType.includes('enrichment') || actionType.includes('suggestion')) {
            return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
        }
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
    };

    const hasFilters = search || filters.action_type || filters.model || dateFrom || dateTo;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usage Logs" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold">Usage Logs</h1>
                    <Badge variant="outline">{summary?.total_logs || logs.total || 0} Total Logs</Badge>
                </div>

                {/* Summary Stats */}
                {summary && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                                <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total_logs.toLocaleString()}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                                <CoinsIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total_credits.toLocaleString()}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                                <CpuIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total_tokens.toLocaleString()}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                                <DollarSignIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${summary.total_cost}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Today</CardTitle>
                                <ZapIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.today_credits.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">credits</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                                <CalendarIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.this_week_credits.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">credits</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                                <CalendarIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.this_month_credits.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">credits</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <Input
                        type="text"
                        placeholder="Search by user... (Press Enter)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="max-w-sm"
                    />

                    <Select value={filters.action_type || 'all'} onValueChange={handleActionTypeChange}>
                        <SelectTrigger className="w-52">
                            <SelectValue placeholder="Filter by action type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Action Types</SelectItem>
                            {actionTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.model || 'all'} onValueChange={handleModelChange}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Models</SelectItem>
                            {models.map((model) => (
                                <SelectItem key={model.value} value={model.value}>
                                    {model.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        type="date"
                        placeholder="From date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        onBlur={handleDateChange}
                        className="w-40"
                    />

                    <Input
                        type="date"
                        placeholder="To date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        onBlur={handleDateChange}
                        className="w-40"
                    />

                    {hasFilters && (
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Action Type</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead className="text-right">Input Tokens</TableHead>
                                <TableHead className="text-right">Output Tokens</TableHead>
                                <TableHead className="text-right">Credits</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.map((log) => (
                                <TableRow
                                    key={log.id}
                                    className="cursor-pointer transition-colors hover:bg-muted/50"
                                    onClick={() => router.visit(`/admin/usage-logs/${log.id}`)}
                                >
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{log.user?.name || 'Unknown'}</p>
                                            <p className="text-sm text-muted-foreground">{log.user?.email || '-'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getActionTypeColor(log.action_type)}>
                                            {formatActionType(log.action_type)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {log.model ? <Badge variant="outline">{log.model}</Badge> : <span className="text-muted-foreground">-</span>}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{log.input_tokens.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-mono">{log.output_tokens.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-mono font-medium">{log.credits_used.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-mono">{log.cost ? `$${parseFloat(log.cost).toFixed(4)}` : '-'}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{new Date(log.created_at).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {logs.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <ActivityIcon className="mb-3 h-12 w-12 text-muted-foreground/20" />
                        <p className="text-lg font-medium text-muted-foreground">No usage logs found</p>
                        {hasFilters && <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>}
                    </div>
                )}

                {/* Pagination */}
                <PaginationControls
                    data={logs}
                    baseUrl="/admin/usage-logs"
                    preserveFilters={{
                        search: search || undefined,
                        action_type: filters.action_type && filters.action_type !== 'all' ? filters.action_type : undefined,
                        model: filters.model && filters.model !== 'all' ? filters.model : undefined,
                        date_from: dateFrom || undefined,
                        date_to: dateTo || undefined,
                        user_id: filters.user_id || undefined,
                    }}
                />
            </div>
        </AppLayout>
    );
}
