import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { type User } from '@/types';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Head, router, usePage } from '@inertiajs/react';
import { CodeIcon, DatabaseIcon, LightbulbIcon, MonitorSmartphoneIcon, PanelLeftClose, PanelLeftOpen, PlugIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

interface TechnicalIntake {
    id: number;
    project_id: number;
    platform_targets: string | null;
    frontend_tech: string | null;
    backend_tech: string | null;
    database_tech: string | null;
    ai_usage: string | null;
    external_services: string | null;
    created_at: string;
    updated_at: string;
}

interface Project {
    id: number;
    name: string;
    brief: string;
    status: string;
    c4: string | null;
}

interface Sections {
    overview: string | null;
    prd: string | null;
    data_modeling: string | null;
    non_functional_requirements: string | null;
}

interface Props {
    project: Project;
    technicalIntake: TechnicalIntake | null;
    sections?: Sections;
}

export default function Technology({ project, technicalIntake, sections }: Props) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const breadcrumbs = [
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Technology Stack', href: `/projects/${project.id}/technology` },
    ];

    const completionPercentage = useMemo(() => {
        const total = 5;
        let done = 0;
        if (sections?.overview) done++;
        if (sections?.prd) done++;
        if (sections?.data_modeling) done++;
        if (project.c4) done++;
        if (sections?.non_functional_requirements) done++;
        return Math.round((done / total) * 100);
    }, [sections, project.c4]);

    const navGroups = useMemo(
        () =>
            buildProjectNavGroups({
                project,
                currentPage: 'technology',
            }),
        [project],
    );

    const TechCard = ({
        title,
        description,
        icon: Icon,
        iconColorClass,
        content,
    }: {
        title: string;
        description: string;
        icon: React.ComponentType<{ className?: string }>;
        iconColorClass?: string;
        content: string | null;
    }) => (
        <div className="rounded border">
            <div className="border-b p-4">
                <div className="flex items-start gap-3">
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColorClass || 'text-muted-foreground'}`} />
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                    </div>
                </div>
            </div>
            <div className="p-4">
                {content ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{content}</p>
                ) : (
                    <p className="text-sm text-muted-foreground">Not specified</p>
                )}
            </div>
        </div>
    );

    return (
        <>
            <Head title={`Technology Stack - ${project.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectSidebarPanel
                        project={project}
                        navGroups={navGroups}
                        completionPercentage={completionPercentage}
                        isCollapsed={isSidebarCollapsed}
                        user={auth.user}
                    />

                    <main className="min-w-0 flex-1">
                        <div className="py-8 pr-4 pb-32 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">
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
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>

                            <header className="mb-8">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Technology Stack</h1>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Technical specifications and technology stack for {project.name}
                                        </p>
                                    </div>
                                </div>
                            </header>

                            <section className="space-y-10">
                                {technicalIntake ? (
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h2 className="text-lg font-semibold text-foreground">Technology Stack</h2>
                                            <div className="grid gap-4 lg:grid-cols-2">
                                                <TechCard
                                                    title="Platform Targets"
                                                    description="Target platforms and deployment environments"
                                                    icon={MonitorSmartphoneIcon}
                                                    iconColorClass="text-violet-500"
                                                    content={technicalIntake.platform_targets}
                                                />

                                                <TechCard
                                                    title="Frontend Technology"
                                                    description="Frontend frameworks, libraries, and tools"
                                                    icon={CodeIcon}
                                                    iconColorClass="text-blue-500"
                                                    content={technicalIntake.frontend_tech}
                                                />

                                                <TechCard
                                                    title="Backend Technology"
                                                    description="Backend runtime, frameworks, and databases"
                                                    icon={CodeIcon}
                                                    iconColorClass="text-cyan-500"
                                                    content={technicalIntake.backend_tech}
                                                />

                                                <TechCard
                                                    title="Database Technology"
                                                    description="Database systems and design patterns"
                                                    icon={DatabaseIcon}
                                                    iconColorClass="text-orange-500"
                                                    content={technicalIntake.database_tech}
                                                />

                                                <TechCard
                                                    title="AI Usage"
                                                    description="AI/ML models and use cases"
                                                    icon={LightbulbIcon}
                                                    iconColorClass="text-amber-500"
                                                    content={technicalIntake.ai_usage}
                                                />
                                            </div>

                                            <TechCard
                                                title="External Services"
                                                description="Third-party integrations and services"
                                                icon={PlugIcon}
                                                iconColorClass="text-green-500"
                                                content={technicalIntake.external_services}
                                            />
                                        </div>

                                        {technicalIntake.updated_at && (
                                            <div className="rounded border p-4">
                                                <p className="text-xs text-muted-foreground">
                                                    Last updated:{' '}
                                                    {new Date(technicalIntake.updated_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded border p-12 text-center">
                                        <CodeIcon className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                                        <h3 className="mb-2 text-lg font-semibold text-foreground">No Technology Details Yet</h3>
                                        <p className="mb-6 text-sm text-muted-foreground">
                                            Technology details will be available once you complete the project preparation phase
                                        </p>
                                        <Button onClick={() => router.visit(`/projects/${project.id}/prepare`)} size="sm" className="gap-2">
                                            <CodeIcon className="h-4 w-4" />
                                            Complete Project Setup
                                        </Button>
                                    </div>
                                )}
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
