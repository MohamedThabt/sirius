import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon, ZapIcon, FileTextIcon, CodeIcon, DatabaseIcon, ActivityIcon } from 'lucide-react';

interface Project {
    id: number;
    name: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface Feature {
    id: number;
    project_id: number;
    name: string;
    summary: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'draft' | 'in_progress' | 'completed' | 'archived';
    order_of_implementation: number;
    acceptance_criteria?: string;
    user_flows?: string;
    metrics?: string;
    erd?: string;
    sequence_diagram?: string;
    wireframe?: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    feature: Feature;
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
];

export default function FeatureShow({ feature, project }: Props) {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'draft':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            case 'archived':
                return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircleIcon className="h-4 w-4" />;
            case 'in_progress':
                return <ClockIcon className="h-4 w-4" />;
            case 'draft':
                return <FileTextIcon className="h-4 w-4" />;
            case 'archived':
                return <AlertCircleIcon className="h-4 w-4" />;
            default:
                return <AlertCircleIcon className="h-4 w-4" />;
        }
    };

    const updatedBreadcrumbs: BreadcrumbItem[] = [
        ...breadcrumbs,
        {
            title: project.name,
            href: `/admin/projects/${project.id}`,
        },
        {
            title: feature.name,
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={updatedBreadcrumbs}>
            <Head title={`Feature: ${feature.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/projects/${project.id}`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Project
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{feature.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                Project: {project.name} • Owner: {project.user.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge className={`${getPriorityColor(feature.priority)} capitalize`}>{feature.priority}</Badge>
                        <Badge className={`${getStatusColor(feature.status)} flex items-center gap-1`}>
                            {getStatusIcon(feature.status)}
                            {feature.status.replace('_', ' ')}
                        </Badge>
                    </div>
                </div>

                {/* Feature Info Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Implementation Order</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">#{feature.order_of_implementation}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm">{new Date(feature.created_at).toLocaleDateString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm">{new Date(feature.updated_at).toLocaleDateString()}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Feature Content */}
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {/* Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ZapIcon className="h-5 w-5" />
                                Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{feature.summary}</p>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    {feature.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileTextIcon className="h-5 w-5" />
                                    Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{feature.description}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Acceptance Criteria */}
                {feature.acceptance_criteria && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircleIcon className="h-5 w-5" />
                                Acceptance Criteria
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{feature.acceptance_criteria}</p>
                        </CardContent>
                    </Card>
                )}

                {/* User Flows */}
                {feature.user_flows && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ActivityIcon className="h-5 w-5" />
                                User Flows
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{feature.user_flows}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Metrics */}
                {feature.metrics && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ActivityIcon className="h-5 w-5" />
                                Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{feature.metrics}</p>
                        </CardContent>
                    </Card>
                )}

                {/* ERD */}
                {feature.erd && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DatabaseIcon className="h-5 w-5" />
                                Entity Relationship Diagram
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{feature.erd}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Sequence Diagram */}
                {feature.sequence_diagram && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CodeIcon className="h-5 w-5" />
                                Sequence Diagram
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{feature.sequence_diagram}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Wireframe */}
                {feature.wireframe && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CodeIcon className="h-5 w-5" />
                                Wireframe
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{feature.wireframe}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
