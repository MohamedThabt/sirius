import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import ProjectsIndexSidebar from '@/components/Projects/ProjectsIndexSidebar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    CalendarIcon,
    CheckCircleIcon,
    CircleIcon,
    ClockIcon,
    EditIcon,
    FolderIcon,
    PanelLeftClose,
    PanelLeftOpen,
    PlusIcon,
    SearchIcon,
    TrashIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';

interface Project {
    id: number;
    name: string;
    brief: string;
    overview: string;
    non_functional_requirements: string;
    technical_details: string;
    status: string;
    created_at: string;
    updated_at: string;
}

interface Invitation {
    id: number;
    project: {
        id: number;
        name: string;
        brief: string;
    };
    role: 'admin' | 'developer' | 'viewer';
    invited_by: {
        id: number;
        name: string;
        avatar?: string;
    } | null;
    invited_at: string;
}

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
            case 'review':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border-yellow-500/30';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <CircleIcon className="h-4 w-4" />;
            case 'in_progress':
                return <ClockIcon className="h-4 w-4" />;
            case 'completed':
                return <CheckCircleIcon className="h-4 w-4" />;
            default:
                return <CircleIcon className="h-4 w-4" />;
        }
    };

    const getProjectStats = () => {
        const total = projects.length;
        const completed = projects.filter((p) => p.status === 'completed').length;
        const inProgress = projects.filter((p) => p.status === 'in_progress').length;
        const draft = projects.filter((p) => p.status === 'draft').length;

        return { total, completed, inProgress, draft };
    };

    const stats = getProjectStats();

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
                        currentPage="projects"
                    />

                    <main className="min-w-0 flex-1">
                        <div className="py-8 pr-4 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">
                            <div className="mb-6 flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    title={isSidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
                                >
                                    {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                                </Button>
                                <Breadcrumbs breadcrumbs={[{ title: 'Projects', href: '/projects' }]} />
                            </div>

                            <header className="mb-8">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">My Projects</h1>
                                        <p className="mt-1 text-sm text-muted-foreground">Manage and organize your software development projects</p>
                                    </div>
                                    <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 shadow-sm">
                                        <PlusIcon className="h-4 w-4" />
                                        New Project
                                    </Button>
                                </div>
                            </header>

                            {/* Stats Section */}
                            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {/* Total Projects Stat */}
                                <div className="rounded border p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="rounded bg-blue-500/10 p-1.5">
                                            <FolderIcon className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground">Total Projects</span>
                                    </div>
                                    <div className="mb-2 text-2xl font-semibold text-foreground">{stats.total}</div>
                                    <p className="text-xs text-muted-foreground">All your projects</p>
                                </div>

                                {/* Completed Stat */}
                                <div className="rounded border p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="rounded bg-emerald-500/10 p-1.5">
                                            <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground">Completed</span>
                                    </div>
                                    <div className="mb-2 text-2xl font-semibold text-foreground">{stats.completed}</div>
                                    <p className="text-xs text-muted-foreground">Successfully finished</p>
                                </div>

                                {/* Active Stat */}
                                <div className="rounded border p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="rounded bg-orange-500/10 p-1.5">
                                            <ClockIcon className="h-4 w-4 text-orange-500" />
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground">In Progress</span>
                                    </div>
                                    <div className="mb-2 text-2xl font-semibold text-foreground">{stats.inProgress}</div>
                                    <p className="text-xs text-muted-foreground">Currently active</p>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative max-w-md">
                                    <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search projects..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="h-9 pl-9 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Projects Grid */}
                            {!projects || projects.length === 0 ? (
                                <div className="flex min-h-[400px] items-center justify-center">
                                    <div className="max-w-md rounded border border-dashed bg-muted/30 p-8 text-center">
                                        <div className="mb-4 flex justify-center">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                                                <FolderIcon className="h-8 w-8 text-primary" />
                                            </div>
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-foreground">No projects yet</h3>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            Create your first project to get started with AI-powered development
                                        </p>
                                        <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                                            <PlusIcon className="h-4 w-4" />
                                            Create New Project
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {projects.map((project) => (
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
                                            className="group cursor-pointer rounded border p-4 transition-all hover:bg-muted/50"
                                        >
                                            <div className="mb-4 flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <div className="rounded bg-primary/10 p-1.5 shrink-0">
                                                            <FolderIcon className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                                            {project.name}
                                                        </h3>
                                                    </div>
                                                </div>

                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
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
                                                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
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

                                            <div className="mb-3 flex items-center gap-2">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}
                                                >
                                                    {getStatusIcon(project.status)}
                                                    <span className="capitalize">{project.status.replace('_', ' ')}</span>
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <CalendarIcon className="h-3 w-3" />
                                                <span>
                                                    {new Date(project.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </span>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>Add a new project to your portfolio</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-foreground">Project Name</label>
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
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={!formData.name.trim() || isCreating}>
                            {isCreating ? 'Creating...' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Project Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>Update project details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-foreground">Project Name</label>
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
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">Status</label>
                            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                <SelectTrigger className="mt-1">
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
                        <Button onClick={handleEdit} disabled={!formData.name.trim()}>
                            Update Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Project Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleDelete();
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingProject?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
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
