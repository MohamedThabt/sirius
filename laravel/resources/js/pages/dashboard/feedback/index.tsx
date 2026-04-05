import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, PageHeader, GlowingBadge } from '@/components/ui/futuristic';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { MessageSquareIcon, CheckCircleIcon, ClockIcon, LightbulbIcon, EyeIcon, AlertCircleIcon, SearchIcon, XIcon, ExternalLinkIcon } from 'lucide-react';
import { useState } from 'react';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { PaginationControls } from '@/components/PaginationControls';

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
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    types: TypeOption[];
    statuses: StatusOption[];
    filters: {
        search?: string;
        type?: string;
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

    const getTypeVariant = (type: string): "info" | "purple" | "warning" | "slate" => {
        switch (type.toLowerCase()) {
            case 'suggestion':
                return 'info';
            case 'ux':
                return 'purple';
            case 'confusion':
                return 'warning';
            default:
                return 'slate';
        }
    };

    const getStatusVariant = (status: string): "success" | "purple" | "warning" | "info" | "slate" => {
        switch (status.toLowerCase()) {
            case 'done':
                return 'success';
            case 'planned':
                return 'purple';
            case 'reviewed':
                return 'warning';
            case 'new':
                return 'info';
            default:
                return 'slate';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Feedback Management" />

                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    {/* Page Header */}
                    <PageHeader
                        title="Feedback Management"
                        greeting="User Feedback"
                        icon={MessageSquareIcon}
                        iconClassName="text-green-500"
                        showDate={false}
                        quickStats={[
                            { label: 'Total', value: summary?.total || 0 },
                            { label: 'New', value: summary?.new || 0 },
                            { label: 'Reviewed', value: summary?.reviewed || 0 },
                        ]}
                    />

                    {/* Summary Stats */}
                    {summary && (
                        <div className="grid gap-4 md:grid-cols-5">
                            <EnhancedCard variant="gradient" glowColor="blue">
                                <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                    <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Total</EnhancedCardTitle>
                                    <div className="rounded-xl bg-blue-500/10 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/20">
                                        <MessageSquareIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </EnhancedCardHeader>
                                <EnhancedCardContent>
                                    <div className="text-3xl font-bold tabular-nums">{summary.total}</div>
                                </EnhancedCardContent>
                            </EnhancedCard>

                            <EnhancedCard variant="gradient" glowColor="cyan">
                                <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                    <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">New</EnhancedCardTitle>
                                    <div className="rounded-xl bg-cyan-500/10 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-cyan-500/20">
                                        <ClockIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                </EnhancedCardHeader>
                                <EnhancedCardContent>
                                    <div className="text-3xl font-bold tabular-nums text-cyan-600 dark:text-cyan-400">{summary.new}</div>
                                </EnhancedCardContent>
                            </EnhancedCard>

                            <EnhancedCard variant="glass">
                                <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                    <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Reviewed</EnhancedCardTitle>
                                    <div className="rounded-xl bg-amber-500/10 p-2.5">
                                        <EyeIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </EnhancedCardHeader>
                                <EnhancedCardContent>
                                    <div className="text-3xl font-bold tabular-nums">{summary.reviewed}</div>
                                </EnhancedCardContent>
                            </EnhancedCard>

                            <EnhancedCard variant="gradient" glowColor="purple">
                                <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                    <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Planned</EnhancedCardTitle>
                                    <div className="rounded-xl bg-purple-500/10 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-500/20">
                                        <LightbulbIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </EnhancedCardHeader>
                                <EnhancedCardContent>
                                    <div className="text-3xl font-bold tabular-nums text-purple-600 dark:text-purple-400">{summary.planned}</div>
                                </EnhancedCardContent>
                            </EnhancedCard>

                            <EnhancedCard variant="gradient" glowColor="emerald">
                                <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                    <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Done</EnhancedCardTitle>
                                    <div className="rounded-xl bg-emerald-500/10 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20">
                                        <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </EnhancedCardHeader>
                                <EnhancedCardContent>
                                    <div className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{summary.done}</div>
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
                                placeholder="Search feedback... (Press Enter)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="border-border/40 bg-card/50 pl-10 backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-card/80"
                            />
                        </div>

                        <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
                            <SelectTrigger className="w-40 border-border/40 bg-card/50 backdrop-blur-sm">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent className="border-border/40 bg-card/95 backdrop-blur-xl">
                                <SelectItem value="all">All Types</SelectItem>
                                {types.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
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

                        {(search || filters.type || filters.status) && (
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

                    {/* Feedback Table */}
                    <EnhancedCard variant="glass" hoverEffect={false} className="overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/40 hover:bg-transparent">
                                    <TableHead className="text-muted-foreground/70">Message</TableHead>
                                    <TableHead className="text-muted-foreground/70">User</TableHead>
                                    <TableHead className="text-muted-foreground/70">Type</TableHead>
                                    <TableHead className="text-muted-foreground/70">Status</TableHead>
                                    <TableHead className="text-muted-foreground/70">Created</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {feedbacks.data.map((feedback) => (
                                    <TableRow 
                                        key={feedback.id} 
                                        className="group cursor-pointer border-border/30 transition-all duration-200 hover:bg-primary/[0.03]"
                                        onClick={() => router.visit(`/admin/feedback/${feedback.id}`)}
                                    >
                                        <TableCell className="max-w-md">
                                            <p className="truncate text-foreground/90" title={feedback.message}>
                                                {feedback.message}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-foreground/80">{feedback.user.name}</p>
                                                <p className="text-xs text-muted-foreground/50">{feedback.user.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <GlowingBadge variant={getTypeVariant(feedback.type)}>
                                                {feedback.type}
                                            </GlowingBadge>
                                        </TableCell>
                                        <TableCell>
                                            <GlowingBadge variant={getStatusVariant(feedback.status)}>
                                                {feedback.status}
                                            </GlowingBadge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground/60 tabular-nums">
                                            {new Date(feedback.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <ExternalLinkIcon className="h-4 w-4 text-muted-foreground/30 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </EnhancedCard>

                    {feedbacks.data.length === 0 && (
                        <EnhancedCard variant="glass" className="py-16">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="mb-4 rounded-full bg-muted/30 p-4">
                                    <AlertCircleIcon className="h-8 w-8 text-muted-foreground/30" />
                                </div>
                                <p className="text-lg font-medium text-muted-foreground">No feedback found</p>
                                {(search || filters.type || filters.status) && (
                                    <p className="mt-1 text-sm text-muted-foreground/60">Try adjusting your search criteria</p>
                                )}
                            </div>
                        </EnhancedCard>
                    )}

                    {/* Pagination */}
                    <PaginationControls 
                        data={feedbacks}
                        baseUrl="/admin/feedback"
                        preserveFilters={{
                            search: search || undefined,
                            type: filters.type || undefined,
                            status: filters.status || undefined,
                        }}
                    />
                </div>
        </AppLayout>
    );
}
