import { Breadcrumbs } from '@/components/breadcrumbs';
import CreateFeatureModal from '@/components/Features/CreateFeatureModal';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
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
    Plus,
    ZapIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface Project {
    id: number;
    name: string;
    brief: string;
    overview: string;
    status: string;
    c4?: string | null;
}

interface FeatureItem {
    id: number;
    name: string;
    summary: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'draft' | 'in_progress' | 'completed' | 'archived';
    order_of_implementation: number;
    acceptance_criteria?: string | null;
    user_flows?: string | null;
    metrics?: string | null;
    description?: string | null;
}

interface Props {
    project: Project;
    features: FeatureItem[];
}

export default function FeaturesIndex({ project, features }: Props) {
    useFlashToasts();
    const shared = usePage<SharedData>().props;
    const { auth } = shared;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isCreateFeatureModalOpen, setIsCreateFeatureModalOpen] = useState(false);

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Features', href: `/projects/${project.id}/features` },
    ];

    const navGroups = useMemo(
        () =>
            buildProjectNavGroups({
                project,
                currentPage: 'features',
            }),
        [project.id],
    );

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
            case 'medium':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
            case 'low':
                return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30';
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
                return <CheckCircle2 className="h-4 w-4" />;
            default:
                return <CircleIcon className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <>
            <Head title={`Features - ${project.name}`} />

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
                                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{project.name} - Features</h1>
                                    <p className="mt-1 text-sm text-muted-foreground">Manage and track project features</p>
                                </div>
                                <Button onClick={() => setIsCreateFeatureModalOpen(true)} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Feature
                                </Button>
                            </div>
                        </header>

                        {features.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-12 text-center">
                                <ZapIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-4 text-sm font-medium text-foreground">No features yet</p>
                                <p className="mt-1 text-xs text-muted-foreground">Create your first feature to begin breaking down the project</p>
                                <Button onClick={() => setIsCreateFeatureModalOpen(true)} className="mt-6 gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Feature
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm text-muted-foreground">
                                            <span className="font-semibold text-foreground">{features.length}</span> features total
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <span className="font-semibold text-foreground">
                                                {features.filter((f) => f.status === 'completed').length}
                                            </span>{' '}
                                            completed
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {features.map((feature) => (
                                        <div
                                            key={feature.id}
                                            className="group cursor-pointer rounded-lg border-2 border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
                                            onClick={() => router.visit(`/features/${feature.id}`)}
                                        >
                                            <div className="mb-4 flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(feature.status)}
                                                        <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
                                                            {feature.name}
                                                        </h3>
                                                    </div>
                                                    {feature.summary && (
                                                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{feature.summary}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge className={`border text-xs font-medium ${getStatusColor(feature.status)}`}>
                                                    {getStatusIcon(feature.status)}
                                                    <span className="ml-1">{feature.status === 'in_progress' ? 'In Progress' : feature.status}</span>
                                                </Badge>
                                                <Badge className={`border text-xs font-medium capitalize ${getPriorityColor(feature.priority)}`}>
                                                    {feature.priority}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    #{feature.order_of_implementation}
                                                </Badge>
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

            <CreateFeatureModal
                open={isCreateFeatureModalOpen}
                onOpenChange={setIsCreateFeatureModalOpen}
                projectId={project.id}
            />
        </>
    );
}

