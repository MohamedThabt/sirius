import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import ProjectsIndexSidebar from '@/components/Projects/ProjectsIndexSidebar';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type SharedData, type Project, type Invitation } from '@/types';
import { getStatusColor } from '@/utils/status-colors';
import { Head, router, usePage } from '@inertiajs/react';
import {
    CalendarIcon,
    CheckCircleIcon,
    CircleIcon,
    ClockIcon,
    EditIcon,
    FolderIcon,
    PlusIcon,
    SearchIcon,
    TrashIcon,
    XIcon,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

// WHY: Using shared types from @/types instead of duplicate definitions

// Invitation type now imported from @/types

interface Props {
    projects: Project[];
    invitations: Invitation[];
    search?: string;
}

export default function ProjectsIndex({ projects, invitations, search }: Props) {
    // Handle flash messages and convert them to toasts
    useFlashToasts();
    const { auth } = usePage<SharedData>().props;
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const debounceRef = useRef<number | undefined>(undefined);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deletingProject, setDeletingProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        status: 'draft',
    });

    const handleSearch = () => {
        router.get('/projects', { search: searchTerm }, { preserveState: true });
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        if (debounceRef.current !== undefined) {
            window.clearTimeout(debounceRef.current);
        }
        debounceRef.current = window.setTimeout(() => {
            router.get('/projects', { search: value }, { preserveState: true, replace: true });
        }, 300);
    };

    const handleCreate = () => {
        router.post('/projects', formData, {
            onStart: () => setIsCreating(true),
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setFormData({ name: '', status: 'draft' });
            },
            onFinish: () => setIsCreating(false),
        });
    };

    const handleEdit = () => {
        if (editingProject) {
            router.put(`/projects/${editingProject.id}`, formData, {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setEditingProject(null);
                    setFormData({ name: '', status: 'draft' });
                },
            });
        }
    };

    const handleDelete = () => {
        if (deletingProject) {
            router.delete(`/projects/${deletingProject.id}`, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setDeletingProject(null);
                },
            });
        }
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setFormData({ name: project.name, status: project.status });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (project: Project) => {
        setDeletingProject(project);
        setIsDeleteModalOpen(true);
    };

    // getStatusColor now imported from @/utils/status-colors

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <CircleIcon className="h-3.5 w-3.5" />;
            case 'in_progress':
                return <ClockIcon className="h-3.5 w-3.5" />;
            case 'completed':
                return <CheckCircleIcon className="h-3.5 w-3.5" />;
            default:
                return <CircleIcon className="h-3.5 w-3.5" />;
        }
    };

    /**
     * WHY useMemo: Previously, getProjectStats() was called on every render,
     * iterating the projects array 3 times for each render cycle.
     * With useMemo, we only recalculate when projects array changes.
     */
    const stats = useMemo(() => {
        const total = projects.length;
        const completed = projects.filter((p) => p.status === 'completed').length;
        const inProgress = projects.filter((p) => p.status === 'in_progress').length;
        const draft = projects.filter((p) => p.status === 'draft').length;

        return { total, completed, inProgress, draft };
    }, [projects]);

    return (
        <>
            <Head title="My Projects" />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectsIndexSidebar
                        auth={auth}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        onCreateProject={() => setIsCreateModalOpen(true)}
                        projectCount={projects.length}
                        invitationsCount={invitations?.length || 0}
                        projects={projects}
                        currentPage="projects"
                    />

                    <main className="min-w-0 flex-1">
                        <div className="py-8 pr-4 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">
                            <div className="mb-8 flex items-center gap-3">
                                <SidebarToggle 
                                    isCollapsed={isSidebarCollapsed} 
                                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                                />
                                <Breadcrumbs breadcrumbs={[{ title: 'Projects', href: '/projects' }]} />
                            </div>

                            <PageHeader
                                title="My Projects"
                                description="Manage and organize your software development projects"
                                size="large"
                                animated
                                action={
                                    <Button 
                                        onClick={() => setIsCreateModalOpen(true)} 
                                        className="gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        New Project
                                    </Button>
                                }
                                className="mb-10"
                            />

                            {/* Stats Section */}
                            <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                <StatCard
                                    icon={FolderIcon}
                                    title="Total Projects"
                                    value={stats.total}
                                    subtitle="All your projects"
                                    colorTheme="blue"
                                />
                                <StatCard
                                    icon={CheckCircleIcon}
                                    title="Completed"
                                    value={stats.completed}
                                    subtitle="Successfully finished"
                                    colorTheme="emerald"
                                />
                                <StatCard
                                    icon={ClockIcon}
                                    title="In Progress"
                                    value={stats.inProgress}
                                    subtitle="Currently active"
                                    colorTheme="orange"
                                />
                            </div>

                            {/* Search Bar */}
                            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                                <div className="relative max-w-md">
                                    <SearchIcon className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-primary" />
                                    <Input
                                        placeholder="Search projects..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="peer h-11 pl-10 pr-10 text-sm shadow-sm focus:shadow-md transition-all duration-300 border-border/50 focus:border-primary/50"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => handleSearchChange('')}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <XIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Projects Grid */}
                            {!projects || projects.length === 0 ? (
                                <EmptyState
                                    icon={FolderIcon}
                                    title="No projects yet"
                                    description="Create your first project to get started with AI-powered development"
                                    variant="dashed"
                                    action={{
                                        label: 'Create New Project',
                                        onClick: () => setIsCreateModalOpen(true),
                                        icon: PlusIcon,
                                    }}
                                />
                            ) : (
                                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                    {projects.map((project, index) => (
                                        <div
                                            key={project.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => router.get(`/projects/${project.id}`)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') router.get(`/projects/${project.id}`);
                                            }}
                                            title={`${project.name} • Status: ${project.status.replace('_', ' ')}`}
                                            aria-label={`Project ${project.name} with status ${project.status.replace('_', ' ')}`}
                                            className="group relative cursor-pointer rounded-xl bg-gradient-to-br from-background to-muted/20 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border/50 hover:border-primary/30 animate-in fade-in slide-in-from-bottom-4"
                                            style={{ animationDelay: `${index * 50}ms`, animationDuration: '500ms' }}
                                        >
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/0 transition-all duration-300" />
                                            
                                            <div className="relative">
                                                <div className="mb-4 flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-3 flex items-center gap-2.5">
                                                            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-2 shrink-0 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                                                                <FolderIcon className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <h3 className="line-clamp-2 text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                                                                {project.name}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 shrink-0">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary backdrop-blur-sm bg-background/50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditModal(project);
                                                            }}
                                                        >
                                                            <EditIcon className="h-3.5 w-3.5" />
                                                            <span className="sr-only">Edit project</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 backdrop-blur-sm bg-background/50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDeleteModal(project);
                                                            }}
                                                        >
                                                            <TrashIcon className="h-3.5 w-3.5" />
                                                            <span className="sr-only">Delete project</span>
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="mb-4 flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium shadow-sm ${getStatusColor(project.status)}`}
                                                    >
                                                        {getStatusIcon(project.status)}
                                                        <span className="capitalize">{project.status.replace('_', ' ')}</span>
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <CalendarIcon className="h-3.5 w-3.5" />
                                                    <span>
                                                        {new Date(project.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Create Project Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Create New Project</DialogTitle>
                        <DialogDescription>Add a new project to your portfolio</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Project Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter project name"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && formData.name.trim() && !isCreating) {
                                        e.preventDefault();
                                        handleCreate();
                                    }
                                }}
                                className="h-11"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreate} 
                            disabled={!formData.name.trim() || isCreating}
                            className="bg-gradient-to-r from-primary to-primary/90"
                        >
                            {isCreating ? 'Creating...' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Project Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Edit Project</DialogTitle>
                        <DialogDescription>Update project details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Project Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter project name"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && formData.name.trim()) {
                                        e.preventDefault();
                                        handleEdit();
                                    }
                                }}
                                className="h-11"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                <SelectTrigger className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleEdit} 
                            disabled={!formData.name.trim()}
                            className="bg-gradient-to-r from-primary to-primary/90"
                        >
                            Update Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Project Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent
                    className="sm:max-w-md"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleDelete();
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl">Delete Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingProject?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} variant="destructive">
                            Delete Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
