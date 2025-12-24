import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Breadcrumbs } from '@/components/breadcrumbs';
import CreateModuleModal from '@/components/Modules/CreateModuleModal';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SyncIndicator } from '@/components/SyncIndicator';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type Project, type SharedData, type User } from '@/types';
import type { ModuleItem } from '@/types/modules';
import { getModuleStatusConfig } from '@/utils/statusHelpers';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, CircleIcon, ClockIcon, Layers, Plus, Trash2, TrendingUp } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

// Progress bar component
function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
    return (
        <div className={`h-2 w-full overflow-hidden rounded-full bg-muted ${className}`}>
            <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
}

interface Props {
    project: Project;
    modules: ModuleItem[];
}

export default function ModulesIndex({ project, modules }: Props) {
    useFlashToasts();
    const shared = usePage<SharedData>().props;
    const { auth } = shared;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState<ModuleItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirmDelete = () => {
        if (!moduleToDelete) return;
        
        setIsDeleting(true);
        router.delete(`/projects/${project.id}/modules/${moduleToDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setModuleToDelete(null);
            },
        });
    };

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Modules', href: `/projects/${project.id}/modules` },
    ];

    const navGroups = useMemo(
        () =>
            buildProjectNavGroups({
                project,
                currentPage: 'modules',
            }),
        [project],
    );

    // WHY: Memoize counts to avoid recalculating on every render.
    // Previously, modules.filter() was called 9+ times in the JSX.
    const moduleCounts = useMemo(() => ({
        total: modules.length,
        completed: modules.filter((m) => m.status === 'completed').length,
        inProgress: modules.filter((m) => m.status === 'in_progress').length,
        planned: modules.filter((m) => m.status === 'planned').length,
    }), [modules]);

    const completionPercentage = useMemo(
        () => moduleCounts.total > 0 
            ? Math.round((moduleCounts.completed / moduleCounts.total) * 100) 
            : 0,
        [moduleCounts]
    );

    // WHY: useCallback prevents recreating handler on each render.
    // This handler is passed to child components (delete button).
    const handleDeleteClick = useCallback((e: React.MouseEvent, module: ModuleItem) => {
        e.stopPropagation();
        setModuleToDelete(module);
    }, []);

    return (
        <>
            <Head title={`Modules - ${project.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectSidebarPanel
                        project={project}
                        navGroups={navGroups}
                        isCollapsed={isSidebarCollapsed}
                        user={auth.user as User}
                    />

                    <main className="flex min-w-0 flex-1 flex-col">
                        <div className="shrink-0 border-b border-border/50 bg-muted/20 px-4 py-3 sm:px-6">
                            <div className="flex items-center gap-3">
                                <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="py-8 pr-4 pb-32 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">

                        <header className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.visit(`/projects/${project.id}`)}
                                            className="gap-2"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Back to Project
                                        </Button>
                                    </div>
                                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{project.name} - Modules</h1>
                                    <p className="mt-1 text-sm text-muted-foreground">DDD bounded contexts and system architecture</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button onClick={() => setIsCreateModuleModalOpen(true)} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Module
                                    </Button>
                                </div>
                            </div>
                        </header>

                        {modules.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-12 text-center">
                                <Layers className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-4 text-sm font-medium text-foreground">No modules yet</p>
                                <p className="mt-1 text-xs text-muted-foreground">Add your first module to get started</p>
                                <div className="mt-6">
                                    <Button onClick={() => setIsCreateModuleModalOpen(true)} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Module
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Insights Section */}
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {/* Total Modules */}
                                    <div className="rounded-lg border border-border bg-card p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-primary/10 p-2">
                                                <Layers className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-foreground">{modules.length}</p>
                                                <p className="text-xs text-muted-foreground">Total Modules</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Completed */}
                                    <div className="rounded-lg border border-border bg-card p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-green-100 p-2 dark:bg-green-500/10">
                                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-foreground">
                                                    {moduleCounts.completed}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Completed</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* In Progress */}
                                    <div className="rounded-lg border border-border bg-card p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-500/10">
                                                <ClockIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-foreground">
                                                    {moduleCounts.inProgress}
                                                </p>
                                                <p className="text-xs text-muted-foreground">In Progress</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Planned */}
                                    <div className="rounded-lg border border-border bg-card p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-500/10">
                                                <CircleIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-foreground">
                                                    {moduleCounts.planned}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Planned</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Overview */}
                                <div className="rounded-lg border border-border bg-card p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-primary" />
                                            <h3 className="font-semibold text-foreground">Progress Overview</h3>
                                        </div>
                                        <span className="text-sm font-medium text-primary">
                                            {completionPercentage}% Complete
                                        </span>
                                    </div>
                                    <ProgressBar 
                                        value={completionPercentage} 
                                        className="mb-3"
                                    />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                                <span>Completed ({moduleCounts.completed})</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                <span>In Progress ({moduleCounts.inProgress})</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full bg-orange-500" />
                                                <span>Planned ({moduleCounts.planned})</span>
                                            </div>
                                        </div>
                                        <span>{moduleCounts.completed} of {moduleCounts.total} modules</span>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {modules.map((module) => {
                                        const statusConfig = getModuleStatusConfig(module.status);
                                        const StatusIcon = statusConfig.icon;
                                        
                                        return (
                                            <div
                                                key={module.id}
                                                className="relative"
                                            >
                                                <SyncIndicator isSynced={module.erd_is_synced} className="z-10" />
                                                <div
                                                    className="group cursor-pointer rounded-lg border-2 border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                    onClick={() => router.visit(`/projects/${project.id}/modules/${module.id}`)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => e.key === 'Enter' && router.visit(`/projects/${project.id}/modules/${module.id}`)}
                                                    aria-label={`View module ${module.name}`}
                                                >
                                                    <div className="mb-4 flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <StatusIcon className="h-4 w-4" />
                                                                <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
                                                                    {module.name}
                                                                </h3>
                                                            </div>
                                                            {module.description && (
                                                                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{module.description}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Badge className={`border text-xs font-medium ${statusConfig.color}`}>
                                                                <StatusIcon className="h-3 w-3" />
                                                                <span className="ml-1">{statusConfig.label}</span>
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                #{module.order_of_implementation}
                                                            </Badge>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={(e) => handleDeleteClick(e, module)}
                                                            disabled={isDeleting && moduleToDelete?.id === module.id}
                                                            aria-label={`Delete module ${module.name}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <AlertDialog open={!!moduleToDelete} onOpenChange={(open) => !open && setModuleToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Module</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold">"{moduleToDelete?.name}"</span>? 
                            This will also delete all features associated with this module. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <CreateModuleModal
                open={isCreateModuleModalOpen}
                onOpenChange={setIsCreateModuleModalOpen}
                projectId={project.id}
            />
        </>
    );
}
