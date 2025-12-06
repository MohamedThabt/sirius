import { Breadcrumbs } from '@/components/breadcrumbs';
import CreateModuleModal from '@/components/Modules/CreateModuleModal';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type SharedData, type User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    CircleIcon,
    ClockIcon,
    Layers,
    Plus,
    TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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

interface Project {
    id: number;
    name: string;
    brief: string;
    overview: string;
    status: string;
    c4?: string | null;
}

interface ModuleItem {
    id: number;
    name: string;
    description: string;
    metrics: string | null;
    erd_is_synced?: boolean;
    status: 'planned' | 'in_progress' | 'completed';
    order_of_implementation: number;
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
        [project.id],
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'planned':
                return <CircleIcon className="h-4 w-4" />;
            case 'in_progress':
                return <ClockIcon className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle2 className="h-4 w-4" />;
            default:
                return <CircleIcon className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'planned':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const formatStatus = (status: string) => {
        switch (status) {
            case 'in_progress':
                return 'In Progress';
            case 'planned':
                return 'Planned';
            case 'completed':
                return 'Completed';
            default:
                return status;
        }
    };

    return (
        <>
            <Head title={`Modules - ${project.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectSidebarPanel
                        project={project}
                        navGroups={navGroups}
                        repository={null}
                        completionPercentage={undefined}
                        health={undefined}
                        isCollapsed={isSidebarCollapsed}
                        user={auth.user as unknown as User}
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
                                                    {modules.filter((m) => m.status === 'completed').length}
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
                                                    {modules.filter((m) => m.status === 'in_progress').length}
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
                                                    {modules.filter((m) => m.status === 'planned').length}
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
                                            {modules.length > 0 
                                                ? Math.round((modules.filter((m) => m.status === 'completed').length / modules.length) * 100)
                                                : 0}% Complete
                                        </span>
                                    </div>
                                    <ProgressBar 
                                        value={modules.length > 0 
                                            ? (modules.filter((m) => m.status === 'completed').length / modules.length) * 100 
                                            : 0
                                        } 
                                        className="mb-3"
                                    />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                                <span>Completed ({modules.filter((m) => m.status === 'completed').length})</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                <span>In Progress ({modules.filter((m) => m.status === 'in_progress').length})</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full bg-orange-500" />
                                                <span>Planned ({modules.filter((m) => m.status === 'planned').length})</span>
                                            </div>
                                        </div>
                                        <span>{modules.filter((m) => m.status === 'completed').length} of {modules.length} modules</span>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {modules.map((module) => (
                                        <div
                                            key={module.id}
                                            className="relative"
                                        >
                                            {module.erd_is_synced === false && (
                                                <div 
                                                    className="absolute -top-2 -right-2 z-10 h-3 w-3 rounded-full bg-amber-500 ring-2 ring-background" 
                                                    title="Feature data models updated - ERD may need syncing"
                                                />
                                            )}
                                            <div
                                                className="group cursor-pointer rounded-lg border-2 border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
                                                onClick={() => router.visit(`/projects/${project.id}/modules/${module.id}`)}
                                            >
                                                <div className="mb-4 flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(module.status)}
                                                            <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
                                                                {module.name}
                                                            </h3>
                                                        </div>
                                                        {module.description && (
                                                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{module.description}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge className={`border text-xs font-medium ${getStatusColor(module.status)}`}>
                                                        {getStatusIcon(module.status)}
                                                        <span className="ml-1">{formatStatus(module.status)}</span>
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        #{module.order_of_implementation}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <CreateModuleModal
                open={isCreateModuleModalOpen}
                onOpenChange={setIsCreateModuleModalOpen}
                projectId={project.id}
            />
        </>
    );
}
