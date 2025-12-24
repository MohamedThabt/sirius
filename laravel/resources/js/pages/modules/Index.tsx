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
import { EmptyState } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/progress';
import { SyncIndicator } from '@/components/SyncIndicator';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type Project, type SharedData, type User } from '@/types';
import type { ModuleItem } from '@/types/modules';
import { getModuleStatusConfig } from '@/utils/statusHelpers';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Layers, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';


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
                            <EmptyState
                                icon={Layers}
                                title="No modules yet"
                                description="Add your first module to get started with your project's architecture."
                                action={{
                                    label: 'Add Module',
                                    onClick: () => setIsCreateModuleModalOpen(true),
                                    icon: Plus,
                                }}
                                variant="dashed"
                            />
                        ) : (
                            <div className="space-y-8">
                                {/* Minimal Stats Bar */}
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-semibold text-foreground">{modules.length}</span>
                                        <span className="text-muted-foreground">modules</span>
                                    </div>
                                    <div className="h-4 w-px bg-border" />
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="text-muted-foreground">{moduleCounts.completed} done</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            <span className="text-muted-foreground">{moduleCounts.inProgress} active</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                                            <span className="text-muted-foreground">{moduleCounts.planned} planned</span>
                                        </div>
                                    </div>
                                    {completionPercentage > 0 && (
                                        <>
                                            <div className="h-4 w-px bg-border" />
                                            <div className="flex items-center gap-2">
                                                <Progress value={completionPercentage} className="w-24 h-1.5" />
                                                <span className="text-xs font-medium text-muted-foreground">{completionPercentage}%</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Module Cards Grid */}
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {modules.map((module) => {
                                        const statusConfig = getModuleStatusConfig(module.status);
                                        const StatusIcon = statusConfig.icon;
                                        
                                        // Determine icon color based on status
                                        const iconColorClass = module.status === 'completed' 
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                            : module.status === 'in_progress'
                                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
                                        
                                        return (
                                            <div
                                                key={module.id}
                                                className="group relative"
                                            >
                                                <SyncIndicator isSynced={module.erd_is_synced} className="z-10" />
                                                <div
                                                    className="flex h-full cursor-pointer flex-col rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm transition-all duration-200 ease-out hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    onClick={() => router.visit(`/projects/${project.id}/modules/${module.id}`)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => e.key === 'Enter' && router.visit(`/projects/${project.id}/modules/${module.id}`)}
                                                    aria-label={`View module ${module.name}`}
                                                >
                                                    {/* Header with colored icon */}
                                                    <div className="mb-3 flex items-start justify-between gap-3">
                                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconColorClass}`}>
                                                            <Layers className="h-5 w-5" />
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            onClick={(e) => handleDeleteClick(e, module)}
                                                            disabled={isDeleting && moduleToDelete?.id === module.id}
                                                            aria-label={`Delete module ${module.name}`}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                    
                                                    {/* Content */}
                                                    <div className="flex-1">
                                                        <h3 className="text-base font-medium text-foreground transition-colors group-hover:text-primary">
                                                            {module.name}
                                                        </h3>
                                                        {module.description && (
                                                            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground/80 leading-relaxed">
                                                                {module.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Footer with status */}
                                                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40">
                                                        <div className="flex items-center gap-1.5">
                                                            <StatusIcon className={`h-3.5 w-3.5 ${
                                                                module.status === 'completed' ? 'text-emerald-500' :
                                                                module.status === 'in_progress' ? 'text-blue-500' : 'text-amber-500'
                                                            }`} />
                                                            <span className="text-xs font-medium text-muted-foreground">
                                                                {statusConfig.label}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground/60">
                                                            #{module.order_of_implementation}
                                                        </span>
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
