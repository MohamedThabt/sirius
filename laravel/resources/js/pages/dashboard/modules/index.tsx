import { PaginationControls } from '@/components/PaginationControls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BoxIcon, CheckCircleIcon, ClockIcon, DatabaseIcon, FolderIcon, ZapIcon } from 'lucide-react';
import { useState } from 'react';

interface Project {
    id: number;
    name: string;
    status: string;
    user?: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
}

interface Module {
    id: number;
    name: string;
    description?: string;
    status: string;
    order_of_implementation: number;
    erd_is_synced: boolean;
    created_at: string;
    features_count: number;
    project: Project;
}

interface Stats {
    total_modules: number;
    modules_by_status: Record<string, number>;
    modules_with_erd: number;
    modules_with_synced_erd: number;
    total_features: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface Props {
    modules: {
        data: Module[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number;
        to?: number;
    };
    filters: {
        search?: string;
        per_page?: number;
    };
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Modules',
        href: '/admin/modules',
    },
];

export default function ModulesIndex({ modules, stats }: Props) {
    const [search, setSearch] = useState('');

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/admin/modules', search ? { search } : {}, { preserveState: true });
        }
    };

    const clearSearch = () => {
        setSearch('');
        router.get('/admin/modules');
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
            case 'in_progress':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'planned':
                return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
            default:
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Module Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold">Module Management</h1>
                    <Badge variant="outline">{stats.total_modules} Total Modules</Badge>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                            <BoxIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_modules}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">With ERD</CardTitle>
                            <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.modules_with_erd}</div>
                            <p className="text-xs text-muted-foreground">{stats.modules_with_synced_erd} synced</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Features</CardTitle>
                            <ZapIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_features}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.modules_by_status?.completed || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.modules_by_status?.in_progress || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Search modules... (Press Enter)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="max-w-sm"
                    />
                    {search && (
                        <Button variant="outline" onClick={clearSearch}>
                            Clear
                        </Button>
                    )}
                </div>

                {/* Modules Table */}
                <div className="overflow-x-auto rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Module</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Features</TableHead>
                                <TableHead>ERD Status</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {modules.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No modules found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                modules.data.map((module) => (
                                    <TableRow
                                        key={module.id}
                                        className="cursor-pointer transition-colors hover:bg-muted/50"
                                        onClick={() => router.visit(`/admin/modules/${module.id}`)}
                                    >
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{module.name}</span>
                                                {module.description && (
                                                    <span className="line-clamp-1 text-xs text-muted-foreground">{module.description}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FolderIcon className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{module.project?.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{module.features_count}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {module.erd_is_synced ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                                >
                                                    <CheckCircleIcon className="mr-1 h-3 w-3" />
                                                    Synced
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                                >
                                                    <ClockIcon className="mr-1 h-3 w-3" />
                                                    Pending
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(module.status)}>
                                                {module.status?.replace('_', ' ') || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">#{module.order_of_implementation}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">{new Date(module.created_at).toLocaleDateString()}</span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <PaginationControls
                    data={modules}
                    baseUrl="/admin/modules"
                    preserveFilters={{
                        search: search || undefined,
                    }}
                />
            </div>
        </AppLayout>
    );
}
