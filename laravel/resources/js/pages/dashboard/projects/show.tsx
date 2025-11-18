import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, CalendarIcon, ClipboardListIcon, FileTextIcon, SettingsIcon, UserIcon, GitBranchIcon, DatabaseIcon, Code2Icon, UsersIcon, MailIcon, BoxIcon, CheckCircleIcon, TrendingUpIcon, AlertCircleIcon, ZapIcon, Github, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, RadialBarChart, RadialBar } from 'recharts';
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
    content: string;
    created_at: string;
}

interface Repository {
    id: number;
    url: string;
    branch?: string;
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
    technicalIntake?: TechnicalIntake;
    repository?: Repository;
    members?: User[];
    invitations?: ProjectInvitation[];
    pendingInvitations?: ProjectInvitation[];
    projectUsers?: ProjectUser[];
}

interface Props {
    project: Project;
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

export default function ProjectShow({ project }: Props) {
    const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'draft':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

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

    const completionPercentage = useMemo(() => {
        const total = 6;
        let done = 0;
        if (project.overview) done++;
        if (project.prd) done++;
        if (project.features && project.features.length > 0) done++;
        if (project.erd) done++;
        if (project.c4) done++;
        if (project.brief) done++;
        return Math.round((done / total) * 100);
    }, [project.overview, project.prd, project.features, project.erd, project.c4, project.brief]);

    const health = useMemo(() => {
        if (completionPercentage >= 80) return { label: 'excellent', Icon: CheckCircleIcon, color: 'text-emerald-600 dark:text-emerald-300' };
        if (completionPercentage >= 60) return { label: 'good', Icon: TrendingUpIcon, color: 'text-blue-600 dark:text-blue-300' };
        if (completionPercentage >= 40) return { label: 'fair', Icon: AlertCircleIcon, color: 'text-orange-600 dark:text-orange-300' };
        return { label: 'needs attention', Icon: AlertCircleIcon, color: 'text-red-600 dark:text-red-300' };
    }, [completionPercentage]);

    const statusChartConfig: ChartConfig = {
        completed: {
            label: 'Completed',
            theme: {
                light: 'oklch(0.5638 0.1471 264.8522)',
                dark: 'oklch(0.5638 0.1471 264.8522)',
            },
        },
        'in_progress': {
            label: 'In Progress',
            theme: {
                light: 'oklch(0.6907 0.1554 160.3454)',
                dark: 'oklch(0.6907 0.1554 160.3454)',
            },
        },
        draft: {
            label: 'Draft',
            theme: {
                light: 'oklch(0.8214 0.16 82.5337)',
                dark: 'oklch(0.8214 0.16 82.5337)',
            },
        },
        archived: {
            label: 'Archived',
            theme: {
                light: 'oklch(0.7064 0.1822 151.7125)',
                dark: 'oklch(0.7064 0.1822 151.7125)',
            },
        },
    };

    const priorityChartConfig: ChartConfig = {
        critical: {
            label: 'Critical',
            theme: {
                light: 'oklch(0.6188 0.2376 25.7658)',
                dark: 'oklch(0.6188 0.2376 25.7658)',
            },
        },
        high: {
            label: 'High',
            theme: {
                light: 'oklch(0.5638 0.1471 264.8522)',
                dark: 'oklch(0.5638 0.1471 264.8522)',
            },
        },
        medium: {
            label: 'Medium',
            theme: {
                light: 'oklch(0.6907 0.1554 160.3454)',
                dark: 'oklch(0.6907 0.1554 160.3454)',
            },
        },
        low: {
            label: 'Low',
            theme: {
                light: 'oklch(0.8214 0.16 82.5337)',
                dark: 'oklch(0.8214 0.16 82.5337)',
            },
        },
    };

    const completionChartConfig: ChartConfig = {
        completion: {
            label: 'Completion',
            theme: {
                light: 'oklch(0.5638 0.1471 264.8522)',
                dark: 'oklch(0.5638 0.1471 264.8522)',
            },
        },
    };

    const getFeatureStatusData = useMemo(() => {
        const features = project.features || [];
        const statusMap: Record<string, number> = {
            completed: 0,
            'in_progress': 0,
            draft: 0,
            archived: 0,
        };

        features.forEach((feature) => {
            const status = feature.status || 'draft';
            if (statusMap[status] !== undefined) {
                statusMap[status]++;
            }
        });

        return Object.entries(statusMap)
            .filter(([_, count]) => count > 0)
            .map(([status]) => ({
                name: status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1),
                value: statusMap[status],
                statusKey: status,
                fill: `var(--color-${status})`,
            }));
    }, [project.features]);

