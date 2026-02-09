import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FuturisticBackground, EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, PageHeader, GlowingBadge } from '@/components/ui/futuristic';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { DatabaseIcon, FileTextIcon, FolderIcon, NetworkIcon, SearchIcon, XIcon, ExternalLinkIcon, AlertCircleIcon, GitBranchIcon } from 'lucide-react';
import { useState } from 'react';
import { PaginationControls } from '@/components/PaginationControls';

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

    const getStatusVariant = (status: string): "success" | "info" | "slate" | "warning" => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'in_progress':
                return 'info';
            case 'draft':
                return 'slate';
            default:
                return 'slate';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Project Management" />

            <FuturisticBackground className="min-h-full" showDots={true}>
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    {/* Page Header */}
                    <PageHeader
                        title="Project Management"
                        greeting="Platform Projects"
                        icon={FolderIcon}
                        iconClassName="text-amber-500"
                        showDate={false}
                        quickStats={[
                            { label: 'Total', value: summary?.total || 0 },
                            { label: 'In Progress', value: summary?.in_progress || 0 },
                            { label: 'Completed', value: summary?.completed || 0 },
                        ]}
                    />

                    {/* Summary Stats */}
                    {summary && (
                        <div className="grid gap-4 md:grid-cols-4">
                            <EnhancedCard variant="glass">
                                <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                    <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Project Status</EnhancedCardTitle>
                                    <div className="rounded-xl bg-amber-500/10 p-2.5">
                                        <FolderIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </EnhancedCardHeader>
                                <EnhancedCardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
                                            <span className="text-sm text-muted-foreground/70">Draft</span>
                                            <GlowingBadge variant="slate" size="sm">{summary.draft}</GlowingBadge>
                                        </div>
                                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
                                            <span className="text-sm text-muted-foreground/70">In Progress</span>
                                            <GlowingBadge variant="info" size="sm">{summary.in_progress}</GlowingBadge>
                                        </div>
                                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
                                            <span className="text-sm text-muted-foreground/70">Completed</span>
                                            <GlowingBadge variant="success" size="sm">{summary.completed}</GlowingBadge>
                                        </div>
                                    </div>
                                </EnhancedCardContent>
                            </EnhancedCard>

                            <EnhancedCard variant="gradient" glowColor="blue">
                                <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                    <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">With PRD</EnhancedCardTitle>
                                    <div className="rounded-xl bg-blue-500/10 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/20">
                                        <FileTextIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </EnhancedCardHeader>
                                <EnhancedCardContent>
                                    <div className="text-3xl font-bold tabular-nums">{summary.with_prd}</div>
                                    <p className="mt-1 text-xs text-muted-foreground/60">
                                        {summary.total > 0 ? Math.round((summary.with_prd / summary.total) * 100) : 0}% of projects
                                    </p>
                                </EnhancedCardContent>
                            </EnhancedCard>

                            <EnhancedCard variant="gradient" glowColor="emerald">
                                <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                    <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">With ERD</EnhancedCardTitle>
                                    <div className="rounded-xl bg-emerald-500/10 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20">
                                        <DatabaseIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </EnhancedCardHeader>
                                <EnhancedCardContent>
                                    <div className="text-3xl font-bold tabular-nums">{summary.with_erd}</div>
                                    <p className="mt-1 text-xs text-muted-foreground/60">
                                        {summary.total > 0 ? Math.round((summary.with_erd / summary.total) * 100) : 0}% of projects
                                    </p>
                                </EnhancedCardContent>
                            </EnhancedCard>

                            <EnhancedCard variant="gradient" glowColor="purple">
                                <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                    <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">With C4 Diagram</EnhancedCardTitle>
                                    <div className="rounded-xl bg-purple-500/10 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-500/20">
                                        <NetworkIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </EnhancedCardHeader>
                                <EnhancedCardContent>
                                    <div className="text-3xl font-bold tabular-nums">{summary.with_c4}</div>
                                    <p className="mt-1 text-xs text-muted-foreground/60 flex items-center gap-1">
                                        <GitBranchIcon className="h-3 w-3" />
                                        {summary.with_repo} with GitHub repo
                                    </p>
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
                                placeholder="Search projects... (Press Enter)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="border-border/40 bg-card/50 pl-10 backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-card/80"
                            />
                        </div>

                        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-48 border-border/40 bg-card/50 backdrop-blur-sm">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent className="border-border/40 bg-card/95 backdrop-blur-xl">
                                <SelectItem value="all">All Statuses</SelectItem>
                                {statuses.map((statusOption) => (
                                    <SelectItem key={statusOption} value={statusOption}>
                                        {statusOption.replace('_', ' ').toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {(search || filters.status) && (
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

                    {/* Projects Table */}
                    <EnhancedCard variant="glass" hoverEffect={false} className="overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/40 hover:bg-transparent">
                                    <TableHead className="text-muted-foreground/70">Project Name</TableHead>
                                    <TableHead className="text-muted-foreground/70">Owner</TableHead>
                                    <TableHead className="text-muted-foreground/70">Brief</TableHead>
                                    <TableHead className="text-muted-foreground/70">Status</TableHead>
                                    <TableHead className="text-muted-foreground/70">Created</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.data.map((project) => (
                                    <TableRow
                                        key={project.id}
                                        className="group cursor-pointer border-border/30 transition-all duration-200 hover:bg-primary/[0.03]"
                                        onClick={() => router.visit(`/admin/projects/${project.id}`)}
                                    >
                                        <TableCell className="font-medium text-foreground/90">{project.name}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-foreground/80">{project.user.name}</p>
                                                <p className="text-xs text-muted-foreground/50">{project.user.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="truncate text-muted-foreground/60" title={project.brief}>
                                                {project.brief}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <GlowingBadge variant={getStatusVariant(project.status)}>
                                                {project.status.replace('_', ' ')}
                                            </GlowingBadge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground/60 tabular-nums">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <ExternalLinkIcon className="h-4 w-4 text-muted-foreground/30 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </EnhancedCard>

                    {projects.data.length === 0 && (
                        <EnhancedCard variant="glass" className="py-16">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="mb-4 rounded-full bg-muted/30 p-4">
                                    <AlertCircleIcon className="h-8 w-8 text-muted-foreground/30" />
                                </div>
                                <p className="text-lg font-medium text-muted-foreground">No projects found</p>
                                {(search || filters.status) && (
                                    <p className="mt-1 text-sm text-muted-foreground/60">Try adjusting your search criteria</p>
                                )}
                            </div>
                        </EnhancedCard>
                    )}

                    {/* Pagination */}
                    <PaginationControls 
                        data={{
                            current_page: projects.meta?.current_page || 1,
                            last_page: projects.meta?.last_page || 1,
                            from: projects.meta?.from,
                            to: projects.meta?.to,
                            total: projects.meta?.total || 0,
                        }}
                        baseUrl="/admin/projects"
                        preserveFilters={{
                            search: search || undefined,
                            status: filters.status || undefined,
                        }}
                    />
                </div>
            </FuturisticBackground>
        </AppLayout>
    );
}
