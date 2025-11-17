import FeatureSidebar from '@/components/Features/FeatureSidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
    ArrowRightIcon,
    CheckCircle2,
    CircleIcon,
    ClockIcon,
    DatabaseIcon,
    FileIcon,
    LayoutIcon,
    MessageSquareIcon,
    PanelLeftClose,
    PanelLeftOpen,
    PencilIcon,
    RouteIcon,
    SparklesIcon,
    TargetIcon,
    WorkflowIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Project {
    id: number;
    name: string;
}

interface FeatureItem {
    id: number;
    name: string;
    summary: string | null;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'draft' | 'in_progress' | 'completed' | 'archived';
    order_of_implementation: number;
    progress?: number | null;
    prd?: string | null;
    acceptance_criteria?: string | null;
    user_flows?: string | null;
    metrics?: string | null;
    description?: string | null;
    erd?: string | null;
    sequence_diagram?: string | null;
    wireframe?: string | null;
}

interface Props {
    project: Project;
    feature: FeatureItem;
}

export default function Show({ project, feature }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { auth } = usePage().props as any;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);

    const { data, setData, put, processing } = useForm({
        name: feature.name,
        summary: feature.summary || '',
        description: feature.description || '',
        acceptance_criteria: feature.acceptance_criteria || '',
        user_flows: feature.user_flows || '',
        metrics: feature.metrics || '',
        status: feature.status || 'draft',
        priority: feature.priority || 'medium',
        order_of_implementation: feature.order_of_implementation || 1,
    });

    // Sync form data when feature prop changes
    useEffect(() => {
        if (!editingField) {
            setData({
                name: feature.name,
                summary: feature.summary || '',
                description: feature.description || '',
                acceptance_criteria: feature.acceptance_criteria || '',
                user_flows: feature.user_flows || '',
                metrics: feature.metrics || '',
                status: feature.status || 'draft',
                priority: feature.priority || 'medium',
                order_of_implementation: feature.order_of_implementation || 1,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        feature.id,
        feature.name,
        feature.status,
        feature.priority,
        feature.order_of_implementation,
        feature.summary,
        feature.description,
        feature.acceptance_criteria,
        feature.user_flows,
        feature.metrics,
    ]);

    const handleEdit = (field: 'name' | 'summary' | 'description' | 'acceptance_criteria' | 'user_flows' | 'metrics' | 'order_of_implementation') => {
        setEditingField(field);
    };

    const handleSave = () => {
        if (!editingField) return;

        put(`/features/${feature.id}/update`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingField(null);
            },
        });
    };

    const handleCancel = () => {
        setEditingField(null);
        // Reset form data to original values
        setData({
            name: feature.name,
            summary: feature.summary || '',
            description: feature.description || '',
            acceptance_criteria: feature.acceptance_criteria || '',
            user_flows: feature.user_flows || '',
            metrics: feature.metrics || '',
            status: feature.status || 'draft',
            priority: feature.priority || 'medium',
            order_of_implementation: feature.order_of_implementation || 1,
        });
    };

    const handleStatusChange = (newStatus: 'draft' | 'in_progress' | 'completed' | 'archived') => {
        setData('status', newStatus);
        put(`/features/${feature.id}/update`, {
            preserveScroll: true,
        });
    };

    const handlePriorityChange = (newPriority: 'low' | 'medium' | 'high' | 'critical') => {
        setData('priority', newPriority);
        put(`/features/${feature.id}/update`, {
            preserveScroll: true,
        });
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <CircleIcon className="h-4 w-4" />;
            case 'in_progress':
                return <ClockIcon className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle2 className="h-4 w-4" />;
            default:
                return <AlertCircleIcon className="h-4 w-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30';
            case 'high':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30';
            case 'medium':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
        }
    };

    const calculateProgress = useMemo(() => {
        const artifacts = [
            !!(feature.description && feature.acceptance_criteria), // Overview
            !!feature.erd, // ERD
            !!feature.sequence_diagram, // Sequence
            !!feature.wireframe, // Wireframe
        ];
        const completed = artifacts.filter(Boolean).length;
        return Math.round((completed / 4) * 100);
    }, [feature]);

    const health = useMemo(() => {
        if (calculateProgress >= 80) return { label: 'excellent', Icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-300' };
        if (calculateProgress >= 60) return { label: 'good', Icon: CheckCircle2, color: 'text-blue-600 dark:text-blue-300' };
        if (calculateProgress >= 40) return { label: 'fair', Icon: AlertCircleIcon, color: 'text-orange-600 dark:text-orange-300' };
        return { label: 'needs attention', Icon: AlertCircleIcon, color: 'text-red-600 dark:text-red-300' };
    }, [calculateProgress]);

    // Helper to get next steps
    const getNextSteps = () => {
        const steps = [];

        if (!feature.description || !feature.acceptance_criteria) {
            steps.push({
                title: 'Complete Feature Overview',
                description: 'Define description and acceptance criteria',
                action: () => {
                    if (!feature.description) handleEdit('description');
                    else handleEdit('acceptance_criteria');
                },
                icon: MessageSquareIcon,
                priority: 'high',
            });
        }

        if (!feature.user_flows && (feature.description || feature.acceptance_criteria)) {
            steps.push({
                title: 'Define User Flows',
                description: 'Map out user journey and interaction paths',
                action: () => handleEdit('user_flows'),
                icon: RouteIcon,
                priority: 'high',
            });
        }

        if (!feature.erd && (feature.description || feature.acceptance_criteria)) {
            steps.push({
                title: 'Design Database Schema',
                description: 'Create ER diagram for data model',
                action: () =>
                    feature.erd ? router.visit(`/features/${feature.id}/erd`) : router.post(`/features/${feature.id}/erd/generate`),
                icon: DatabaseIcon,
                priority: 'medium',
            });
        }

        if (!feature.sequence_diagram && feature.erd) {
            steps.push({
                title: 'Create Sequence Diagram',
                description: 'Visualize system component interactions',
                action: () =>
                    feature.sequence_diagram
                        ? router.visit(`/features/${feature.id}/sequence`)
                        : router.post(`/features/${feature.id}/sequence/generate`),
                icon: WorkflowIcon,
                priority: 'medium',
            });
        }

        if (!feature.wireframe && (feature.user_flows || feature.sequence_diagram)) {
            steps.push({
                title: 'Design Wireframe',
                description: 'Create UI mockup and design specs',
                action: () =>
                    feature.wireframe
                        ? router.visit(`/features/${feature.id}/wireframe`)
                        : router.post(`/features/${feature.id}/wireframe/generate`),
                icon: LayoutIcon,
                priority: 'low',
            });
        }

        if (!feature.metrics) {
            steps.push({
                title: 'Define Success Metrics',
                description: 'Set measurable KPIs for this feature',
                action: () => handleEdit('metrics'),
                icon: TargetIcon,
                priority: 'low',
            });
        }

        return steps.slice(0, 3);
    };

    // Helper to get artifact completion status
    const getArtifactCompletion = () => {
        return [
            {
                name: 'Feature Overview',
                completed: !!(feature.description && feature.acceptance_criteria),
                icon: MessageSquareIcon,
                action: () => {
                    if (!feature.description) handleEdit('description');
                    else handleEdit('acceptance_criteria');
                },
            },
            {
                name: 'Database Schema',
                completed: !!feature.erd,
                icon: DatabaseIcon,
                action: () =>
                    feature.erd ? router.visit(`/features/${feature.id}/erd`) : router.post(`/features/${feature.id}/erd/generate`),
            },
            {
                name: 'Sequence Diagram',
                completed: !!feature.sequence_diagram,
                icon: WorkflowIcon,
                action: () =>
                    feature.sequence_diagram
                        ? router.visit(`/features/${feature.id}/sequence`)
                        : router.post(`/features/${feature.id}/sequence/generate`),
            },
            {
                name: 'Wireframe',
                completed: !!feature.wireframe,
                icon: LayoutIcon,
                action: () =>
                    feature.wireframe
                        ? router.visit(`/features/${feature.id}/wireframe`)
                        : router.post(`/features/${feature.id}/wireframe/generate`),
            },
        ];
    };

    return (
        <>
            <Head title={`Feature: ${feature.name}`} />
            <div className="min-h-screen bg-background">
                <div className="flex">
                    <FeatureSidebar
                        project={project}
                        feature={feature}
                        activeSection="overview"
                        auth={auth}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
                                <Breadcrumbs
                                    breadcrumbs={[
                                        { title: project.name, href: `/projects/${project.id}` },
                                        { title: feature.name, href: `/features/${feature.id}` },
                                    ]}
                                />
                            </div>

                            <header className="mb-8">
                                <div className="mb-4">
                                    <div className="group flex cursor-pointer items-center gap-2" onClick={() => handleEdit('name')}>
                                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{data.name}</h1>
                                        <PencilIcon className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">Feature development workspace</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select value={data.status} onValueChange={handleStatusChange} disabled={processing}>
                                        <SelectTrigger
                                            className={`h-auto w-auto min-w-[120px] border px-2.5 py-1 text-xs font-medium ${getStatusColor(data.status)}`}
                                        >
                                            <SelectValue>
                                                <span className="inline-flex items-center gap-1.5">
                                                    {getStatusIcon(data.status)}
                                                    {data.status === 'in_progress'
                                                        ? 'In Progress'
                                                        : data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                                </span>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={data.priority} onValueChange={handlePriorityChange} disabled={processing}>
                                        <SelectTrigger
                                            className={`h-auto w-auto min-w-[100px] border px-2.5 py-1 text-xs font-medium ${getPriorityColor(data.priority)}`}
                                        >
                                            <SelectValue>
                                                <span className="capitalize">{data.priority}</span>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Badge variant="outline" className="text-xs">
                                        Order #{data.order_of_implementation}
                                    </Badge>
                                </div>
                            </header>

                            {/* Feature Metrics Dashboard */}
                            <section className="mb-8 space-y-8">
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="rounded border p-4">
                                        <div className="mb-1 text-xs font-medium text-muted-foreground">Overall Progress</div>
                                        <div className="mb-2 text-2xl font-semibold text-foreground">{calculateProgress}%</div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div className="h-full bg-foreground transition-all" style={{ width: `${calculateProgress}%` }} />
                                        </div>
                                    </div>

                                    <div className="rounded border p-4">
                                        <div className="mb-1 text-xs font-medium text-muted-foreground">Artifacts Completed</div>
                                        <div className="mb-2 text-2xl font-semibold text-foreground">
                                            {getArtifactCompletion().filter((a) => a.completed).length}/4
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <health.Icon className={`h-3.5 w-3.5 ${health.color}`} />
                                            <span className={`capitalize ${health.color}`}>{health.label}</span>
                                        </div>
                                    </div>

                                    <div className="rounded border p-4">
                                        <div className="mb-1 text-xs font-medium text-muted-foreground">Feature Status</div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-sm ${getStatusColor(data.status)}`}
                                            >
                                                {getStatusIcon(data.status)}
                                                {data.status === 'in_progress' ? 'In Progress' : data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span className={`rounded border px-1.5 py-0.5 ${getPriorityColor(data.priority)}`}>
                                                {data.priority.charAt(0).toUpperCase() + data.priority.slice(1)} Priority
                                            </span>
                                        </div>
                                    </div>

                                    <div className="rounded border p-4">
                                        <div className="mb-1 text-xs font-medium text-muted-foreground">Implementation Order</div>
                                        <div className="mb-2 text-2xl font-semibold text-foreground">#{data.order_of_implementation}</div>
                                        <div className="text-xs text-muted-foreground">
                                            <button onClick={() => handleEdit('order_of_implementation')} className="text-foreground hover:underline">
                                                Edit Order
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Next Steps Section */}
                                {getNextSteps().length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <ArrowRightIcon className="h-5 w-5 text-foreground" />
                                            <h2 className="text-lg font-semibold text-foreground">Next Steps</h2>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            {getNextSteps().map((step, index) => (
                                                <div
                                                    key={index}
                                                    className="group cursor-pointer rounded border p-4 transition-colors hover:bg-muted/40"
                                                    onClick={step.action}
                                                >
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <div
                                                            className={`flex h-10 w-10 items-center justify-center rounded ${
                                                                step.priority === 'high' ? 'bg-orange-100 dark:bg-orange-500/10' : 'bg-muted'
                                                            }`}
                                                        >
                                                            <step.icon
                                                                className={`h-5 w-5 ${
                                                                    step.priority === 'high' ? 'text-orange-600 dark:text-orange-400' : 'text-foreground'
                                                                }`}
                                                            />
                                                        </div>
                                                        {step.priority === 'high' && (
                                                            <span className="rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400">
                                                                Priority
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="mb-1 text-sm font-semibold text-foreground">{step.title}</h3>
                                                    <p className="text-xs text-muted-foreground">{step.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Artifact Completion Breakdown */}
                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold text-foreground">Feature Artifacts</h2>
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                        {getArtifactCompletion().map((item, index) => (
                                            <div
                                                key={index}
                                                className="cursor-pointer rounded border p-4 transition-colors hover:bg-muted/40"
                                                onClick={item.action}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex h-8 w-8 items-center justify-center rounded ${
                                                                item.completed ? 'bg-emerald-100 dark:bg-emerald-500/10' : 'bg-muted'
                                                            }`}
                                                        >
                                                            {item.completed ? (
                                                                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                            ) : (
                                                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-foreground">{item.name}</div>
                                                        </div>
                                                    </div>
                                                    <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                {!item.completed && (
                                                    <div className="mt-3">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 gap-1 text-xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                item.action();
                                                            }}
                                                        >
                                                            <SparklesIcon className="h-3 w-3" />
                                                            {item.name.includes('Overview') ? 'Complete' : 'Generate'}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="justify-start"
                                            onClick={() => handleEdit('summary')}
                                        >
                                            <FileIcon className="mr-2 h-4 w-4" />
                                            Edit Summary
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="justify-start"
                                            onClick={() => handleEdit('description')}
                                        >
                                            <MessageSquareIcon className="mr-2 h-4 w-4" />
                                            Edit Description
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="justify-start"
                                            onClick={() => handleEdit('acceptance_criteria')}
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Acceptance Criteria
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="justify-start"
                                            onClick={() => router.visit(`/features/${feature.id}/specs`)}
                                        >
                                            <FileIcon className="mr-2 h-4 w-4" />
                                            View Full Specs
                                        </Button>
                                    </div>
                                </div>

                                {/* Feature Content - Expandable Sections */}
                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold text-foreground">Feature Details</h2>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Summary Card */}
                                        {data.summary && (
                                            <div className="rounded border p-4">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500/10">
                                                            <FileIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-foreground">Summary</h3>
                                                            <p className="text-xs text-muted-foreground">Brief overview</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="ghost" onClick={() => handleEdit('summary')} className="h-7 w-7 p-0">
                                                        <PencilIcon className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="whitespace-pre-wrap text-sm text-foreground/90">{data.summary}</div>
                                            </div>
                                        )}

                                        {/* User Flows Card */}
                                        {data.user_flows && (
                                            <div className="rounded border p-4">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-cyan-500/10">
                                                            <RouteIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-foreground">User Flows</h3>
                                                            <p className="text-xs text-muted-foreground">User journey paths</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="ghost" onClick={() => handleEdit('user_flows')} className="h-7 w-7 p-0">
                                                        <PencilIcon className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="whitespace-pre-wrap text-sm text-foreground/90">{data.user_flows}</div>
                                            </div>
                                        )}

                                        {/* Description Card */}
                                        {data.description && (
                                            <div className="rounded border p-4 md:col-span-2">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-500/10">
                                                            <MessageSquareIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-foreground">Description</h3>
                                                            <p className="text-xs text-muted-foreground">Detailed implementation details</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="ghost" onClick={() => handleEdit('description')} className="h-7 w-7 p-0">
                                                        <PencilIcon className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="whitespace-pre-wrap text-sm text-foreground/90">{data.description}</div>
                                            </div>
                                        )}

                                        {/* Acceptance Criteria Card */}
                                        {data.acceptance_criteria && (
                                            <div className="rounded border p-4 md:col-span-2">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500/10">
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-foreground">Acceptance Criteria</h3>
                                                            <p className="text-xs text-muted-foreground">Conditions for completion</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEdit('acceptance_criteria')}
                                                        className="h-7 w-7 p-0"
                                                    >
                                                        <PencilIcon className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="whitespace-pre-wrap text-sm text-foreground/90">{data.acceptance_criteria}</div>
                                            </div>
                                        )}

                                        {/* Metrics Card */}
                                        {data.metrics && (
                                            <div className="rounded border p-4 md:col-span-2">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-500/10">
                                                            <TargetIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-foreground">Success Metrics</h3>
                                                            <p className="text-xs text-muted-foreground">KPIs and measurement criteria</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="ghost" onClick={() => handleEdit('metrics')} className="h-7 w-7 p-0">
                                                        <PencilIcon className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="whitespace-pre-wrap text-sm text-foreground/90">{data.metrics}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={!!editingField} onOpenChange={(open) => !open && handleCancel()}>
                <DialogContent className="max-w-4xl border-border/50 bg-background/95 backdrop-blur-xl">
                    <DialogHeader className="space-y-3 border-b border-border/30 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-muted/30">
                                <PencilIcon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold tracking-tight">
                                    Edit{' '}
                                    {editingField === 'acceptance_criteria'
                                        ? 'Acceptance Criteria'
                                        : editingField === 'user_flows'
                                          ? 'User Flows'
                                          : editingField === 'order_of_implementation'
                                            ? 'Order of Implementation'
                                            : editingField
                                              ? editingField.charAt(0).toUpperCase() + editingField.slice(1)
                                              : ''}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground/80">
                                    Make changes to the{' '}
                                    {editingField === 'acceptance_criteria'
                                        ? 'acceptance criteria'
                                        : editingField === 'user_flows'
                                          ? 'user flows'
                                          : editingField === 'order_of_implementation'
                                            ? 'order of implementation'
                                            : editingField || ''}{' '}
                                    below.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-6">
                        <div className="space-y-3">
                            <Label htmlFor="edit-field" className="text-sm font-medium text-foreground/90">
                                {editingField === 'acceptance_criteria'
                                    ? 'Acceptance Criteria'
                                    : editingField === 'user_flows'
                                      ? 'User Flows'
                                      : editingField === 'order_of_implementation'
                                        ? 'Order of Implementation'
                                        : editingField
                                          ? editingField.charAt(0).toUpperCase() + editingField.slice(1)
                                          : ''}
                            </Label>
                            {editingField === 'order_of_implementation' ? (
                                <Input
                                    id="edit-field"
                                    type="number"
                                    value={data.order_of_implementation}
                                    onChange={(e) => setData('order_of_implementation', parseInt(e.target.value, 10) || 1)}
                                    className="rounded-lg border-border/50 bg-muted/30"
                                    min={1}
                                />
                            ) : (
                                <Textarea
                                    id="edit-field"
                                    value={
                                        editingField &&
                                        (editingField === 'summary' ||
                                            editingField === 'description' ||
                                            editingField === 'acceptance_criteria' ||
                                            editingField === 'user_flows' ||
                                            editingField === 'metrics' ||
                                            editingField === 'name')
                                            ? data[editingField]
                                            : ''
                                    }
                                    onChange={(e) => {
                                        if (
                                            editingField &&
                                            (editingField === 'summary' ||
                                                editingField === 'description' ||
                                                editingField === 'acceptance_criteria' ||
                                                editingField === 'user_flows' ||
                                                editingField === 'metrics' ||
                                                editingField === 'name')
                                        ) {
                                            setData(editingField, e.target.value);
                                        }
                                    }}
                                    rows={14}
                                    className="resize-none rounded-lg border-border/50 bg-muted/30 font-mono text-sm leading-relaxed shadow-sm transition-colors focus:border-primary/50 focus:bg-background"
                                    placeholder={`Enter ${editingField === 'acceptance_criteria' ? 'acceptance criteria' : editingField === 'user_flows' ? 'user flows' : editingField || ''} here...`}
                                />
                            )}
                            {editingField !== 'order_of_implementation' && (
                                <p className="text-xs text-muted-foreground/60">Pro tip: Use markdown formatting for better structure</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 border-t border-border/30 pt-6">
                        <Button variant="outline" onClick={handleCancel} disabled={processing} className="gap-2 border-border/50 hover:bg-muted/50">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={processing} className="gap-2 shadow-sm">
                            {processing ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
