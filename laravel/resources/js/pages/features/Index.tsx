import { Breadcrumbs } from '@/components/breadcrumbs';
import CreateFeatureModal from '@/components/Features/CreateFeatureModal';
import ProjectsIndexSidebar from '@/components/Projects/ProjectsIndexSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { type Project, type SharedData, type User } from '@/types';
import { type FeatureItem } from '@/types/modules';
import { getPriorityColor, getStatusColor, getStatusIcon } from '@/utils/featureStatus';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, ZapIcon } from 'lucide-react';
import { useState } from 'react';

interface Props {
    project: Project;
    features: FeatureItem[];
}

export default function FeaturesIndex({ project, features }: Props) {
    const shared = usePage<SharedData>().props;
    const { auth } = shared;
    const sidebarAuth: { user: User } = { user: auth.user as unknown as User };
    const projects = (shared.projects as { id: number; name: string; status?: string }[] | undefined) || [];
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isCreateFeatureModalOpen, setIsCreateFeatureModalOpen] = useState(false);

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Features', href: `/projects/${project.id}/features` },
    ];

    return (
        <>
            <Head title={`Features - ${project.name}`} />

            <div className="flex min-h-screen bg-background">
                <ProjectsIndexSidebar
                    auth={sidebarAuth}
                    projects={projects}
                    currentProjectId={project.id}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    onCreateProject={() => router.visit('/projects')}
                    projectCount={projects.length}
                />

                <main className="min-w-0 flex-1">
                    <div className="py-8 pr-4 pb-32 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">
                        <div className="mb-6 flex items-center gap-3">
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        </div>

                        <header className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="sm" onClick={() => router.visit(`/projects/${project.id}`)} className="gap-2">
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
                                                {features.filter((f) => f.status === 'done').length}
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
                                                        {(() => { const StatusIcon = getStatusIcon(feature.status); return <StatusIcon className="h-4 w-4" />; })()}
                                                        <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
                                                            {feature.name}
                                                        </h3>
                                                    </div>
                                                    {feature.summary && (
                                                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                                            {feature.summary}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge className={`border text-xs font-medium ${getStatusColor(feature.status)}`}>
                                                    {(() => { const StatusIcon = getStatusIcon(feature.status); return <StatusIcon className="h-3 w-3" />; })()}
                                                    <span className="ml-1">{feature.status === 'in_progress' ? 'In Progress' : feature.status}</span>
                                                </Badge>
                                                <Badge className={`border text-xs font-medium capitalize ${getPriorityColor(feature.priority)}`}>
                                                    {feature.priority}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    #{feature.order_of_implementation}
                                                </Badge>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/40">
                                                <Progress value={feature.progress ?? 0} className="flex-1 h-1.5" />
                                                <span className="text-xs text-muted-foreground/60">
                                                    {feature.progress ?? 0}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <CreateFeatureModal open={isCreateFeatureModalOpen} onOpenChange={setIsCreateFeatureModalOpen} projectId={project.id} />
        </>
    );
}
