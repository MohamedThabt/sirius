import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { MessageSquareIcon, CheckCircleIcon, ClockIcon, LightbulbIcon, EyeIcon, AlertCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { useFlashToasts } from '@/hooks/use-flash-toasts';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Feedback {
    id: number;
    type: string;
    message: string;
    status: string;
    page_url?: string;
    created_at: string;
    user: User;
}

interface TypeOption {
    value: string;
    label: string;
}

interface StatusOption {
    value: string;
    label: string;
}

interface Summary {
    total: number;
    new: number;
    reviewed: number;
    planned: number;
    done: number;
}

interface Props {
    feedbacks: {
        data: Feedback[];
        links: any[];
        meta: any;
    };
    types: TypeOption[];
    statuses: StatusOption[];
    filters: {
        search?: string;
        type?: string;
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
        title: 'Feedback',
        href: '/admin/feedback',
    },
];

export default function FeedbackIndex({ feedbacks, types, statuses, filters, summary }: Props) {
    useFlashToasts();
    const [search, setSearch] = useState(filters.search || '');

    const applyFilters = (newSearch?: string, newType?: string, newStatus?: string) => {
        const filterData: { search?: string; type?: string; status?: string } = {};
        const searchValue = newSearch !== undefined ? newSearch : search;
        const typeValue = newType !== undefined ? newType : (filters.type || 'all');
        const statusValue = newStatus !== undefined ? newStatus : (filters.status || 'all');
        
        if (searchValue) filterData.search = searchValue;
        if (typeValue && typeValue !== 'all') filterData.type = typeValue;
        if (statusValue && statusValue !== 'all') filterData.status = statusValue;

        router.get('/admin/feedback', filterData, { preserveState: true });
    };

    const handleTypeChange = (newType: string) => {
        applyFilters(undefined, newType, undefined);
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
        router.get('/admin/feedback');
    };

    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'suggestion':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'ux':
                return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
            case 'confusion':
                return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
            default:
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'done':
                return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
            case 'planned':
                return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
            case 'reviewed':
                return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
            case 'new':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            default:
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Feedback Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Feedback Management</h1>
                    <Badge variant="outline">{summary?.total || feedbacks.meta?.total || 0} Total Feedback</Badge>
                </div>

                {/* Summary Stats */}
                {summary && (
                    <div className="grid gap-4 md:grid-cols-5">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                                <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">New</CardTitle>
                                <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.new}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
                                <EyeIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.reviewed}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Planned</CardTitle>
                                <LightbulbIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.planned}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Done</CardTitle>
                                <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.done}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <Input
                        type="text"
                        placeholder="Search feedback... (Press Enter)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="max-w-sm"
                    />

                    <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {types.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
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

                    {(search || filters.type || filters.status) && (
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    )}
                </div>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Message</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {feedbacks.data.map((feedback) => (
                                <TableRow 
                                    key={feedback.id} 
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => router.visit(`/admin/feedback/${feedback.id}`)}
                                >
                                    <TableCell className="max-w-md">
                                        <p className="truncate" title={feedback.message}>
                                            {feedback.message}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{feedback.user.name}</p>
                                            <p className="text-sm text-muted-foreground">{feedback.user.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getTypeColor(feedback.type)}>
                                            {feedback.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusColor(feedback.status)}>
                                            {feedback.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(feedback.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {feedbacks.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <MessageSquareIcon className="h-12 w-12 text-muted-foreground/20 mb-3" />
                        <p className="text-lg font-medium text-muted-foreground">No feedback found</p>
                        {(search || filters.type || filters.status) && (
                            <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                        )}
                    </div>
                )}

                {/* Pagination info */}
                <div className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Showing {feedbacks.data.length} of {feedbacks.meta?.total || 0} feedback
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}

