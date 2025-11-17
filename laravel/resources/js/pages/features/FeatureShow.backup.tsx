import FeatureSidebar from '@/components/features/FeatureSidebar';
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
    CheckCircle2,
    CircleIcon,
    ClockIcon,
    DatabaseIcon,
    FileIcon,
    LayoutGridIcon,
    LayoutIcon,
    LucideIcon,
    MessageSquareIcon,
    PanelLeftClose,
    PanelLeftOpen,
    PencilIcon,
    PlayIcon,
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

    // Helper function to get step status for roadmap
    const getStepStatus = (step: string) => {
        switch (step) {
            case 'overview': {
                const overviewCompleted = !!(feature.description && feature.acceptance_criteria);
                const overviewCurrent = !overviewCompleted;
                return { isCompleted: overviewCompleted, isCurrent: overviewCurrent };
            }

            case 'erd': {
                const erdCompleted = !!feature.erd;
                const erdCurrent = !erdCompleted && (feature.description || feature.acceptance_criteria);
                return { isCompleted: erdCompleted, isCurrent: erdCurrent };
            }

            case 'sequence': {
                const sequenceCompleted = !!feature.sequence_diagram;
                const sequenceCurrent = !sequenceCompleted && feature.erd;
                return { isCompleted: sequenceCompleted, isCurrent: sequenceCurrent };
            }

            case 'wireframe': {
                const wireframeCompleted = !!feature.wireframe;
                const wireframeCurrent = !wireframeCompleted && (feature.user_flows || feature.sequence_diagram);
                return { isCompleted: wireframeCompleted, isCurrent: wireframeCurrent };
            }

            default:
                return { isCompleted: false, isCurrent: false };
        }
    };

    // Helper function to get completed steps count
    const getCompletedStepsCount = () => {
        let count = 0;
        if (getStepStatus('overview').isCompleted) count++;
        if (getStepStatus('erd').isCompleted) count++;
        if (getStepStatus('sequence').isCompleted) count++;
        if (getStepStatus('wireframe').isCompleted) count++;
        return count;
    };

    const EditableFieldCard = ({
        title,
        description,
        icon: Icon,
        value,
        onEdit,
        iconColor,
        iconBgColor,
    }: {
        title: string;
        description: string;
        icon: LucideIcon;
        value: string | null;
        onEdit: () => void;
        iconColor: string;
        iconBgColor: string;
    }) => (
        <div className="rounded border p-4">
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded ${iconBgColor}`}>
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                </div>
                <Button size="sm" variant="ghost" onClick={onEdit} className="h-7 w-7 p-0">
                    <PencilIcon className="h-3.5 w-3.5" />
                </Button>
            </div>
            {value ? (
                <div className="text-sm whitespace-pre-wrap text-foreground/90">{value}</div>
            ) : (
                <p className="text-xs text-muted-foreground">No content yet. Click edit to add.</p>
            )}
        </div>
    );

    const SectionCard = ({
        title,
        description,
        icon: Icon,
        content,
        emptyCta,
        onCta,
        showCheck,
        iconColor,
        iconBgColor,
    }: {
        title: string;
        description: string;
        icon: LucideIcon;
        content?: string | null;
        emptyCta?: React.ReactNode;
        onCta?: () => void;
        showCheck?: boolean;
        iconColor: string;
        iconBgColor: string;
    }) => (
        <div className={`rounded border p-4 ${onCta ? 'cursor-pointer transition-colors hover:bg-muted/40' : ''}`} onClick={onCta}>
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded ${iconBgColor}`}>
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                            {showCheck && (
                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                </div>
            </div>
            {content ? (
                <div className="text-sm whitespace-pre-wrap text-foreground/90">{content}</div>
            ) : (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        {showCheck ? 'Already generated. Click to view.' : 'Not generated yet. Click to create.'}
                    </p>
                    {emptyCta && (
                        <Button
                            size="sm"
                            variant={showCheck ? 'default' : 'outline'}
                            onClick={(e) => {
                                e.stopPropagation();
                                onCta?.();
                            }}
                            className="gap-2"
                        >
                            {typeof emptyCta === 'string' ? (
                                <>
                                    <SparklesIcon className="h-3.5 w-3.5" />
                                    {emptyCta}
                                </>
                            ) : (
                                emptyCta
                            )}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );

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
                                            className={`h-auto border px-2.5 py-1 text-xs font-medium ${getStatusColor(data.status)} w-auto min-w-[120px]`}
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
                                            className={`h-auto border px-2.5 py-1 text-xs font-medium ${getPriorityColor(data.priority)} w-auto min-w-[100px]`}
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
                            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded border p-4">
                                    <div className="mb-1 text-xs font-medium text-muted-foreground">Progress</div>
                                    <div className="mb-2 text-2xl font-semibold text-foreground">{calculateProgress}%</div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div className="h-full bg-foreground transition-all" style={{ width: `${calculateProgress}%` }} />
                                    </div>
                                </div>

                                <div className="rounded border p-4">
                                    <div className="mb-1 text-xs font-medium text-muted-foreground">Artifacts</div>
                                    <div className="mb-2 text-2xl font-semibold text-foreground">
                                        {[feature.erd, feature.sequence_diagram, feature.user_flows, feature.wireframe].filter(Boolean).length}
                                        /4
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <health.Icon className={`h-3.5 w-3.5 ${health.color}`} />
                                        <span className={`capitalize ${health.color}`}>{health.label}</span>
                                    </div>
                                </div>

                                <div className="rounded border p-4">
                                    <div className="mb-1 text-xs font-medium text-muted-foreground">Status</div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-sm ${getStatusColor(data.status)}`}
                                        >
                                            {getStatusIcon(data.status)}
                                            {data.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded border p-4">
                                    <div className="mb-1 text-xs font-medium text-muted-foreground">Priority</div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-sm ${getPriorityColor(data.priority)}`}
                                        >
                                            <TargetIcon className="h-3.5 w-3.5" />
                                            <span className="capitalize">{data.priority}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Feature Development Roadmap */}
                            <div className="mb-8">
                                <div className="relative">
                                    {/* Progress Line */}
                                    <div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-border"></div>
                                    <div
                                        className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-700"
                                        style={{ width: `${Math.min(100, (getCompletedStepsCount() / 4) * 100)}%` }}
                                    ></div>

                                    {/* Roadmap Steps */}
                                    <div className="relative flex justify-between">
                                        {/* Overview Step */}
                                        <div
                                            className="group flex cursor-pointer flex-col items-center"
                                            onClick={() => router.visit(`/features/${feature.id}`)}
                                        >
                                            <div
                                                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 group-hover:scale-110 ${
                                                    getStepStatus('overview').isCompleted
                                                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg'
                                                        : getStepStatus('overview').isCurrent
                                                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                                                          : 'border-border bg-background text-muted-foreground group-hover:border-blue-300'
                                                }`}
                                            >
                                                {getStepStatus('overview').isCompleted ? (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                ) : getStepStatus('overview').isCurrent ? (
                                                    <PlayIcon className="h-4 w-4" />
                                                ) : (
                                                    <span className="text-xs font-semibold">1</span>
                                                )}
                                            </div>
                                            <div className="mt-2 text-center">
                                                <p
                                                    className={`text-xs font-medium transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                                                        getStepStatus('overview').isCompleted || getStepStatus('overview').isCurrent
                                                            ? 'text-foreground'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    Overview
                                                </p>
                                            </div>
                                        </div>

                                        {/* ERD Step */}
                                        <div
                                            className="group flex cursor-pointer flex-col items-center"
                                            onClick={() =>
                                                feature.erd
                                                    ? router.visit(`/features/${feature.id}/erd`)
                                                    : router.post(`/features/${feature.id}/erd/generate`)
                                            }
                                        >
                                            <div
                                                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 group-hover:scale-110 ${
                                                    getStepStatus('erd').isCompleted
                                                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg'
                                                        : getStepStatus('erd').isCurrent
                                                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                                                          : 'border-border bg-background text-muted-foreground group-hover:border-blue-300'
                                                }`}
                                            >
                                                {getStepStatus('erd').isCompleted ? (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                ) : getStepStatus('erd').isCurrent ? (
                                                    <DatabaseIcon className="h-4 w-4" />
                                                ) : (
                                                    <span className="text-xs font-semibold">2</span>
                                                )}
                                            </div>
                                            <div className="mt-2 text-center">
                                                <p
                                                    className={`text-xs font-medium transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                                                        getStepStatus('erd').isCompleted || getStepStatus('erd').isCurrent
                                                            ? 'text-foreground'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    ERD
                                                </p>
                                            </div>
                                        </div>

                                        {/* Sequence Step */}
                                        <div
                                            className="group flex cursor-pointer flex-col items-center"
                                            onClick={() =>
                                                feature.sequence_diagram
                                                    ? router.visit(`/features/${feature.id}/sequence-diagram`)
                                                    : router.post(`/features/${feature.id}/sequence-diagram/generate`)
                                            }
                                        >
                                            <div
                                                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 group-hover:scale-110 ${
                                                    getStepStatus('sequence').isCompleted
                                                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg'
                                                        : getStepStatus('sequence').isCurrent
                                                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                                                          : 'border-border bg-background text-muted-foreground group-hover:border-blue-300'
                                                }`}
                                            >
                                                {getStepStatus('sequence').isCompleted ? (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                ) : getStepStatus('sequence').isCurrent ? (
                                                    <MessageSquareIcon className="h-4 w-4" />
                                                ) : (
                                                    <span className="text-xs font-semibold">3</span>
                                                )}
                                            </div>
                                            <div className="mt-2 text-center">
                                                <p
                                                    className={`text-xs font-medium transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                                                        getStepStatus('sequence').isCompleted || getStepStatus('sequence').isCurrent
                                                            ? 'text-foreground'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    Sequence
                                                </p>
                                            </div>
                                        </div>

                                        {/* Wireframe Step */}
                                        <div
                                            className="group flex cursor-pointer flex-col items-center"
                                            onClick={() =>
                                                feature.wireframe
                                                    ? router.visit(`/features/${feature.id}/wireframe`)
                                                    : router.post(`/features/${feature.id}/wireframe/generate`)
                                            }
                                        >
                                            <div
                                                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 group-hover:scale-110 ${
                                                    getStepStatus('wireframe').isCompleted
                                                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg'
                                                        : getStepStatus('wireframe').isCurrent
                                                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                                                          : 'border-border bg-background text-muted-foreground group-hover:border-blue-300'
                                                }`}
                                            >
                                                {getStepStatus('wireframe').isCompleted ? (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                ) : getStepStatus('wireframe').isCurrent ? (
                                                    <FileIcon className="h-4 w-4" />
                                                ) : (
                                                    <span className="text-xs font-semibold">4</span>
                                                )}
                                            </div>
                                            <div className="mt-2 text-center">
                                                <p
                                                    className={`text-xs font-medium transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                                                        getStepStatus('wireframe').isCompleted || getStepStatus('wireframe').isCurrent
                                                            ? 'text-foreground'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    Wireframe
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature Content Section */}
                            <section className="space-y-6">
                                <h2 className="text-lg font-semibold text-foreground">Feature Details</h2>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <EditableFieldCard
                                        title="Summary"
                                        description="Brief overview of the feature"
                                        icon={FileIcon}
                                        value={data.summary}
                                        onEdit={() => handleEdit('summary')}
                                        iconColor="text-blue-600 dark:text-blue-400"
                                        iconBgColor="bg-blue-500/10 dark:bg-blue-500/20"
                                    />
                                    <EditableFieldCard
                                        title="Order of Implementation"
                                        description="The order in which this feature should be implemented"
                                        icon={LayoutGridIcon}
                                        value={data.order_of_implementation.toString()}
                                        onEdit={() => handleEdit('order_of_implementation')}
                                        iconColor="text-purple-600 dark:text-purple-400"
                                        iconBgColor="bg-purple-500/10 dark:bg-purple-500/20"
                                    />
                                </div>

                                <EditableFieldCard
                                    title="Description"
                                    description="High-level description and implementation details"
                                    icon={MessageSquareIcon}
                                    value={data.description}
                                    onEdit={() => handleEdit('description')}
                                    iconColor="text-purple-600 dark:text-purple-400"
                                    iconBgColor="bg-purple-500/10 dark:bg-purple-500/20"
                                />

                                <EditableFieldCard
                                    title="Acceptance Criteria"
                                    description="Conditions to consider this feature complete"
                                    icon={CheckCircle2}
                                    value={data.acceptance_criteria}
                                    onEdit={() => handleEdit('acceptance_criteria')}
                                    iconColor="text-emerald-600 dark:text-emerald-400"
                                    iconBgColor="bg-emerald-500/10 dark:bg-emerald-500/20"
                                />

                                <EditableFieldCard
                                    title="User Flows"
                                    description="User flows, happy paths, and edge case scenarios"
                                    icon={RouteIcon}
                                    value={data.user_flows}
                                    onEdit={() => handleEdit('user_flows')}
                                    iconColor="text-cyan-600 dark:text-cyan-400"
                                    iconBgColor="bg-cyan-500/10 dark:bg-cyan-500/20"
                                />

                                <EditableFieldCard
                                    title="Metrics"
                                    description="Success metrics and KPIs for this feature"
                                    icon={TargetIcon}
                                    value={data.metrics}
                                    onEdit={() => handleEdit('metrics')}
                                    iconColor="text-orange-600 dark:text-orange-400"
                                    iconBgColor="bg-orange-500/10 dark:bg-orange-500/20"
                                />
                            </section>

                            {/* Feature Artifacts Section */}
                            <section className="mt-8 space-y-6">
                                <h2 className="text-lg font-semibold text-foreground">Feature Artifacts</h2>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <SectionCard
                                        title="Entity-Relationship Diagram"
                                        description="Database schema, entities, and relationships for this feature"
                                        icon={DatabaseIcon}
                                        content={null}
                                        showCheck={!!feature.erd}
                                        emptyCta={feature.erd ? 'Open ERD' : 'Generate ERD'}
                                        onCta={() =>
                                            feature.erd
                                                ? router.visit(`/features/${feature.id}/erd`)
                                                : router.post(`/features/${feature.id}/erd/generate`)
                                        }
                                        iconColor="text-orange-600 dark:text-orange-400"
                                        iconBgColor="bg-orange-500/10 dark:bg-orange-500/20"
                                    />
                                    <SectionCard
                                        title="Sequence Diagram"
                                        description="Interactive flow and communication between system components"
                                        icon={WorkflowIcon}
                                        content={null}
                                        showCheck={!!feature.sequence_diagram}
                                        emptyCta={feature.sequence_diagram ? 'Open Sequence Diagram' : 'Generate Sequence Diagram'}
                                        onCta={() => {
                                            if (feature.sequence_diagram) {
                                                router.visit(`/features/${feature.id}/sequence-diagram`);
                                            } else {
                                                router.post(`/features/${feature.id}/sequence-diagram/generate`);
                                            }
                                        }}
                                        iconColor="text-pink-600 dark:text-pink-400"
                                        iconBgColor="bg-pink-500/10 dark:bg-pink-500/20"
                                    />
                                    <SectionCard
                                        title="Wireframe & UI Design"
                                        description="Visual mockups and user interface design specifications"
                                        icon={LayoutIcon}
                                        content={null}
                                        showCheck={!!feature.wireframe}
                                        emptyCta={feature.wireframe ? 'Open Wireframe' : 'Generate Wireframe'}
                                        onCta={() =>
                                            feature.wireframe
                                                ? router.visit(`/features/${feature.id}/wireframe`)
                                                : router.post(`/features/${feature.id}/wireframe/generate`)
                                        }
                                        iconColor="text-indigo-600 dark:text-indigo-400"
                                        iconBgColor="bg-indigo-500/10 dark:bg-indigo-500/20"
                                    />
                                    <SectionCard
                                        title="Complete Feature Specifications"
                                        description="Comprehensive markdown document combining all feature specifications"
                                        icon={FileIcon}
                                        content={null}
                                        showCheck={true}
                                        emptyCta="View Specs"
                                        onCta={() => router.visit(`/features/${feature.id}/specs`)}
                                        iconColor="text-violet-600 dark:text-violet-400"
                                        iconBgColor="bg-violet-500/10 dark:bg-violet-500/20"
                                    />
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
