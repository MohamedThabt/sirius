import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { getPriorityColor, getStatusColor } from '@/utils/status-colors';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircleIcon,
    ArrowLeftIcon,
    BoxIcon,
    BrainCircuitIcon,
    CheckCircleIcon,
    ClipboardListIcon,
    ClockIcon,
    Code2Icon,
    DatabaseIcon,
    ExternalLink,
    EyeIcon,
    FileTextIcon,
    FolderGitIcon,
    GitBranchIcon,
    Github,
    LayersIcon,
    MailIcon,
    PlugIcon,
    ServerIcon,
    SettingsIcon,
    TrendingUpIcon,
    UserIcon,
    UsersIcon,
    ZapIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    created_at?: string;
    projects_count?: number;
}

interface Feature {
    id: number;
    name: string;
    description?: string;
    order_of_implementation: number;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    status?: 'draft' | 'in_progress' | 'completed' | 'archived';
    module_id?: number;
}

interface Module {
    id: number;
    name: string;
    description?: string;
    status: string;
    order_of_implementation: number;
    erd_is_synced: boolean;
    features: Feature[];
}

interface OverviewVersion {
    id: number;
    version_number: number;
    overview: string;
    is_base_version: boolean;
    created_at: string;
}

interface TechnicalIntake {
    id: number;
    platform_targets?: string;
    frontend_tech?: string;
    backend_tech?: string;
    database_tech?: string;
    ai_usage?: string;
    external_services?: string;
    created_at: string;
}

interface Repository {
    id: number;
    provider: string;
    repo_id?: string;
    name: string;
    full_name: string;
    owner_login: string;
    owner_type: string;
    default_branch: string;
    html_url?: string;
    ssh_url?: string;
    visibility: string;
    error_message?: string;
    synced_at?: string;
    created_at: string;
}

interface ProjectInvitation {
    id: number;
    user_id: number;
    invited_by: number;
    role: string;
    status: string;
    invited_at: string;
}

interface ProjectUser {
    id: number;
    user_id: number;
    project_id: number;
    role: string;
    joined_at?: string;
}

interface Project {
    id: number;
    user_id: number;
    name: string;
    brief: string;
    prd?: string;
    prd_is_synced?: boolean;
    prd_last_synced_at?: string;
    overview?: string;
    non_functional_requirements?: string;
    technical_details?: string;
    erd?: string;
    c4?: string;
    brainstorming_scene?: any[];
    status: string;
    created_at: string;
    updated_at: string;
    user: User;
    overviewVersions?: OverviewVersion[];
    baseOverviewVersion?: OverviewVersion;
    latestOverviewVersion?: OverviewVersion;
    features?: Feature[];
    modules?: Module[];
    technicalIntake?: TechnicalIntake;
    repository?: Repository;
    members?: User[];
    invitations?: ProjectInvitation[];
    pendingInvitations?: ProjectInvitation[];
    projectUsers?: ProjectUser[];
}

interface ProjectMetrics {
    total_features: number;
    total_modules: number;
    features_by_status: {
        draft: number;
        in_progress: number;
        completed: number;
        archived: number;
    };
    features_by_priority: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    modules_by_status: Record<string, number>;
    completion_percentage: number;
    team_members_count: number;
    pending_invitations_count: number;
    has_prd: boolean;
    has_erd: boolean;
    has_c4: boolean;
    has_repo: boolean;
    overview_versions_count: number;
}

interface Props {
    project: Project;
    projectMetrics?: ProjectMetrics;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Projects',
        href: '/admin/projects',
    },
    {
        title: 'Project Details',
        href: '#',
    },
];

