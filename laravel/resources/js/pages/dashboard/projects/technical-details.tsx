import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, CalendarIcon, CodeIcon, DatabaseIcon, LightbulbIcon, MonitorSmartphoneIcon, PlugIcon } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

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
    technical_details: string;
    status: string;
    user: User;
    created_at: string;
    updated_at: string;
}

interface Props {
    project: Project;
    technicalIntake: TechnicalIntake | null;
}

export default function ProjectTechnicalDetails({ project, technicalIntake }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Projects', href: '/admin/projects' },
        { title: project.name, href: `/admin/projects/${project.id}` },
        { title: 'Technical Details', href: '#' },
    ];

    const TechCard = ({
        title,
        description,
        icon: Icon,
        content,
        colorClass = 'text-blue-600 dark:text-blue-400',
        bgClass = 'bg-blue-500/10',
    }: {
        title: string;
        description: string;
        icon: React.ComponentType<{ className?: string }>;
        content: string | null;
        colorClass?: string;
        bgClass?: string;
    }) => (
        <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-sm font-medium">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bgClass}`}>
                        <Icon className={`h-4 w-4 ${colorClass}`} />
                    </div>
                    <div>
                        <div className="font-medium">{title}</div>
                        <div className="text-xs font-normal text-muted-foreground">{description}</div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {content ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{content}</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                        Not specified
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Technical Details - ${project.name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={`/admin/projects/${project.id}`}>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <ArrowLeftIcon className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Technology Stack</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Technical specifications and architecture for {project.name}</p>
                        </div>
                    </div>
                </div>

                {technicalIntake ? (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <TechCard
                                title="Platform Targets"
                                description="Deployment environments"
                                icon={MonitorSmartphoneIcon}
                                content={technicalIntake.platform_targets}
                                colorClass="text-purple-600 dark:text-purple-400"
                                bgClass="bg-purple-500/10"
                            />

                            <TechCard
                                title="Frontend Technology"
                                description="Frameworks & libraries"
                                icon={CodeIcon}
                                content={technicalIntake.frontend_tech}
                                colorClass="text-blue-600 dark:text-blue-400"
                                bgClass="bg-blue-500/10"
                            />

                            <TechCard
                                title="Backend Technology"
                                description="Runtime & services"
                                icon={CodeIcon}
                                content={technicalIntake.backend_tech}
                                colorClass="text-emerald-600 dark:text-emerald-400"
                                bgClass="bg-emerald-500/10"
                            />

                            <TechCard
                                title="Database Technology"
                                description="Storage & caching"
                                icon={DatabaseIcon}
                                content={technicalIntake.database_tech}
                                colorClass="text-amber-600 dark:text-amber-400"
                                bgClass="bg-amber-500/10"
                            />

                            <TechCard
                                title="AI Usage"
                                description="Models & integration"
                                icon={LightbulbIcon}
                                content={technicalIntake.ai_usage}
                                colorClass="text-rose-600 dark:text-rose-400"
                                bgClass="bg-rose-500/10"
                            />

                            <TechCard
                                title="External Services"
                                description="Third-party APIs"
                                icon={PlugIcon}
                                content={technicalIntake.external_services}
                                colorClass="text-cyan-600 dark:text-cyan-400"
                                bgClass="bg-cyan-500/10"
                            />
                        </div>

                        {technicalIntake.updated_at && (
                            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                <span>
                                    Last updated{' '}
                                    {new Date(technicalIntake.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <CodeIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-medium">No Technology Details</h3>
                            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                                Technology details will appear here once the technical intake is completed.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
