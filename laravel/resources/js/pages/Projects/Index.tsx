import { Breadcrumbs } from '@/components/breadcrumbs';
import { ClientDateTime } from '@/components/ClientDateTime';
import ProjectsIndexSidebar from '@/components/Projects/ProjectsIndexSidebar';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { createProjectSchema, updateProjectSchema } from '@/lib/validations';
import { type Invitation, type Project, type SharedData } from '@/types';
import { getStatusColor } from '@/utils/status-colors';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
    CalendarIcon,
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
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const clearValidationError = (field: string) => {
        if (validationErrors[field]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

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
        // Validate with Zod schema
        const result = createProjectSchema.safeParse({ name: formData.name });
        if (!result.success) {
            const errors: { [key: string]: string } = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) {
                    errors[err.path[0] as string] = err.message;
                }
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
        if (editingProject) {
            // Validate with Zod schema
            const result = updateProjectSchema.safeParse(formData);
            if (!result.success) {
                const errors: { [key: string]: string } = {};
                result.error.errors.forEach((err) => {
                    if (err.path[0]) {
                        errors[err.path[0] as string] = err.message;
                    }
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
        setValidationErrors({});
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
                                            auth={auth}
                                            isSidebarCollapsed={false}
                                            onCreateProject={() => setIsCreateModalOpen(true)}
                                            projectCount={projects.length}
                                            invitationsCount={invitations?.length || 0}
                                            projects={projects}
                                            currentPage="projects"
                                            isMobileSheet={true}
                                        />
                                    </SheetContent>
                                </Sheet>
                                <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
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
                                        className="gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        New Project
                                    </Button>
                                }
                                className="mb-10"
                            />

                            {/* Search Bar */}
                            <div className="mb-8 delay-200 duration-700 animate-in fade-in slide-in-from-bottom-4">
                                <div className="relative max-w-md">
                                    <SearchIcon className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-primary" />
                                    <Input
                                        placeholder="Search projects..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="peer h-11 border-border/50 pr-10 pl-10 text-sm shadow-sm transition-all duration-300 focus:border-primary/50 focus:shadow-md"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => handleSearchChange('')}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
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
                                            className="group relative cursor-pointer rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/20 p-5 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                                            style={{ animationDelay: `${index * 50}ms`, animationDuration: '500ms' }}
                                        >
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 to-primary/0 transition-all duration-300 group-hover:from-primary/5 group-hover:to-primary/0" />

                                            <div className="relative">
                                                <div className="mb-4 flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-3 flex items-center gap-2.5">
                                                            <div className="shrink-0 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-2 transition-all duration-300 group-hover:from-primary/20 group-hover:to-primary/10">
                                                                <FolderIcon className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <h3 className="line-clamp-2 text-base font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                                                                {project.name}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    <div className="flex shrink-0 gap-1 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:text-primary"
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
                                                            className="h-8 w-8 bg-background/50 text-destructive backdrop-blur-sm hover:bg-destructive/10"
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
                                                    <ClientDateTime value={project.created_at} dateStyle="medium" />
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
