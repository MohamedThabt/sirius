import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Receipt, UsersIcon, TrendingUpIcon, XCircle, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface Plan {
    id: number;
    name: string;
    slug: string;
}

interface Subscription {
    id: number;
    user_id: number;
    plan_id: number;
    status: string;
    started_at: string;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
    user: User;
    plan: Plan;
}

interface Summary {
    total: number;
    active: number;
    cancelled: number;
    expired: number;
    this_month: number;
}

interface Props {
    subscriptions: {
        data: Subscription[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
        plan_id?: string;
    };
    summary: Summary;
    plans: Plan[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Subscriptions',
        href: '/admin/subscriptions',
    },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'active':
            return <Badge variant="default" className="bg-green-500/10 text-green-600 dark:text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
        case 'cancelled':
            return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
        case 'expired':
            return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function SubscriptionsIndex({ subscriptions, filters, summary, plans }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [planFilter, setPlanFilter] = useState(filters.plan_id || 'all');

    const handleFilter = () => {
        const params: any = {};
        if (search) params.search = search;
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
        if (planFilter && planFilter !== 'all') params.plan_id = planFilter;
        router.get('/admin/subscriptions', params, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPlanFilter('all');
        router.get('/admin/subscriptions');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscriptions Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Subscriptions Management</h1>
                    <Badge variant="outline">{subscriptions.meta?.total || 0} Total Subscriptions</Badge>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.cancelled}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Expired</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.expired}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.this_month}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                    <Input
                        type="text"
                        placeholder="Search by user name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                        className="max-w-sm"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={planFilter} onValueChange={setPlanFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Plans" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Plans</SelectItem>
                            {plans.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id.toString()}>
                                    {plan.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleFilter}>Filter</Button>
                    {(search || (statusFilter && statusFilter !== 'all') || (planFilter && planFilter !== 'all')) && (
                        <Button variant="outline" onClick={clearFilters}>
                            Clear
                        </Button>
                    )}
                </div>

                {/* Subscriptions Table */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Started At</TableHead>
                                <TableHead>Ends At</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscriptions.data.map((subscription) => (
                                <TableRow key={subscription.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {subscription.user.avatar ? (
                                                <img src={subscription.user.avatar} alt={subscription.user.name} className="h-8 w-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                                    {subscription.user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div>{subscription.user.name}</div>
                                                <div className="text-sm text-muted-foreground">{subscription.user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{subscription.plan.name}</Badge>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                                    <TableCell>{new Date(subscription.started_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {subscription.ends_at ? new Date(subscription.ends_at).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            onClick={() => router.visit(`/admin/subscriptions/${subscription.id}`)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {subscriptions.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Receipt className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-lg font-medium text-muted-foreground">No subscriptions found</p>
                        {(search || (statusFilter && statusFilter !== 'all') || (planFilter && planFilter !== 'all')) && (
                            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                        )}
                    </div>
                )}

                {/* Pagination info */}
                {subscriptions.meta?.total > 0 && (
                    <div className="flex justify-center">
                        <p className="text-sm text-muted-foreground">
                            Showing {subscriptions.meta.from || 0} to {subscriptions.meta.to || 0} of {subscriptions.meta.total} subscriptions
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
