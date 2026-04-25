import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, PageHeader, GlowingBadge } from '@/components/ui/futuristic';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { PaginationControls } from '@/components/PaginationControls';
import { ClientDateTime } from '@/components/ClientDateTime';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import {
    AlertCircle, CheckCircleIcon, ClockIcon, CreditCardIcon, ExternalLinkIcon,
    FilterIcon, SearchIcon, XCircleIcon,
} from 'lucide-react';

interface Payment {
    id: number;
    plan_slug: string;
    amount: string;
    currency: string;
    payment_method: string;
    status: 'pending' | 'accepted' | 'denied';
    admin_note?: string;
    created_at: string;
    reviewed_at?: string;
    user: { id: number; name: string; email: string };
}

interface Summary {
    total: number;
    pending: number;
    accepted: number;
    denied: number;
}

interface PageProps {
    payments: {
        data: Payment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: { search?: string; status?: string; per_page?: number };
    summary: Summary;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Payment Requests', href: '/admin/payments' },
];

const statusVariant = (s: string): 'warning' | 'success' | 'danger' | 'slate' =>
    s === 'pending' ? 'warning' : s === 'accepted' ? 'success' : s === 'denied' ? 'danger' : 'slate';

const statusIcon = (s: string) =>
    s === 'accepted' ? <CheckCircleIcon className="h-3 w-3" />
    : s === 'denied'   ? <XCircleIcon className="h-3 w-3" />
    : <ClockIcon className="h-3 w-3" />;

export default function PaymentsIndex({ payments, filters, summary }: PageProps) {
    useFlashToasts();

    const [search, setSearch]       = useState(filters.search || '');
    const [statusFilter, setStatus] = useState(filters.status || '');
    const [deleteId, setDeleteId]   = useState<number | null>(null);
    const [deleting, setDeleting]   = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/payments', { search: search || undefined, status: statusFilter || undefined }, { preserveState: true });
    };

