import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { DatabaseIcon, FileTextIcon, FolderIcon, NetworkIcon } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Project {
    id: number;
    name: string;
    brief: string;
    status: string;
    created_at: string;
    user: User;
}

interface Summary {
    total: number;
    draft: number;
    in_progress: number;
    completed: number;
    with_prd: number;
    with_erd: number;
    with_c4: number;
    with_repo: number;
}

interface Props {
    projects: {
        data: Project[];
        links: any[];
        meta: any;
    };
    statuses: string[];
    filters: {
        search?: string;
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
        title: 'Projects',
        href: '/admin/projects',
    },
];

export default function ProjectsIndex({ projects, statuses, filters, summary }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const applyFilters = (newSearch?: string, newStatus?: string) => {
        const filterData: { search?: string; status?: string } = {};
        const searchValue = newSearch !== undefined ? newSearch : search;
        const statusValue = newStatus !== undefined ? newStatus : filters.status || 'all';

        if (searchValue) filterData.search = searchValue;
        if (statusValue && statusValue !== 'all') filterData.status = statusValue;

        router.get('/admin/projects', filterData, { preserveState: true });
    };

    const handleStatusChange = (newStatus: string) => {
        applyFilters(undefined, newStatus);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyFilters(search, undefined);
        }
    };

    const clearFilters = () => {
        setSearch('');
        router.get('/admin/projects');
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'draft':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Project Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Project Management</h1>
                    <Badge variant="outline">{summary?.total || projects.meta?.total || 0} Total Projects</Badge>
                </div>

                {/* Summary Stats */}
                {summary && (
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Project Status</CardTitle>
                                <FolderIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Draft</span>
                                        <Badge variant="secondary">{summary.draft}</Badge>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">In Progress</span>
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{summary.in_progress}</Badge>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Completed</span>
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                            {summary.completed}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">With PRD</CardTitle>
                                <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.with_prd}</div>
                                <p className="text-xs text-muted-foreground">
                                    {summary.total > 0 ? Math.round((summary.with_prd / summary.total) * 100) : 0}% of projects
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">With ERD</CardTitle>
                                <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.with_erd}</div>
                                <p className="text-xs text-muted-foreground">
                                    {summary.total > 0 ? Math.round((summary.with_erd / summary.total) * 100) : 0}% of projects
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">With C4 Diagram</CardTitle>
                                <NetworkIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.with_c4}</div>
                                <p className="text-xs text-muted-foreground">{summary.with_repo} with GitHub repo</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <Input
                        type="text"
                        placeholder="Search projects... (Press Enter)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="max-w-sm"
                    />

                    <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {statuses.map((statusOption) => (
                                <SelectItem key={statusOption} value={statusOption}>
                                    {statusOption.replace('_', ' ').toUpperCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(search || filters.status) && (
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    )}
                </div>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Brief</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.data.map((project) => (
                                <TableRow
                                    key={project.id}
                                    className="cursor-pointer transition-colors hover:bg-muted/50"
                                    onClick={() => router.visit(`/admin/projects/${project.id}`)}
                                >
                                    <TableCell className="font-medium">{project.name}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{project.user.name}</p>
                                            <p className="text-sm text-muted-foreground">{project.user.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <p className="truncate" title={project.brief}>
                                            {project.brief}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                                    </TableCell>
                                    <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {projects.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-lg font-medium text-muted-foreground">No projects found</p>
                        {(search || filters.status) && <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>}
                    </div>
                )}

                {/* Pagination info */}
                <div className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Showing {projects.data.length} of {projects.meta?.total || 0} projects
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
