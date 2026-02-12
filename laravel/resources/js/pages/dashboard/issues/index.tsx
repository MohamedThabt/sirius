import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, PageHeader, GlowingBadge } from '@/components/ui/futuristic';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertTriangleIcon, BugIcon, CheckCircleIcon, ClockIcon, XCircleIcon, SearchIcon, XIcon, ExternalLinkIcon } from 'lucide-react';
import { useState } from 'react';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { PaginationControls } from '@/components/PaginationControls';

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

    const getSeverityVariant = (severity: string): "danger" | "warning" | "info" | "slate" => {
        switch (severity.toLowerCase()) {
            case 'blocker':
                return 'danger';
            case 'high':
                return 'warning';
            case 'medium':
                return 'info';
            case 'low':
                return 'slate';
            default:
                return 'slate';
        }
    };

    const getStatusVariant = (status: string): "success" | "warning" | "info" | "slate" => {
        switch (status.toLowerCase()) {
            case 'fixed':
                return 'success';
            case 'investigating':
                return 'warning';
            case 'open':
                return 'info';
            case 'wont_fix':
                return 'slate';
            default:
                return 'slate';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Issue Management" />

                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    {/* Page Header */}
                    <PageHeader
                        title="Issue Management"
                        greeting="Bug Reports"
                        icon={BugIcon}
                        iconClassName="text-rose-500"
                        showDate={false}
                        quickStats={[
                            { label: 'Total', value: summary?.total || 0 },
                            { label: 'Open', value: summary?.open || 0 },
                            { label: 'Blockers', value: summary?.blockers || 0 },
                        ]}
                    />

                    {/* Summary Stats */}
                    {summary && (
                        <div className="grid gap-4 md:grid-cols-5">
                            <EnhancedCard variant="gradient" glowColor="blue">
                                <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                    <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Total</EnhancedCardTitle>
                                    <div className="rounded-xl bg-blue-500/10 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/20">
                                        <BugIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </EnhancedCardHeader>
                                <EnhancedCardContent>
                                    <div className="text-3xl font-bold tabular-nums">{summary.total}</div>
                                </EnhancedCardContent>
                            </EnhancedCard>

                            <EnhancedCard variant="gradient" glowColor="cyan">
                                <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                    <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Open</EnhancedCardTitle>
                                    <div className="rounded-xl bg-cyan-500/10 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-cyan-500/20">
                                        <AlertTriangleIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                </EnhancedCardHeader>
                                <EnhancedCardContent>
                                    <div className="text-3xl font-bold tabular-nums text-cyan-600 dark:text-cyan-400">{summary.open}</div>
                                </EnhancedCardContent>
                            </EnhancedCard>

                            <EnhancedCard variant="glass">
                                <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                    <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Investigating</EnhancedCardTitle>
                                    <div className="rounded-xl bg-amber-500/10 p-2.5">
                                        <ClockIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </EnhancedCardHeader>
                                <EnhancedCardContent>
                                    <div className="text-3xl font-bold tabular-nums">{summary.investigating}</div>
                                </EnhancedCardContent>
                            </EnhancedCard>

                            <EnhancedCard variant="gradient" glowColor="emerald">
                                <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                    <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Fixed</EnhancedCardTitle>
                                    <div className="rounded-xl bg-emerald-500/10 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20">
                                        <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </EnhancedCardHeader>
                                <EnhancedCardContent>
                                    <div className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{summary.fixed}</div>
                                </EnhancedCardContent>
                            </EnhancedCard>

                            <EnhancedCard variant="gradient" glowColor="pink">
                                <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                    <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Blockers</EnhancedCardTitle>
                                    <div className="rounded-xl bg-rose-500/10 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-rose-500/20">
                                        <XCircleIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                    </div>
                                </EnhancedCardHeader>
                                <EnhancedCardContent>
                                    <div className="text-3xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{summary.blockers}</div>
                                </EnhancedCardContent>
                            </EnhancedCard>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3">
                        <div className="relative max-w-md flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                            <Input
                                type="text"
                                placeholder="Search issues... (Press Enter)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="border-border/40 bg-card/50 pl-10 backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-card/80"
                            />
                        </div>

                        <Select value={filters.severity || 'all'} onValueChange={handleSeverityChange}>
                            <SelectTrigger className="w-40 border-border/40 bg-card/50 backdrop-blur-sm">
                                <SelectValue placeholder="Filter by severity" />
                            </SelectTrigger>
                            <SelectContent className="border-border/40 bg-card/95 backdrop-blur-xl">
                                <SelectItem value="all">All Severities</SelectItem>
                                {severities.map((severity) => (
                                    <SelectItem key={severity.value} value={severity.value}>
                                        {severity.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-40 border-border/40 bg-card/50 backdrop-blur-sm">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent className="border-border/40 bg-card/95 backdrop-blur-xl">
                                <SelectItem value="all">All Statuses</SelectItem>
                                {statuses.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {(search || filters.severity || filters.status) && (
                            <Button 
                                variant="outline" 
                                onClick={clearFilters}
                                className="border-border/40 bg-card/50 backdrop-blur-sm"
                            >
                                <XIcon className="mr-2 h-4 w-4" />
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* Issues Table */}
                    <EnhancedCard variant="glass" hoverEffect={false} className="overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/40 hover:bg-transparent">
                                    <TableHead className="text-muted-foreground/70">Title</TableHead>
                                    <TableHead className="text-muted-foreground/70">Reporter</TableHead>
                                    <TableHead className="text-muted-foreground/70">Severity</TableHead>
                                    <TableHead className="text-muted-foreground/70">Status</TableHead>
                                    <TableHead className="text-muted-foreground/70">Created</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {issues.data.map((issue) => (
                                    <TableRow 
                                        key={issue.id} 
                                        className="group cursor-pointer border-border/30 transition-all duration-200 hover:bg-primary/[0.03]"
                                        onClick={() => router.visit(`/admin/issues/${issue.id}`)}
                                    >
                                        <TableCell className="font-medium text-foreground/90">{issue.title}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-foreground/80">{issue.user.name}</p>
                                                <p className="text-xs text-muted-foreground/50">{issue.user.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <GlowingBadge variant={getSeverityVariant(issue.severity)}>
                                                {issue.severity}
                                            </GlowingBadge>
                                        </TableCell>
                                        <TableCell>
                                            <GlowingBadge variant={getStatusVariant(issue.status)}>
                                                {issue.status.replace('_', ' ')}
                                            </GlowingBadge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground/60 tabular-nums">
                                            {new Date(issue.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <ExternalLinkIcon className="h-4 w-4 text-muted-foreground/30 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </EnhancedCard>

                    {issues.data.length === 0 && (
                        <EnhancedCard variant="glass" className="py-16">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="mb-4 rounded-full bg-muted/30 p-4">
                                    <BugIcon className="h-8 w-8 text-muted-foreground/30" />
                                </div>
                                <p className="text-lg font-medium text-muted-foreground">No issues found</p>
                                {(search || filters.severity || filters.status) && (
                                    <p className="mt-1 text-sm text-muted-foreground/60">Try adjusting your search criteria</p>
                                )}
                            </div>
                        </EnhancedCard>
                    )}

                    {/* Pagination */}
                    <PaginationControls 
                        data={{
                            current_page: issues.meta?.current_page || 1,
                            last_page: issues.meta?.last_page || 1,
                            from: issues.meta?.from,
                            to: issues.meta?.to,
                            total: issues.meta?.total || 0,
                            per_page: issues.meta?.per_page || 10,
                        }}
                        baseUrl="/admin/issues"
                        preserveFilters={{
                            search: search || undefined,
                            severity: filters.severity || undefined,
                            status: filters.status || undefined,
                        }}
                    />
                </div>
        </AppLayout>
    );
}
