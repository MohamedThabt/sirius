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
    XIcon,
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
                return 'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-700 border-orange-200/50 dark:from-orange-500/15 dark:to-orange-500/5 dark:text-orange-300 dark:border-orange-500/20';
            case 'in_progress':
                return 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 border-blue-200/50 dark:from-blue-500/15 dark:to-blue-500/5 dark:text-blue-300 dark:border-blue-500/20';
            case 'review':
                return 'bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-700 border-yellow-200/50 dark:from-yellow-500/15 dark:to-yellow-500/5 dark:text-yellow-300 dark:border-yellow-500/20';
            case 'completed':
                return 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200/50 dark:from-emerald-500/15 dark:to-emerald-500/5 dark:text-emerald-300 dark:border-emerald-500/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

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
                        projects={projects}
                        currentPage="projects"
                    />

                    <main className="min-w-0 flex-1">
                        <div className="py-8 pr-4 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">
                            <div className="mb-8 flex items-center gap-3">
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

                            <header className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                            My Projects
                                        </h1>
                                        <p className="text-base text-muted-foreground max-w-2xl">
                                            Manage and organize your software development projects
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={() => setIsCreateModalOpen(true)} 
                                        className="gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        New Project
                                    </Button>
                                </div>
                            </header>

                            {/* Stats Section */}
                            <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                {/* Total Projects Stat */}
                                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-border/50">
                                    <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full blur-2xl transition-all duration-300 group-hover:bg-blue-500/10" />
                                    <div className="relative">
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 shadow-lg shadow-blue-500/25">
                                                <FolderIcon className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">Total Projects</span>
                                        </div>
                                        <div className="mb-1 text-3xl font-bold text-foreground">{stats.total}</div>
                                        <p className="text-xs text-muted-foreground">All your projects</p>
                                    </div>
                                </div>

                                {/* Completed Stat */}
                                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-border/50">
                                    <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl transition-all duration-300 group-hover:bg-emerald-500/10" />
                                    <div className="relative">
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 shadow-lg shadow-emerald-500/25">
                                                <CheckCircleIcon className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">Completed</span>
                                        </div>
                                        <div className="mb-1 text-3xl font-bold text-foreground">{stats.completed}</div>
                                        <p className="text-xs text-muted-foreground">Successfully finished</p>
                                    </div>
                                </div>

                                {/* Active Stat */}
                                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-border/50">
                                    <div className="absolute top-0 right-0 h-24 w-24 bg-orange-500/5 rounded-full blur-2xl transition-all duration-300 group-hover:bg-orange-500/10" />
                                    <div className="relative">
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 shadow-lg shadow-orange-500/25">
                                                <ClockIcon className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">In Progress</span>
                                        </div>
                                        <div className="mb-1 text-3xl font-bold text-foreground">{stats.inProgress}</div>
                                        <p className="text-xs text-muted-foreground">Currently active</p>
                                    </div>
                                </div>
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
                                <div className="flex min-h-[400px] items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                                    <div className="max-w-md rounded-2xl border border-dashed border-border/50 bg-muted/20 p-12 text-center backdrop-blur-sm">
                                        <div className="mb-6 flex justify-center">
                                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/10 animate-pulse">
                                                <FolderIcon className="h-10 w-10 text-primary" />
                                            </div>
                                        </div>
                                        <h3 className="mb-3 text-xl font-semibold text-foreground">No projects yet</h3>
                                        <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                                            Create your first project to get started with AI-powered development
                                        </p>
                                        <Button 
                                            className="gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105" 
                                            onClick={() => setIsCreateModalOpen(true)}
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                            Create New Project
                                        </Button>
                                    </div>
                                </div>
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