    const getFeaturePriorityData = useMemo(() => {
        const features = project.features || [];
        const priorityMap: Record<string, number> = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
        };

        features.forEach((feature) => {
            const priority = feature.priority || 'low';
            if (priorityMap[priority] !== undefined) {
                priorityMap[priority]++;
            }
        });

        return Object.entries(priorityMap)
            .filter(([_, count]) => count > 0)
            .map(([priority]) => ({
                name: priority.charAt(0).toUpperCase() + priority.slice(1),
                value: priorityMap[priority],
                priorityKey: priority,
                fill: `var(--color-${priority})`,
            }));
    }, [project.features]);

    const completionChartData = useMemo(
        () => [
            {
                name: 'completion',
                value: completionPercentage,
                fill: 'var(--color-completion)',
            },
        ],
        [completionPercentage],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Project Details - ${project.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/projects">
                            <Button variant="outline" size="sm">
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Projects
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{project.name}</h1>
                            <p className="text-sm text-muted-foreground">Complete project overview and analytics</p>
                        </div>
                    </div>
                    <Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                </div>

                {/* Project Metrics Dashboard */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold">{completionPercentage}%</div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div className="h-full bg-primary transition-all" style={{ width: `${completionPercentage}%` }} />
                            </div>
                            <div className="mt-2 flex items-center gap-1.5">
                                <health.Icon className={`h-4 w-4 ${health.color}`} />
                                <span className={`text-xs capitalize ${health.color}`}>{health.label}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold">{project.features?.length || 0}</div>
                            <div className="text-xs text-muted-foreground">
                                {project.features && project.features.length > 0 ? (
                                    <>
                                        {project.features.filter((f) => f.status === 'completed').length} completed,{' '}
                                        {project.features.filter((f) => f.status === 'in_progress').length} in progress
                                    </>
                                ) : (
                                    'No features yet'
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold">{project.members?.length || 0}</div>
                            <div className="text-xs text-muted-foreground">
                                {project.pendingInvitations && project.pendingInvitations.length > 0
                                    ? `${project.pendingInvitations.length} pending invitations`
                                    : 'Active collaborators'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Project Owner</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-3">
                                {project.user.avatar ? (
                                    <img 
                                        src={project.user.avatar} 
                                        alt={project.user.name}
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <UserIcon className="h-6 w-6" />
                                    </div>
                                )}
                                <div className="flex-1 space-y-1">
                                    <div className="text-sm font-medium">{project.user.name}</div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MailIcon className="h-3 w-3" />
                                        <span className="truncate">{project.user.email}</span>
                                    </div>
                                    {project.user.projects_count !== undefined && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <BoxIcon className="h-3 w-3" />
                                            <span>{project.user.projects_count} {project.user.projects_count === 1 ? 'project' : 'projects'}</span>
                                        </div>
                                    )}
                                    {project.user.created_at && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <CalendarIcon className="h-3 w-3" />
                                            <span>Member since {new Date(project.user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">GitHub Integration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {project.repository ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Connected</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <a 
                                            href={project.repository.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                                        >
                                            <Github className="h-3 w-3" />
                                            <span className="truncate max-w-[200px]">{project.repository.url.replace('https://github.com/', '')}</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                    {project.repository.branch && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <GitBranchIcon className="h-3 w-3" />
                                            <span>{project.repository.branch}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Not Connected</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">No repository linked to this project</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs for Content Organization */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="features">Features</TabsTrigger>
                        <TabsTrigger value="technical">Technical</TabsTrigger>
                        <TabsTrigger value="team">Team</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Analytics Charts */}
                        {project.features && project.features.length > 0 && (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {/* Completion Progress Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Project Completion</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="relative h-[200px] w-full">
                                            <ChartContainer config={completionChartConfig} className="h-full w-full">
                                                <RadialBarChart
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="70%"
                                                    outerRadius="90%"
                                                    data={completionChartData}
                                                    startAngle={90}
                                                    endAngle={-270}
                                                >
                                                    <RadialBar
                                                        dataKey="value"
                                                        cornerRadius={4}
                                                        fill="var(--color-completion)"
                                                        background={{ fill: 'hsl(var(--muted))' }}
                                                    />
                                                </RadialBarChart>
                                            </ChartContainer>
                                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-foreground">{completionPercentage}%</div>
                                                    <div className="mt-1 text-xs text-muted-foreground">Complete</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Feature Status Chart */}
                                {getFeatureStatusData.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Feature Status</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ChartContainer config={statusChartConfig} className="h-[200px] w-full">
                                                <PieChart>
                                                    <ChartTooltip content={<ChartTooltipContent nameKey="statusKey" />} />
                                                    <Pie
                                                        data={getFeatureStatusData}
                                                        dataKey="value"
                                                        nameKey="statusKey"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={70}
                                                        label={({ value }) => value}
                                                        labelLine={false}
                                                    >
                                                        {getFeatureStatusData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Feature Priority Chart */}
                                {getFeaturePriorityData.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Feature Priority</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ChartContainer config={priorityChartConfig} className="h-[200px] w-full">
                                                <BarChart data={getFeaturePriorityData}>
                                                    <ChartTooltip content={<ChartTooltipContent nameKey="priorityKey" />} />
                                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                        {getFeaturePriorityData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Project Information */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Project Brief */}
                            <Card 
                                className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
                                onClick={() => setIsBriefModalOpen(true)}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileTextIcon className="h-5 w-5" />
                                        Project Brief
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed line-clamp-6">{project.brief}</p>
                                </CardContent>
                            </Card>

                            {/* Project Overview */}
                            {project.overview && (
                                <Link href={`/admin/projects/${project.id}/overview`}>
                                    <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileTextIcon className="h-5 w-5" />
                                                Project Overview
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed line-clamp-6">{project.overview}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )}

                            {/* Non-Functional Requirements */}
                            {project.non_functional_requirements && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ClipboardListIcon className="h-5 w-5" />
                                            Non-Functional Requirements
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed line-clamp-6">
                                            {project.non_functional_requirements}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Repository */}
                            {project.repository && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <GitBranchIcon className="h-5 w-5" />
                                            Repository
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-sm font-medium">URL</p>
                                                <a
                                                    href={project.repository.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="break-all text-sm text-blue-600 hover:underline"
                                                >
                                                    {project.repository.url}
                                                </a>
                                            </div>
                                            {project.repository.branch && (
                                                <div>
                                                    <p className="text-sm font-medium">Branch</p>
                                                    <p className="text-sm text-muted-foreground">{project.repository.branch}</p>
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Created: {new Date(project.repository.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Features Tab */}
                    <TabsContent value="features" className="space-y-4">
                        {project.features && project.features.length > 0 ? (
                            <>
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold">Features ({project.features.length})</h2>
                                    <p className="text-sm text-muted-foreground">Click on a feature to view details</p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {project.features.map((feature) => (
                                        <Link key={feature.id} href={`/admin/features/${feature.id}`}>
                                            <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <CardTitle className="text-base line-clamp-2">{feature.name}</CardTitle>
                                                        {feature.priority && (
                                                            <Badge className={`${getPriorityColor(feature.priority)} shrink-0 text-xs capitalize`}>
                                                                {feature.priority}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    {feature.description && (
                                                        <p className="line-clamp-3 text-sm text-muted-foreground">{feature.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        {feature.status && (
                                                            <Badge className={`${getStatusColor(feature.status)} text-xs`}>
                                                                {feature.status.replace('_', ' ')}
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline" className="text-xs">
                                                            Order #{feature.order_of_implementation}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>

                                {/* Overview Versions */}
                                {project.overviewVersions && project.overviewVersions.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileTextIcon className="h-5 w-5" />
                                                Overview Versions ({project.overviewVersions.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {project.overviewVersions.map((version) => (
                                                    <div key={version.id} className="border-b pb-3 last:border-b-0">
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <p className="text-sm font-medium">Version {version.version_number}</p>
                                                            {version.is_base_version && (
                                                                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                                                    Base Version
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                                                            {version.overview}
                                                        </p>
                                                        <p className="mt-2 text-xs text-muted-foreground">
                                                            Created: {new Date(version.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <ZapIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">No features defined yet</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Technical Tab */}
                    <TabsContent value="technical" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Technical Details */}
                            {project.technical_details && (
                                <Link href={`/admin/projects/${project.id}/technical-details`}>
                                    <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <SettingsIcon className="h-5 w-5" />
                                                Technical Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed line-clamp-6">{project.technical_details}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )}

                            {/* PRD */}
                            {project.prd && (
                                <Link href={`/admin/projects/${project.id}/prd`}>
                                    <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileTextIcon className="h-5 w-5" />
                                                Product Requirements Document
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed line-clamp-6">{project.prd}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )}

                            {/* ERD */}
                            {project.erd && (
                                <Link href={`/admin/projects/${project.id}/erd`}>
                                    <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <DatabaseIcon className="h-5 w-5" />
                                                Entity Relationship Diagram
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed line-clamp-6">{project.erd}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )}

                            {/* C4 */}
                            {project.c4 && (
                                <Link href={`/admin/projects/${project.id}/c4`}>
                                    <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Code2Icon className="h-5 w-5" />
                                                C4 Architecture
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed line-clamp-6">{project.c4}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )}
                        </div>

                        {/* Technical Intake */}
                        {project.technicalIntake && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileTextIcon className="h-5 w-5" />
                                        Technical Intake
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{project.technicalIntake.content}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Created: {new Date(project.technicalIntake.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Brainstorming Scene */}
                        {project.brainstorming_scene && project.brainstorming_scene.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BoxIcon className="h-5 w-5" />
                                        Brainstorming Data
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="max-h-96 overflow-auto rounded bg-muted p-3 text-xs">
                                        {JSON.stringify(project.brainstorming_scene, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Team Tab */}
                    <TabsContent value="team" className="space-y-6">
                        {/* Team Members */}
                        {project.members && project.members.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UsersIcon className="h-5 w-5" />
                                        Team Members ({project.members.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {project.members.map((member) => (
                                            <div key={member.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                                <div className="flex items-center gap-2">
                                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">{member.name}</p>
                                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                                    </div>
                                                </div>
                                                {project.projectUsers && project.projectUsers.find((pu) => pu.user_id === member.id) && (
                                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                        {project.projectUsers.find((pu) => pu.user_id === member.id)?.role}
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pending Invitations */}
                        {project.pendingInvitations && project.pendingInvitations.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MailIcon className="h-5 w-5" />
                                        Pending Invitations ({project.pendingInvitations.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {project.pendingInvitations.map((invitation) => (
                                            <div key={invitation.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">User ID: {invitation.user_id}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Invited: {new Date(invitation.invited_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                                        {invitation.role}
                                                    </Badge>
                                                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                                                        {invitation.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Project Brief Modal */}
                <Dialog open={isBriefModalOpen} onOpenChange={setIsBriefModalOpen}>
                    <DialogContent className="max-h-[80vh] max-w-4xl overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FileTextIcon className="h-5 w-5" />
                                Project Brief
                            </DialogTitle>
                            <DialogDescription>{project.name}</DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 max-h-[calc(80vh-8rem)] overflow-y-auto pr-2">
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <ReactMarkdown>{project.brief}</ReactMarkdown>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