export default function ProjectShow({ project, projectMetrics }: Props) {
    useFlashToasts();
    const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedTechnicalDetail, setSelectedTechnicalDetail] = useState<{ title: string; content: string } | null>(null);

    const completionPercentage = useMemo(() => {
        if (projectMetrics?.completion_percentage !== undefined) {
            return projectMetrics.completion_percentage;
        }
        const total = 6;
        let done = 0;
        if (project.overview) done++;
        if (project.prd) done++;
        if (project.features && project.features.length > 0) done++;
        if (project.erd) done++;
        if (project.c4) done++;
        if (project.brief) done++;
        return Math.round((done / total) * 100);
    }, [project, projectMetrics]);

    const health = useMemo(() => {
        if (completionPercentage >= 80) return { label: 'Excellent', Icon: CheckCircleIcon, color: 'text-emerald-600 dark:text-emerald-400' };
        if (completionPercentage >= 60) return { label: 'Good', Icon: TrendingUpIcon, color: 'text-blue-600 dark:text-blue-400' };
        if (completionPercentage >= 40) return { label: 'Fair', Icon: AlertCircleIcon, color: 'text-orange-600 dark:text-orange-400' };
        return { label: 'Needs Attention', Icon: AlertCircleIcon, color: 'text-red-600 dark:text-red-400' };
    }, [completionPercentage]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Project: ${project.name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/projects">
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <ArrowLeftIcon className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{project.name}</h1>
                                <Badge variant="outline" className={`${getStatusColor(project.status)} text-xs font-medium`}>
                                    {project.status.replace('_', ' ')}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">Created {new Date(project.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Dashboard */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Progress Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-3xl font-semibold">{completionPercentage}%</div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <health.Icon className={`h-3.5 w-3.5 ${health.color}`} />
                                <span className={`text-sm font-medium ${health.color}`}>{health.label}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Features Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Modules & Features</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-baseline gap-2">
                                <div className="text-3xl font-semibold">{project.modules?.length || 0}</div>
                                <span className="text-sm text-muted-foreground">modules</span>
                            </div>
                            <div className="flex gap-3 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <ZapIcon className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">{project.features?.length || 0} features</span>
                                </div>
                            </div>
                            {project.features && project.features.length > 0 ? (
                                <div className="flex gap-3 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span className="text-muted-foreground">{project.features.filter((f) => f.status === 'done').length}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span className="text-muted-foreground">
                                            {project.features.filter((f) => f.status === 'in_progress').length}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No features yet</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Team Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Team</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-3xl font-semibold">{project.members?.length || 1}</div>
                            <p className="text-sm text-muted-foreground">
                                {project.pendingInvitations && project.pendingInvitations.length > 0
                                    ? `${project.pendingInvitations.length} pending invitation${project.pendingInvitations.length > 1 ? 's' : ''}`
                                    : 'All members active'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Repository Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Repository</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {project.repository ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Connected</span>
                                    </div>
                                    <a
                                        href={project.repository.html_url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 truncate text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        <Github className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span className="truncate">{project.repository.full_name}</span>
                                    </a>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Not connected</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50 lg:grid-cols-5">
                        <TabsTrigger value="overview" className="gap-2">
                            <BoxIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="features" className="gap-2">
                            <LayersIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Modules</span>
                        </TabsTrigger>
                        <TabsTrigger value="technical" className="gap-2">
                            <Code2Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">Technical</span>
                        </TabsTrigger>
                        <TabsTrigger value="team" className="gap-2">
                            <UsersIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Team</span>
                        </TabsTrigger>
                        <TabsTrigger value="repository" className="gap-2">
                            <FolderGitIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Repository</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-4 space-y-4">
                        {/* Owner & Brief */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Owner</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex flex-col items-center text-center">
                                        {project.user.avatar ? (
                                            <img src={project.user.avatar} alt={project.user.name} className="h-16 w-16 rounded-full object-cover" />
                                        ) : (
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                                <UserIcon className="h-7 w-7 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="mt-3 w-full space-y-1">
                                            <div className="truncate text-sm font-medium">{project.user.name}</div>
                                            <div className="truncate text-xs text-muted-foreground">{project.user.email}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className="cursor-pointer transition-colors hover:bg-muted/50 md:col-span-2"
                                onClick={() => setIsBriefModalOpen(true)}
                            >
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center justify-between text-sm font-medium">
                                        <span>Brief</span>
                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{project.brief}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Overview Versions */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <LayersIcon className="h-4 w-4" />
                                    Versions ({project.overviewVersions?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {project.overviewVersions && project.overviewVersions.length > 0 ? (
                                    <div className="max-h-[300px] space-y-2 overflow-y-auto">
                                        {project.overviewVersions
                                            .sort((a, b) => b.version_number - a.version_number)
                                            .map((version) => (
                                                <div
                                                    key={version.id}
                                                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">V{version.version_number}</span>
                                                            {version.is_base_version && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Base
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="mt-1 text-xs text-muted-foreground">
                                                            {new Date(version.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/admin/projects/${project.id}/overview/preview`}
                                                        method="post"
                                                        data={{
                                                            content: version.overview,
                                                            title: `Overview Version ${version.version_number}`,
                                                            projectName: project.name,
                                                        }}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                    >
                                                        <EyeIcon className="h-3.5 w-3.5" />
                                                    </Link>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <LayersIcon className="mx-auto mb-2 h-8 w-8 opacity-20" />
                                        <p className="text-sm">No overview versions yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Documentation */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {(project.overview || project.latestOverviewVersion) && (
                                <Link href={`/admin/projects/${project.id}/overview`}>
                                    <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center justify-between text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <FileTextIcon className="h-4 w-4" />
                                                    Overview
                                                </div>
                                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                                {project.latestOverviewVersion?.overview || project.overview}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )}

                            {project.non_functional_requirements && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                            <ClipboardListIcon className="h-4 w-4" />
                                            NFRs
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                            {project.non_functional_requirements}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Brainstorming */}
                        {project.brainstorming_scene && project.brainstorming_scene.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                        <BrainCircuitIcon className="h-4 w-4" />
                                        Brainstorming
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="max-h-[200px] overflow-auto rounded-lg bg-muted p-3 text-xs leading-relaxed">
                                        {JSON.stringify(project.brainstorming_scene, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Features Tab - Now organized by Modules */}
                    <TabsContent value="features" className="mt-4 space-y-6">
                        {/* Modules with their Features */}
                        {project.modules && project.modules.length > 0 ? (
                            <div className="space-y-6">
                                {project.modules
                                    .sort((a, b) => a.order_of_implementation - b.order_of_implementation)
                                    .map((module) => (
                                        <Card key={module.id}>
                                            <CardHeader className="pb-3">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <Link href={`/admin/modules/${module.id}`} className="transition-colors hover:text-primary">
                                                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                                            <BoxIcon className="h-4 w-4 text-muted-foreground" />
                                                            {module.name}
                                                            <Badge variant="outline" className={`${getStatusColor(module.status)} ml-2 text-xs`}>
                                                                {module.status?.replace('_', ' ') || 'N/A'}
                                                            </Badge>
                                                        </CardTitle>
                                                    </Link>
                                                    <div className="flex items-center gap-2">
                                                        {module.erd_is_synced ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-400"
                                                            >
                                                                <CheckCircleIcon className="mr-1 h-3 w-3" />
                                                                ERD Synced
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="border-amber-500/20 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-400"
                                                            >
                                                                <ClockIcon className="mr-1 h-3 w-3" />
                                                                ERD Pending
                                                            </Badge>
                                                        )}
                                                        <span className="text-xs text-muted-foreground">#{module.order_of_implementation}</span>
                                                    </div>
                                                </div>
                                                {module.description && (
                                                    <CardDescription className="mt-1 line-clamp-2">{module.description}</CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent>
                                                {module.features && module.features.length > 0 ? (
                                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                                        {module.features
                                                            .sort((a, b) => a.order_of_implementation - b.order_of_implementation)
                                                            .map((feature) => (
                                                                <Link key={feature.id} href={`/admin/features/${feature.id}`}>
                                                                    <Card className="h-full cursor-pointer border-dashed transition-colors hover:bg-muted/50">
                                                                        <CardContent className="space-y-2 p-3">
                                                                            <div className="flex items-start justify-between gap-2">
                                                                                <span className="line-clamp-1 text-sm font-medium">
                                                                                    {feature.name}
                                                                                </span>
                                                                                {feature.priority && (
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className={`${getPriorityColor(feature.priority)} flex-shrink-0 text-[10px]`}
                                                                                    >
                                                                                        {feature.priority.charAt(0).toUpperCase()}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            {feature.description && (
                                                                                <p className="line-clamp-1 text-xs text-muted-foreground">
                                                                                    {feature.description}
                                                                                </p>
                                                                            )}
                                                                            <div className="flex items-center justify-between border-t pt-1.5">
                                                                                {feature.status && (
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className={`${getStatusColor(feature.status)} text-[10px]`}
                                                                                    >
                                                                                        {feature.status.replace('_', ' ')}
                                                                                    </Badge>
                                                                                )}
                                                                                <span className="text-[10px] text-muted-foreground">
                                                                                    #{feature.order_of_implementation}
                                                                                </span>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </Link>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <div className="py-6 text-center text-muted-foreground">
                                                        <ZapIcon className="mx-auto mb-2 h-6 w-6 opacity-30" />
                                                        <p className="text-xs">No features in this module</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                            </div>
                        ) : project.features && project.features.length > 0 ? (
                            /* Fallback: Display flat features if no modules exist (legacy projects) */
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {project.features.map((feature) => (
                                    <Link key={feature.id} href={`/admin/features/${feature.id}`}>
                                        <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <CardTitle className="line-clamp-2 text-sm leading-tight font-medium">{feature.name}</CardTitle>
                                                    {feature.priority && (
                                                        <Badge
                                                            variant="outline"
                                                            className={`${getPriorityColor(feature.priority)} flex-shrink-0 text-xs`}
                                                        >
                                                            {feature.priority.charAt(0).toUpperCase()}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {feature.description && (
                                                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                        {feature.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between border-t pt-2">
                                                    {feature.status && (
                                                        <Badge variant="outline" className={`${getStatusColor(feature.status)} text-xs`}>
                                                            {feature.status.replace('_', ' ')}
                                                        </Badge>
                                                    )}
                                                    <span className="font-mono text-xs text-muted-foreground">
                                                        #{feature.order_of_implementation}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <BoxIcon className="mb-3 h-10 w-10 text-muted-foreground/20" />
                                    <h3 className="text-sm font-medium">No modules or features</h3>
                                    <p className="mt-1 text-xs text-muted-foreground">Create modules and features to track implementation</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Technical Tab */}
                    <TabsContent value="technical" className="mt-4 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {project.technical_details && (
                                <Link href={`/admin/projects/${project.id}/technical-details`}>
                                    <Card className="group cursor-pointer transition-all hover:bg-muted/50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center justify-between text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                                        <SettingsIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Technical Details</div>
                                                        <div className="text-xs font-normal text-muted-foreground">Implementation specs</div>
                                                    </div>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400">
                                                Available
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )}

                            {project.prd && (
                                <Link href={`/admin/projects/${project.id}/prd`}>
                                    <Card className="group cursor-pointer transition-all hover:bg-muted/50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center justify-between text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                                        <FileTextIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">PRD</span>
                                                            {project.prd_is_synced === false && (
                                                                <Badge variant="destructive" className="h-4 px-1 py-0 text-[10px]">
                                                                    Out of Sync
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs font-normal text-muted-foreground">
                                                            Depends on: Overview + Modules
                                                        </div>
                                                    </div>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                                >
                                                    Available
                                                </Badge>
                                                {project.prd_is_synced === false && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-orange-500/20 bg-orange-500/10 text-xs text-orange-700 dark:text-orange-400"
                                                    >
                                                        ⚠ Needs Sync
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )}

                            {project.erd && (
                                <Link href={`/admin/projects/${project.id}/erd`}>
                                    <Card className="group cursor-pointer transition-all hover:bg-muted/50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center justify-between text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                                                        <DatabaseIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Database ERD</div>
                                                        <div className="text-xs font-normal text-muted-foreground">Schema design</div>
                                                    </div>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Badge
                                                variant="outline"
                                                className="border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400"
                                            >
                                                Available
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )}

                            {project.c4 && (
                                <Link href={`/admin/projects/${project.id}/c4`}>
                                    <Card className="group cursor-pointer transition-all hover:bg-muted/50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center justify-between text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                                        <Code2Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">C4 Architecture</div>
                                                        <div className="text-xs font-normal text-muted-foreground">System design</div>
                                                    </div>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Badge
                                                variant="outline"
                                                className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                            >
                                                Available
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )}
                        </div>

                        {project.technicalIntake && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                        <Code2Icon className="h-4 w-4" />
                                        Tech Stack
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                        {project.technicalIntake.platform_targets && (
                                            <button
                                                className="rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                                                onClick={() =>
                                                    setSelectedTechnicalDetail({
                                                        title: 'Platform Targets',
                                                        content: project.technicalIntake?.platform_targets || '',
                                                    })
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    <LayersIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                    <span className="text-sm font-medium">Platforms</span>
                                                </div>
                                            </button>
                                        )}
                                        {project.technicalIntake.frontend_tech && (
                                            <button
                                                className="rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                                                onClick={() =>
                                                    setSelectedTechnicalDetail({
                                                        title: 'Frontend Technology',
                                                        content: project.technicalIntake?.frontend_tech || '',
                                                    })
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Code2Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                    <span className="text-sm font-medium">Frontend</span>
                                                </div>
                                            </button>
                                        )}
                                        {project.technicalIntake.backend_tech && (
                                            <button
                                                className="rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                                                onClick={() =>
                                                    setSelectedTechnicalDetail({
                                                        title: 'Backend Technology',
                                                        content: project.technicalIntake?.backend_tech || '',
                                                    })
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ServerIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                    <span className="text-sm font-medium">Backend</span>
                                                </div>
                                            </button>
                                        )}
                                        {project.technicalIntake.database_tech && (
                                            <button
                                                className="rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                                                onClick={() =>
                                                    setSelectedTechnicalDetail({
                                                        title: 'Database Technology',
                                                        content: project.technicalIntake?.database_tech || '',
                                                    })
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    <DatabaseIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                    <span className="text-sm font-medium">Database</span>
                                                </div>
                                            </button>
                                        )}
                                        {project.technicalIntake.ai_usage && (
                                            <button
                                                className="rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                                                onClick={() =>
                                                    setSelectedTechnicalDetail({
                                                        title: 'AI Usage',
                                                        content: project.technicalIntake?.ai_usage || '',
                                                    })
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    <BrainCircuitIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                    <span className="text-sm font-medium">AI</span>
                                                </div>
                                            </button>
                                        )}
                                        {project.technicalIntake.external_services && (
                                            <button
                                                className="rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                                                onClick={() =>
                                                    setSelectedTechnicalDetail({
                                                        title: 'External Services',
                                                        content: project.technicalIntake?.external_services || '',
                                                    })
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    <PlugIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                    <span className="text-sm font-medium">Services</span>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Team Tab */}
                    <TabsContent value="team" className="mt-4 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                        <UsersIcon className="h-4 w-4" />
                                        Members ({project.members?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {project.members && project.members.length > 0 ? (
                                        <div className="max-h-[300px] space-y-2 overflow-y-auto">
                                            {project.members.map((member) => (
                                                <Link key={member.id} href={`/admin/users/${member.id}`}>
                                                    <div className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                                            {member.avatar ? (
                                                                <img
                                                                    src={member.avatar}
                                                                    alt={member.name}
                                                                    className="h-9 w-9 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                                                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm leading-none font-medium">{member.name}</p>
                                                                <p className="mt-1 truncate text-xs text-muted-foreground">{member.email}</p>
                                                            </div>
                                                        </div>
                                                        {project.projectUsers && project.projectUsers.find((pu) => pu.user_id === member.id) && (
                                                            <Badge variant="outline" className="flex-shrink-0 text-xs">
                                                                {project.projectUsers.find((pu) => pu.user_id === member.id)?.role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground">
                                            <UsersIcon className="mx-auto mb-2 h-8 w-8 opacity-20" />
                                            <p className="text-sm">No members</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                        <MailIcon className="h-4 w-4" />
                                        Pending ({project.pendingInvitations?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {project.pendingInvitations && project.pendingInvitations.length > 0 ? (
                                        <div className="max-h-[300px] space-y-2 overflow-y-auto">
                                            {project.pendingInvitations.map((invitation) => (
                                                <div key={invitation.id} className="flex items-center justify-between rounded-lg border p-3">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                ID: {invitation.user_id}
                                                            </Badge>
                                                            <Badge
                                                                variant="outline"
                                                                className="border-yellow-500/20 bg-yellow-500/10 text-xs text-yellow-700 dark:text-yellow-500"
                                                            >
                                                                {invitation.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(invitation.invited_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="flex-shrink-0 text-xs">
                                                        {invitation.role}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground">
                                            <MailIcon className="mx-auto mb-2 h-8 w-8 opacity-20" />
                                            <p className="text-sm">No invitations</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Repository Tab */}
                    <TabsContent value="repository" className="mt-4 space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <FolderGitIcon className="h-4 w-4" />
                                    Repository
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {project.repository ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                                                <Github className="h-6 w-6 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="truncate text-sm font-medium">{project.repository.full_name}</h4>
                                                    <a
                                                        href={project.repository.html_url || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 flex w-fit items-center gap-1 text-xs text-blue-600 hover:underline"
                                                    >
                                                        View on GitHub <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>
                                                <Badge
                                                    variant={project.repository.visibility === 'private' ? 'secondary' : 'default'}
                                                    className="flex-shrink-0 text-xs"
                                                >
                                                    {project.repository.visibility}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="rounded-lg border p-3">
                                                    <div className="mb-1 text-xs text-muted-foreground">Branch</div>
                                                    <div className="flex items-center gap-1.5 font-mono text-sm">
                                                        <GitBranchIcon className="h-3.5 w-3.5" />
                                                        {project.repository.default_branch}
                                                    </div>
                                                </div>
                                                <div className="rounded-lg border p-3">
                                                    <div className="mb-1 text-xs text-muted-foreground">Provider</div>
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <Github className="h-3.5 w-3.5" />
                                                        GitHub
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border p-3">
                                            <h4 className="mb-3 text-sm font-medium">Sync Status</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Status</span>
                                                    <Badge
                                                        variant="outline"
                                                        className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-500"
                                                    >
                                                        Synced
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Last Synced</span>
                                                    <span className="text-sm font-medium">
                                                        {project.repository.synced_at
                                                            ? new Date(project.repository.synced_at).toLocaleDateString()
                                                            : 'Never'}
                                                    </span>
                                                </div>
                                                {project.repository.error_message && (
                                                    <div className="mt-2 rounded-lg bg-red-500/10 p-2 text-xs text-red-700 dark:text-red-300">
                                                        {project.repository.error_message}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <FolderGitIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
                                        <h3 className="text-sm font-medium">No Repository</h3>
                                        <p className="mt-1 text-xs text-muted-foreground">Connect a GitHub repository</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Technical Detail Dialog */}
                <Dialog open={!!selectedTechnicalDetail} onOpenChange={(open) => !open && setSelectedTechnicalDetail(null)}>
                    <DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden">
                        <DialogHeader>
                            <DialogTitle>{selectedTechnicalDetail?.title}</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[calc(80vh-8rem)] overflow-y-auto">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{selectedTechnicalDetail?.content || ''}</ReactMarkdown>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Project Brief Modal */}
                <Dialog open={isBriefModalOpen} onOpenChange={setIsBriefModalOpen}>
                    <DialogContent className="max-h-[80vh] max-w-4xl overflow-hidden">
                        <DialogHeader>
                            <DialogTitle>Project Brief</DialogTitle>
                            <DialogDescription>{project.name}</DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[calc(80vh-8rem)] overflow-y-auto">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{project.brief}</ReactMarkdown>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
