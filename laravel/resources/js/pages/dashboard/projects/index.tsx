import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { EyeIcon, FilterIcon } from 'lucide-react';
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

export default function ProjectsIndex({ projects, statuses, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleFilter = () => {
        const filterData: { search?: string; status?: string } = {};
        if (search) filterData.search = search;
        if (status && status !== 'all') filterData.status = status;

        router.get('/admin/projects', filterData, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
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
                    <Badge variant="outline">{projects.meta?.total || 0} Total Projects</Badge>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <Input
                        type="text"
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />

                    <Select value={status} onValueChange={setStatus}>
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

                    <Button onClick={handleFilter}>
                        <FilterIcon className="mr-2 h-4 w-4" />
                        Apply Filters
                    </Button>

                    {(search || (status && status !== 'all')) && (
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
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.data.map((project) => (
                                <TableRow key={project.id}>
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
                                    <TableCell>
                                        <Link href={`/admin/projects/${project.id}`}>
                                            <Button variant="outline" size="sm">
                                                <EyeIcon className="mr-2 h-4 w-4" />
                                                View
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {projects.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-lg font-medium text-muted-foreground">No projects found</p>
                        {(search || (status && status !== 'all')) && (
                            <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                        )}
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