    const handleDelete = () => {
        if (deleteId === null) return;
        setDeleting(true);
        router.delete(`/admin/payments/${deleteId}`, {
            onFinish: () => { setDeleting(false); setDeleteId(null); },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Requests" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Payment Requests"
                    greeting="Billing Management"
                    icon={CreditCardIcon}
                    iconClassName="text-violet-500"
                    showDate={false}
                    quickStats={[
                        { label: 'Total', value: summary.total },
                        { label: 'Pending', value: summary.pending, highlight: summary.pending > 0 },
                        { label: 'Accepted', value: summary.accepted },
                    ]}
                />

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <EnhancedCard variant="gradient" glowColor="blue">
                        <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                            <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Total</EnhancedCardTitle>
                            <div className="rounded-xl bg-blue-500/10 p-2.5"><CreditCardIcon className="h-4 w-4 text-blue-500" /></div>
                        </EnhancedCardHeader>
                        <EnhancedCardContent>
                            <div className="text-3xl font-bold tabular-nums">{summary.total}</div>
                        </EnhancedCardContent>
                    </EnhancedCard>
                    <EnhancedCard variant="gradient" glowColor="amber">
                        <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                            <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Pending</EnhancedCardTitle>
                            <div className="rounded-xl bg-amber-500/10 p-2.5"><ClockIcon className="h-4 w-4 text-amber-500" /></div>
                        </EnhancedCardHeader>
                        <EnhancedCardContent>
                            <div className="text-3xl font-bold tabular-nums text-amber-500">{summary.pending}</div>
                        </EnhancedCardContent>
                    </EnhancedCard>
                    <EnhancedCard variant="gradient" glowColor="emerald">
                        <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                            <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Accepted</EnhancedCardTitle>
                            <div className="rounded-xl bg-emerald-500/10 p-2.5"><CheckCircleIcon className="h-4 w-4 text-emerald-500" /></div>
                        </EnhancedCardHeader>
                        <EnhancedCardContent>
                            <div className="text-3xl font-bold tabular-nums text-emerald-500">{summary.accepted}</div>
                        </EnhancedCardContent>
                    </EnhancedCard>
                    <EnhancedCard variant="gradient" glowColor="pink">
                        <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                            <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Denied</EnhancedCardTitle>
                            <div className="rounded-xl bg-red-500/10 p-2.5"><XCircleIcon className="h-4 w-4 text-red-500" /></div>
                        </EnhancedCardHeader>
                        <EnhancedCardContent>
                            <div className="text-3xl font-bold tabular-nums text-red-500">{summary.denied}</div>
                        </EnhancedCardContent>
                    </EnhancedCard>
                </div>

                {/* Search & Filter */}
                <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                    <div className="relative max-w-md flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border-border/40 bg-card/50 pl-10"
                        />
                    </div>
                    <Select value={statusFilter || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-[180px] border-border/40 bg-card/50">
                            <FilterIcon className="mr-2 h-4 w-4 text-muted-foreground/50" />
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="denied">Denied</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button type="submit" variant="secondary" className="border-border/40 bg-card/50">Filter</Button>
                    {(search || statusFilter) && (
                        <Button type="button" variant="outline" className="border-border/40" onClick={() => { setSearch(''); setStatus(''); router.get('/admin/payments'); }}>
                            Clear
                        </Button>
                    )}
                </form>

                {/* Table */}
                <EnhancedCard variant="glass" hoverEffect={false} className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/40 hover:bg-transparent">
                                <TableHead className="text-muted-foreground/70">#</TableHead>
                                <TableHead className="text-muted-foreground/70">User</TableHead>
                                <TableHead className="text-muted-foreground/70">Plan</TableHead>
                                <TableHead className="text-muted-foreground/70">Amount</TableHead>
                                <TableHead className="text-muted-foreground/70">Status</TableHead>
                                <TableHead className="text-muted-foreground/70">Submitted</TableHead>
                                <TableHead className="text-muted-foreground/70">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.data.map((p) => (
                                <TableRow key={p.id} className="group border-border/30 transition-all duration-200 hover:bg-primary/[0.03]">
                                    <TableCell className="tabular-nums text-muted-foreground/60">{p.id}</TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium text-foreground/90">{p.user.name}</div>
                                        <div className="text-xs text-muted-foreground/60">{p.user.email}</div>
                                    </TableCell>
                                    <TableCell className="capitalize text-muted-foreground/80">{p.plan_slug}</TableCell>
                                    <TableCell className="tabular-nums text-muted-foreground/80">
                                        {Number(p.amount).toLocaleString()} {p.currency}
                                    </TableCell>
                                    <TableCell>
                                        <GlowingBadge variant={statusVariant(p.status)} icon={statusIcon(p.status)}>
                                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                        </GlowingBadge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground/60 tabular-nums">
                                        <ClientDateTime value={p.created_at} dateStyle="short" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/payments/${p.id}`}>
                                                <Button variant="outline" size="sm" className="border-border/40 gap-1">
                                                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                                                    Review
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() => setDeleteId(p.id)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                                </svg>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </EnhancedCard>

                {payments.data.length === 0 && (
                    <EnhancedCard variant="glass" className="py-16">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="mb-4 rounded-full bg-muted/30 p-4">
                                <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                            <p className="text-lg font-medium text-muted-foreground">No payment requests found</p>
                            {(search || statusFilter) && <p className="mt-1 text-sm text-muted-foreground/60">Try adjusting your filters</p>}
                        </div>
                    </EnhancedCard>
                )}

                <PaginationControls
                    data={payments}
                    baseUrl="/admin/payments"
                    preserveFilters={{ search: search || undefined, status: statusFilter || undefined }}
                />
            </div>

            {/* Delete Confirm Dialog */}
            <Dialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
                <DialogContent className="border-border/40 bg-card/95 backdrop-blur-xl sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <XCircleIcon className="h-5 w-5" /> Delete Payment Record
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this payment record? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" className="border-border/40" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
