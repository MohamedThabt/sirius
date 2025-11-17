import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    CodeIcon,
    DatabaseIcon,
    FileIcon,
    HomeIcon,
    Layers as LayersIcon,
    LightbulbIcon,
    MonitorSmartphoneIcon,
    PanelLeftClose,
    PanelLeftOpen,
    PlugIcon,
    TrendingUpIcon,
    ZapIcon,
} from 'lucide-react';
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
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const getInitials = useInitials();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const breadcrumbs = [
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Technology Stack', href: `/projects/${project.id}/technology` },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
            case 'completed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <CircleIcon className="h-3 w-3" />;
            case 'in_progress':
                return <ClockIcon className="h-3 w-3" />;
            case 'completed':
                return <CheckCircleIcon className="h-3 w-3" />;
            default:
                return <AlertCircleIcon className="h-3 w-3" />;
        }
    };

    interface NavItem {
        key: string;
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        muted?: boolean;
        emphasize?: boolean;
        active?: boolean;
        disabled?: boolean;
        onClick: () => void;
    }

    interface NavGroup {
        label: string;
        items: NavItem[];
    }

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

    const getHealthIcon = () => {
        if (completionPercentage >= 80) return <CheckCircleIcon className="h-3 w-3 text-emerald-600 dark:text-emerald-300" />;
        if (completionPercentage >= 60) return <TrendingUpIcon className="h-3 w-3 text-blue-600 dark:text-blue-300" />;
        if (completionPercentage >= 40) return <AlertCircleIcon className="h-3 w-3 text-orange-600 dark:text-orange-300" />;
        return <AlertCircleIcon className="h-3 w-3 text-red-600 dark:text-red-300" />;
    };

    const getHealthStatus = () => {
        if (completionPercentage >= 80) return 'excellent';
        if (completionPercentage >= 60) return 'good';
        if (completionPercentage >= 40) return 'fair';
        return 'needs attention';
    };

    const navGroups: NavGroup[] = [
        {
            label: 'Plan',
            items: [
                { key: 'home', icon: HomeIcon, label: 'Project Home', onClick: () => router.visit(`/projects/${project.id}`) },
                {
                    key: 'overview',
                    icon: FileIcon,
                    label: 'System Overview',
                    muted: !sections?.overview,
                    disabled: !sections?.overview,
                    onClick: () => sections?.overview && router.get(`/projects/${project.id}/system-overview`),
                },
                {
                    key: 'prd',
                    icon: FileIcon,
                    label: sections?.prd ? 'PRD' : 'Generate PRD',
                    emphasize: !sections?.prd,
                    disabled: !sections?.prd,
                    onClick: () => (sections?.prd ? router.get(`/projects/${project.id}/prd`) : router.post(`/projects/${project.id}/prd/generate`)),
                },
                { key: 'features', icon: ZapIcon, label: 'Features', onClick: () => router.visit(`/projects/${project.id}`) },
            ],
        },
        {
            label: 'Design',
            items: [
                {
                    key: 'brainstorming',
                    icon: LightbulbIcon,
                    label: 'Brainstorming',
                    onClick: () => router.get(`/projects/${project.id}/brainstorming`),
                },
            ],
        },
        {
            label: 'Technical',
            items: [
                {
                    key: 'erd',
                    icon: DatabaseIcon,
                    label: 'Database Designer',
                    muted: !sections?.data_modeling,
                    disabled: !sections?.data_modeling,
                    onClick: () => sections?.data_modeling && router.get(`/projects/${project.id}/erd`),
                },
                {
                    key: 'c4',
                    icon: LayersIcon,
                    label: project.c4 ? 'System Architecture' : 'Generate C4',
                    emphasize: !project.c4,
                    disabled: !project.c4,
                    onClick: () => (project.c4 ? router.get(`/projects/${project.id}/c4`) : router.post(`/projects/${project.id}/c4/generate`)),
                },
                {
                    key: 'technology',
                    icon: CodeIcon,
                    label: 'Technology Stack',
                    active: true,
                    onClick: () => router.get(`/projects/${project.id}/technology`),
                },
            ],
        },
    ];

    const TechCard = ({
        title,
        description,
        icon: Icon,
        content,
    }: {
        title: string;
        description: string;
        icon: React.ComponentType<{ className?: string }>;
        content: string | null;
    }) => (
        <div className="rounded border">
            <div className="border-b p-4">
                <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
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
                    <aside className={`${isSidebarCollapsed ? 'w-0' : 'w-60'} hidden shrink-0 border-r transition-all duration-300 lg:block`}>
                        <div
                            className={`sticky top-0 flex h-screen flex-col justify-between py-8 pr-6 pl-4 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                        >
                            <div className="overflow-y-auto">
                                <div className="mb-6">
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h1 className="text-sm font-semibold truncate">{project.name}</h1>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-[10px]">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">{completionPercentage}%</span>
                                            </div>
                                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all" style={{ width: `${completionPercentage}%` }} />
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px]">
                                                {getHealthIcon()}
                                                <span className="text-muted-foreground">{getHealthStatus()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <nav className="space-y-6">
                                    {navGroups.map((group) => (
                                        <div key={group.label} className="space-y-2">
                                            <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                {group.label}
                                            </div>
                                            <ul className="space-y-1">
                                                {group.items.map((item) => (
                                                    <li key={item.key}>
                                                        <button
                                                            onClick={item.disabled ? undefined : item.onClick}
                                                            disabled={item.disabled}
                                                            className={[
                                                                'flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors',
                                                                item.disabled
                                                                    ? 'cursor-not-allowed opacity-50'
                                                                    : item.active
                                                                        ? 'bg-muted font-medium text-foreground'
                                                                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                                                item.emphasize && !item.disabled ? 'font-medium text-foreground' : '',
                                                            ].join(' ')}
                                                            title={item.disabled ? 'Not available yet' : item.label}
                                                        >
                                                            <item.icon className="h-4 w-4 shrink-0" />
                                                            <span className={item.muted ? 'opacity-70' : ''}>{item.label}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </nav>
                            </div>

                            <div className="shrink-0 border-t pt-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors hover:bg-muted">
                                            <Avatar className="h-5 w-5 shrink-0">
                                                <AvatarImage src={auth.user?.avatar} alt={auth.user?.name} />
                                                <AvatarFallback className="text-[10px] bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {auth.user?.name ? getInitials(auth.user.name) : ''}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-xs font-medium text-foreground">{auth.user?.name}</div>
                                                <div className="truncate text-[10px] text-muted-foreground">{auth.user?.email}</div>
                                            </div>
                                            <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </aside>

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
                                                    content={technicalIntake.platform_targets}
                                                />

                                                <TechCard
                                                    title="Frontend Technology"
                                                    description="Frontend frameworks, libraries, and tools"
                                                    icon={CodeIcon}
                                                    content={technicalIntake.frontend_tech}
                                                />

                                                <TechCard
                                                    title="Backend Technology"
                                                    description="Backend runtime, frameworks, and databases"
                                                    icon={CodeIcon}
                                                    content={technicalIntake.backend_tech}
                                                />

                                                <TechCard
                                                    title="Database Technology"
                                                    description="Database systems and design patterns"
                                                    icon={DatabaseIcon}
                                                    content={technicalIntake.database_tech}
                                                />

                                                <TechCard
                                                    title="AI Usage"
                                                    description="AI/ML models and use cases"
                                                    icon={LightbulbIcon}
                                                    content={technicalIntake.ai_usage}
                                                />
                                            </div>

                                            <TechCard
                                                title="External Services"
                                                description="Third-party integrations and services"
                                                icon={PlugIcon}
                                                content={technicalIntake.external_services}
                                            />
                                        </div>

                                        {/* Meta Information */}
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
