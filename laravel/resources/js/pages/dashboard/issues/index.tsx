import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertTriangleIcon, BugIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { useFlashToasts } from '@/hooks/use-flash-toasts';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Issue {
    id: number;
    title: string;
    description: string;
    severity: string;
    status: string;
    page_url?: string;
    created_at: string;
    user: User;
}

interface SeverityOption {
    value: string;
    label: string;
}

interface StatusOption {
    value: string;
    label: string;
}

interface Summary {
    total: number;
    open: number;
    investigating: number;
    fixed: number;
    blockers: number;
}

interface Props {
    issues: {
        data: Issue[];
        links: any[];
        meta: any;
    };
    severities: SeverityOption[];
    statuses: StatusOption[];
    filters: {
        search?: string;
        severity?: string;
        status?: string;
    };
    summary: Summary;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Issues',
        href: '/admin/issues',
    },
];

export default function IssuesIndex({ issues, severities, statuses, filters, summary }: Props) {
    useFlashToasts();
    const [search, setSearch] = useState(filters.search || '');

    const applyFilters = (newSearch?: string, newSeverity?: string, newStatus?: string) => {
        const filterData: { search?: string; severity?: string; status?: string } = {};
        const searchValue = newSearch !== undefined ? newSearch : search;
        const severityValue = newSeverity !== undefined ? newSeverity : (filters.severity || 'all');
        const statusValue = newStatus !== undefined ? newStatus : (filters.status || 'all');
        
        if (searchValue) filterData.search = searchValue;
        if (severityValue && severityValue !== 'all') filterData.severity = severityValue;
        if (statusValue && statusValue !== 'all') filterData.status = statusValue;

        router.get('/admin/issues', filterData, { preserveState: true });
    };

    const handleSeverityChange = (newSeverity: string) => {
        applyFilters(undefined, newSeverity, undefined);
    };

    const handleStatusChange = (newStatus: string) => {
        applyFilters(undefined, undefined, newStatus);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyFilters(search, undefined, undefined);
        }
    };

    const clearFilters = () => {
        setSearch('');
        router.get('/admin/issues');
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'blocker':
                return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
            case 'high':
                return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
            case 'medium':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'low':
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'fixed':
                return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
            case 'investigating':
                return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
            case 'open':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'wont_fix':
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Issue Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Issue Management</h1>
                    <Badge variant="outline">{summary?.total || issues.meta?.total || 0} Total Issues</Badge>
                </div>

                {/* Summary Stats */}
                {summary && (
                    <div className="grid gap-4 md:grid-cols-5">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                                <BugIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Open</CardTitle>
                                <AlertTriangleIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.open}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Investigating</CardTitle>
                                <ClockIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.investigating}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Fixed</CardTitle>
                                <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.fixed}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Blockers</CardTitle>
                                <XCircleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.blockers}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <Input
                        type="text"
                        placeholder="Search issues... (Press Enter)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="max-w-sm"
                    />

                    <Select value={filters.severity || 'all'} onValueChange={handleSeverityChange}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by severity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Severities</SelectItem>
                            {severities.map((severity) => (
                                <SelectItem key={severity.value} value={severity.value}>
                                    {severity.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(search || filters.severity || filters.status) && (
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    )}
                </div>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Reporter</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {issues.data.map((issue) => (
                                <TableRow 
                                    key={issue.id} 
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => router.visit(`/admin/issues/${issue.id}`)}
                                >
                                    <TableCell className="font-medium">{issue.title}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{issue.user.name}</p>
                                            <p className="text-sm text-muted-foreground">{issue.user.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                                            {issue.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusColor(issue.status)}>
                                            {issue.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(issue.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {issues.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <BugIcon className="h-12 w-12 text-muted-foreground/20 mb-3" />
                        <p className="text-lg font-medium text-muted-foreground">No issues found</p>
                        {(search || filters.severity || filters.status) && (
                            <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                        )}
                    </div>
                )}

                {/* Pagination info */}
                <div className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Showing {issues.data.length} of {issues.meta?.total || 0} issues
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}

