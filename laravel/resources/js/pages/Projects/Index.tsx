import { ClientDateTime } from '@/components/ClientDateTime';
import ProjectsIndexSidebar from '@/components/Projects/ProjectsIndexSidebar';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { cn } from '@/lib/utils';
import { createProjectSchema, updateProjectSchema } from '@/lib/validations';
import { type Invitation, type Project, type SharedData, type User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
    CheckCircleIcon,
    CircleIcon,
    ClockIcon,
    EditIcon,
    FolderIcon,
    MenuIcon,
    PlusIcon,
    SearchIcon,
    TrashIcon,
    XIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    projects: Project[];
    invitations: Invitation[];
    search?: string;
}

const statusConfig: Record<string, { label: string; dot: string; icon: typeof CircleIcon }> = {
    draft: { label: 'Draft', dot: 'bg-muted-foreground', icon: CircleIcon },
    in_progress: { label: 'In Progress', dot: 'bg-blue-500', icon: ClockIcon },
    completed: { label: 'Completed', dot: 'bg-emerald-500', icon: CheckCircleIcon },
};

function ProjectsIndex({ projects, search }: Props) {
    useFlashToasts();
    const shared = usePage<SharedData>().props;
    const { auth } = shared;
    const sidebarAuth = { user: auth.user as User };
    const sidebarProjects = (shared.projects as { id: number; name: string; status?: string }[] | undefined) || [];
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState(search || '');
    const debounceRef = useRef<number | undefined>(undefined);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deletingProject, setDeletingProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState({ name: '', status: 'draft' });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const handleOpenModal = () => setIsCreateModalOpen(true);
        window.addEventListener('open-create-project-modal', handleOpenModal);
        return () => window.removeEventListener('open-create-project-modal', handleOpenModal);
    }, []);

    const clearValidationError = (field: string) => {
        if (validationErrors[field]) {
            setValidationErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        if (debounceRef.current !== undefined) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            router.get('/projects', { search: value }, { preserveState: true, replace: true });
        }, 300);
    };

    const handleCreate = () => {
        const result = createProjectSchema.safeParse({ name: formData.name });
        if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) errors[err.path[0] as string] = err.message;
            });
            setValidationErrors(errors);
            return;
        }
        setValidationErrors({});
        router.post('/projects', formData, {
            onStart: () => setIsCreating(true),
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setFormData({ name: '', status: 'draft' });
                setValidationErrors({});
            },
            onFinish: () => setIsCreating(false),
        });
    };

    const handleEdit = () => {
        if (!editingProject) return;
        const result = updateProjectSchema.safeParse(formData);
        if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) errors[err.path[0] as string] = err.message;
            });
            setValidationErrors(errors);
            return;
        }
        setValidationErrors({});
        router.put(`/projects/${editingProject.id}`, formData, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingProject(null);
                setFormData({ name: '', status: 'draft' });
                setValidationErrors({});
            },
        });
    };

    const handleDelete = () => {
        if (!deletingProject) return;
        router.delete(`/projects/${deletingProject.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setDeletingProject(null);
            },
        });
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setFormData({ name: project.name, status: project.status });
        setValidationErrors({});
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (project: Project) => {
        setDeletingProject(project);
        setIsDeleteModalOpen(true);
    };

    return (
        <>
            <Head title="My Projects" />

            <div className="flex">
                <ProjectsIndexSidebar
                    auth={sidebarAuth}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    onCreateProject={() => setIsCreateModalOpen(true)}
                    projectCount={projects.length}
                    projects={sidebarProjects}
                    currentPage="projects"
                />
                <main className="min-w-0 flex-1">
                    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
                        <div className="border-b bg-muted/30">
                            <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6 lg:px-8">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 border border-border/50 bg-background p-0 hover:bg-muted lg:hidden"
                                                >
                                                    <MenuIcon className="h-4 w-4" />
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent side="left" className="w-64 border-none bg-transparent p-0">
                                                <ProjectsIndexSidebar
                                                    auth={sidebarAuth}
                                                    isSidebarCollapsed={false}
                                                    onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                                    onCreateProject={() => setIsCreateModalOpen(true)}
                                                    projectCount={projects.length}
                                                    projects={sidebarProjects}
                                                    currentPage="projects"
                                                    isMobileSheet={true}
                                                />
                                            </SheetContent>
                                        </Sheet>
                                        <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                                        <div>
                                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Projects</h1>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        size="sm"
                                        className="gap-1.5"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        New Project
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                            <div className="mb-6">
                                <div className="relative max-w-sm">
                                    <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search projects..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && router.get('/projects', { search: searchTerm }, { preserveState: true })}
                                        className="h-9 pl-9 pr-8 text-sm"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => handleSearchChange('')}
                                            className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                                        >
                                            <XIcon className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {!projects || projects.length === 0 ? (
                                <EmptyState
                                    icon={FolderIcon}
                                    title="No projects yet"
                                    description="Create your first project to get started"
                                    variant="dashed"
                                    action={{
                                        label: 'Create Project',
                                        onClick: () => setIsCreateModalOpen(true),
                                        icon: PlusIcon,
                                    }}
                                />
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {projects.map((project) => {
                                        const config = statusConfig[project.status] || statusConfig.draft;
                                        const progress = project.progress ?? 0;

                                        return (
                                            <div
                                                key={project.id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => router.get(`/projects/${project.id}`)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') router.get(`/projects/${project.id}`); }}
                                                aria-label={`Project ${project.name}`}
                                                className="group relative flex cursor-pointer flex-col rounded-xl border border-border/60 bg-card p-6 transition-colors duration-150 hover:border-border hover:bg-accent/30"
                                            >
                                                <div className="mb-4 flex items-start justify-between gap-3">
                                                    <h3 className="line-clamp-1 text-lg font-medium text-foreground">
                                                        {project.name}
                                                    </h3>
                                                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            onClick={(e) => { e.stopPropagation(); openEditModal(project); }}
                                                        >
                                                            <EditIcon className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={(e) => { e.stopPropagation(); openDeleteModal(project); }}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {project.brief && (
                                                    <p className="mb-5 line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
                                                        {project.brief}
                                                    </p>
                                                )}

                                                {progress > 0 && (
                                                    <div className="mb-5">
                                                        <div className="mb-1.5 flex items-center justify-between">
                                                            <span className="text-[13px] text-muted-foreground">Progress</span>
                                                            <span className="text-[13px] font-medium text-muted-foreground">{progress}%</span>
                                                        </div>
                                                        <Progress
                                                            value={progress}
                                                            className="h-1.5"
                                                            indicatorClassName={cn(
                                                                progress >= 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-primary' : 'bg-primary/70',
                                                            )}
                                                        />
                                                    </div>
                                                )}

                                                <div className="mt-auto flex items-center justify-between pt-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn('h-2.5 w-2.5 rounded-full', config.dot)} />
                                                        <span className="text-[13px] text-muted-foreground">{config.label}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground/60">
                                                        <ClientDateTime value={project.created_at} dateStyle="medium" />
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Create New Project</DialogTitle>
                        <DialogDescription>Add a new project to your portfolio</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">Project Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    clearValidationError('name');
                                }}
                                placeholder="Enter project name"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && formData.name.trim() && !isCreating) {
                                        e.preventDefault();
                                        handleCreate();
                                    }
                                }}
                                className={`h-11 ${validationErrors.name ? 'border-red-500' : ''}`}
                                maxLength={255}
                            />
                            {validationErrors.name && (
                                <div className="mt-1 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                    <AlertCircleIcon className="h-4 w-4" />
                                    {validationErrors.name}
                                </div>
                            )}
                            <div className="mt-1 text-xs text-muted-foreground">{formData.name.length}/255 characters</div>
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
                            <label className="mb-2 block text-sm font-medium text-foreground">Project Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    clearValidationError('name');
                                }}
                                placeholder="Enter project name"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && formData.name.trim()) {
                                        e.preventDefault();
                                        handleEdit();
                                    }
                                }}
                                className={`h-11 ${validationErrors.name ? 'border-red-500' : ''}`}
                                maxLength={255}
                            />
                            {validationErrors.name && (
                                <div className="mt-1 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                    <AlertCircleIcon className="h-4 w-4" />
                                    {validationErrors.name}
                                </div>
                            )}
                            <div className="mt-1 text-xs text-muted-foreground">{formData.name.length}/255 characters</div>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">Status</label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => {
                                    setFormData({ ...formData, status: value });
                                    clearValidationError('status');
                                }}
                            >
                                <SelectTrigger className={`h-11 ${validationErrors.status ? 'border-red-500' : ''}`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            {validationErrors.status && (
                                <div className="mt-1 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                    <AlertCircleIcon className="h-4 w-4" />
                                    {validationErrors.status}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEdit} disabled={!formData.name.trim()} className="bg-gradient-to-r from-primary to-primary/90">
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

export default ProjectsIndex;
