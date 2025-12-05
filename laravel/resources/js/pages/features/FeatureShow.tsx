import FeatureSidebar from '@/components/Features/FeatureSidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
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
import { toast } from 'sonner';

interface Project {
    id: number;
    name: string;
}

interface Module {
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
    module: Module;
    feature: FeatureItem;
}

export default function Show({ project, module, feature }: Props) {
    useFlashToasts();
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
    }, [feature]);

    const handleEdit = (field: string) => {
        setEditingField(field);
    };

    const handleSave = () => {
        if (!editingField) return;

        put(`/features/${feature.id}/update`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingField(null);
                toast.success('Feature updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update feature. Please try again.');
            },
        });
    };

    const handleCancel = () => {
        setEditingField(null);
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
            onSuccess: () => toast.success('Status updated successfully!'),
            onError: () => toast.error('Failed to update status.'),
        });
    };

    const handlePriorityChange = (newPriority: 'low' | 'medium' | 'high' | 'critical') => {
        setData('priority', newPriority);
        put(`/features/${feature.id}/update`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Priority updated successfully!'),
            onError: () => toast.error('Failed to update priority.'),
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20';
            case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
            case 'high': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20';
            case 'medium': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20';
        }
    };

    const calculateProgress = useMemo(() => {
        const artifacts = [
            !!(feature.description && feature.acceptance_criteria),
            !!feature.erd,
            !!feature.sequence_diagram,
            !!feature.wireframe,
        ];
        return Math.round((artifacts.filter(Boolean).length / 4) * 100);
    }, [feature]);

    const health = useMemo(() => {
        if (calculateProgress >= 80) return { label: 'excellent', Icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' };
        if (calculateProgress >= 60) return { label: 'good', Icon: CheckCircle2, color: 'text-blue-600 dark:text-blue-400' };
        if (calculateProgress >= 40) return { label: 'fair', Icon: AlertCircleIcon, color: 'text-orange-600 dark:text-orange-400' };
        return { label: 'needs attention', Icon: AlertCircleIcon, color: 'text-red-600 dark:text-red-400' };
    }, [calculateProgress]);

    const getNextSteps = () => {
        const steps = [];
        if (!feature.description || !feature.acceptance_criteria) {
            steps.push({
                title: 'Complete Overview',
                description: 'Define description & criteria',
                action: () => handleEdit(feature.description ? 'acceptance_criteria' : 'description'),
                icon: MessageSquareIcon,
                priority: 'high',
            });
        }
        if (!feature.user_flows && (feature.description || feature.acceptance_criteria)) {
            steps.push({
                title: 'Define User Flows',
                description: 'Map out user journeys',
                action: () => handleEdit('user_flows'),
                icon: RouteIcon,
                priority: 'high',
            });
        }
        if (!feature.erd && (feature.description || feature.acceptance_criteria)) {
            steps.push({
                title: 'Design Schema',
                description: 'Create ER diagram',
                action: () => feature.erd ? router.visit(`/features/${feature.id}/erd`) : router.post(`/features/${feature.id}/erd/generate`),
                icon: DatabaseIcon,
                priority: 'medium',
            });
        }
        if (!feature.sequence_diagram && feature.erd) {
            steps.push({
                title: 'Sequence Diagram',
                description: 'Visualize interactions',
                action: () => feature.sequence_diagram ? router.visit(`/features/${feature.id}/sequence-diagram`) : router.post(`/features/${feature.id}/sequence-diagram/generate`),
                icon: WorkflowIcon,
                priority: 'medium',
            });
        }
        if (!feature.wireframe && (feature.user_flows || feature.sequence_diagram)) {
            steps.push({
                title: 'Wireframe',
                description: 'Create UI mockup',
                action: () => feature.wireframe ? router.visit(`/features/${feature.id}/wireframe`) : router.post(`/features/${feature.id}/wireframe/generate`),
                icon: LayoutIcon,
                priority: 'low',
            });
        }
        if (!feature.metrics) {
            steps.push({
                title: 'Define Metrics',
                description: 'Set success KPIs',
                action: () => handleEdit('metrics'),
                icon: TargetIcon,
                priority: 'low',
            });
        }
        return steps.slice(0, 3);
    };

    const artifacts = [
        { name: 'Feature Overview', completed: !!(feature.description && feature.acceptance_criteria), icon: MessageSquareIcon, action: () => handleEdit(feature.description ? 'acceptance_criteria' : 'description') },
        { name: 'Database Schema', completed: !!feature.erd, icon: DatabaseIcon, action: () => feature.erd ? router.visit(`/features/${feature.id}/erd`) : router.post(`/features/${feature.id}/erd/generate`) },
        { name: 'Sequence Diagram', completed: !!feature.sequence_diagram, icon: WorkflowIcon, action: () => feature.sequence_diagram ? router.visit(`/features/${feature.id}/sequence-diagram`) : router.post(`/features/${feature.id}/sequence-diagram/generate`) },
        { name: 'Wireframe', completed: !!feature.wireframe, icon: LayoutIcon, action: () => feature.wireframe ? router.visit(`/features/${feature.id}/wireframe`) : router.post(`/features/${feature.id}/wireframe/generate`) },
    ];

    const ContentCard = ({ title, field, icon: Icon, placeholder, className = '' }: { title: string, field: string, icon: any, placeholder: string, className?: string }) => (
        <div className={`group relative rounded-xl border border-border/40 bg-card/50 p-6 transition-all hover:border-border/80 hover:bg-card hover:shadow-sm ${className}`}>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(field)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                    <PencilIcon className="mr-2 h-3.5 w-3.5" />
                    Edit
                </Button>
            </div>
            {data[field as keyof typeof data] ? (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
                    {data[field as keyof typeof data]}
                </div>
            ) : (
                <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border/50 py-8 text-center transition-colors hover:bg-muted/50"
                    onClick={() => handleEdit(field)}
                >
                    <p className="text-sm text-muted-foreground">{placeholder}</p>
                    <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-primary">
                        Add {title}
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <>
            <Head title={`Feature: ${feature.name}`} />
            <div className="flex min-h-screen bg-background">
                <FeatureSidebar
                    project={project}
                    feature={feature}
                    activeSection="overview"
                    auth={auth}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                <main className="flex-1 overflow-y-auto">
                    <div className="px-4 py-6 lg:px-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="mb-4 flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                    className="lg:hidden"
                                >
                                    {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                                </Button>
                                <Breadcrumbs
                                    breadcrumbs={[
                                        { title: project.name, href: `/projects/${project.id}` },
                                        { title: 'Modules', href: `/projects/${project.id}/modules` },
                                        { title: module.name, href: `/projects/${project.id}/modules/${module.id}` },
                                        { title: feature.name, href: `/projects/${project.id}/modules/${module.id}/features/${feature.id}` },
                                    ]}
                                />
                            </div>

                            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-2">
                                    <div className="group flex cursor-pointer items-center gap-3" onClick={() => handleEdit('name')}>
                                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{data.name}</h1>
                                        <PencilIcon className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Select value={data.status} onValueChange={handleStatusChange} disabled={processing}>
                                            <SelectTrigger className={`h-7 w-auto border-0 px-2.5 text-xs font-medium shadow-none ring-1 ring-inset ${getStatusColor(data.status)}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={data.priority} onValueChange={handlePriorityChange} disabled={processing}>
                                            <SelectTrigger className={`h-7 w-auto border-0 px-2.5 text-xs font-medium shadow-none ring-1 ring-inset ${getPriorityColor(data.priority)}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Badge variant="outline" className="h-7 border-border/50 bg-background text-muted-foreground">
                                            Order #{data.order_of_implementation}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-border/40 bg-card/50 p-4">
                                <div className="mb-1 text-xs font-medium text-muted-foreground">Overall Progress</div>
                                <div className="mb-2 text-2xl font-bold text-foreground">{calculateProgress}%</div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${calculateProgress}%` }} />
                                </div>
                            </div>

                            <div className="rounded-xl border border-border/40 bg-card/50 p-4">
                                <div className="mb-1 text-xs font-medium text-muted-foreground">Artifacts Completed</div>
                                <div className="mb-2 text-2xl font-bold text-foreground">
                                    {artifacts.filter((a) => a.completed).length}/4
                                </div>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <health.Icon className={`h-3.5 w-3.5 ${health.color}`} />
                                    <span className={`capitalize ${health.color}`}>{health.label}</span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border/40 bg-card/50 p-4">
                                <div className="mb-1 text-xs font-medium text-muted-foreground">Feature Status</div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium ${getStatusColor(data.status)}`}>
                                        {data.status === 'in_progress' ? 'In Progress' : data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border/40 bg-card/50 p-4">
                                <div className="mb-1 text-xs font-medium text-muted-foreground">Implementation Order</div>
                                <div className="mb-2 text-2xl font-bold text-foreground">#{data.order_of_implementation}</div>
                                <Button variant="link" size="sm" onClick={() => handleEdit('order_of_implementation')} className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
                                    Edit Order
                                </Button>
                            </div>
                        </div>

                        {/* Next Steps */}
                        {getNextSteps().length > 0 && (
                            <div className="mb-8 space-y-4">
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="h-5 w-5 text-primary" />
                                    <h2 className="text-lg font-semibold text-foreground">Next Steps</h2>
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {getNextSteps().map((step, index) => (
                                        <div
                                            key={index}
                                            className="group cursor-pointer rounded-xl border border-border/40 bg-card/50 p-4 transition-all hover:border-border/80 hover:bg-card hover:shadow-sm"
                                            onClick={step.action}
                                        >
                                            <div className="mb-3 flex items-center gap-3">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${step.priority === 'high' ? 'bg-orange-500/10 text-orange-600' : 'bg-muted text-muted-foreground'}`}>
                                                    <step.icon className="h-5 w-5" />
                                                </div>
                                                {step.priority === 'high' && (
                                                    <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                                                        Priority
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="mb-1 font-semibold text-foreground group-hover:text-primary">{step.title}</h3>
                                            <p className="text-xs text-muted-foreground">{step.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Artifacts */}
                        <div className="mb-8 space-y-4">
                            <h2 className="text-lg font-semibold text-foreground">Feature Artifacts</h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {artifacts.map((item, index) => (
                                    <div
                                        key={index}
                                        className="group cursor-pointer rounded-xl border border-border/40 bg-card/50 p-4 transition-all hover:border-border/80 hover:bg-card hover:shadow-sm"
                                        onClick={item.action}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.completed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                                                    {item.completed ? <CheckCircle2 className="h-5 w-5" /> : <item.icon className="h-5 w-5" />}
                                                </div>
                                                <div className="font-medium text-foreground">{item.name}</div>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <Button
                                                size="sm"
                                                variant={item.completed ? 'ghost' : 'outline'}
                                                className="w-full justify-between text-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    item.action();
                                                }}
                                            >
                                                {item.completed ? 'View Artifact' : 'Generate'}
                                                <ArrowRightIcon className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Feature Details */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground">Feature Details</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                <ContentCard
                                    title="Summary"
                                    field="summary"
                                    icon={FileIcon}
                                    placeholder="Add a brief summary..."
                                />
                                <ContentCard
                                    title="User Flows"
                                    field="user_flows"
                                    icon={RouteIcon}
                                    placeholder="Map out user journeys..."
                                />
                                <ContentCard
                                    title="Description"
                                    field="description"
                                    icon={MessageSquareIcon}
                                    placeholder="Detailed implementation details..."
                                    className="md:col-span-2"
                                />
                                <ContentCard
                                    title="Acceptance Criteria"
                                    field="acceptance_criteria"
                                    icon={CheckCircle2}
                                    placeholder="Conditions for completion..."
                                    className="md:col-span-2"
                                />
                                <ContentCard
                                    title="Success Metrics"
                                    field="metrics"
                                    icon={TargetIcon}
                                    placeholder="KPIs and measurements..."
                                    className="md:col-span-2"
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingField} onOpenChange={(open) => !open && handleCancel()}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit {editingField?.replace(/_/g, ' ')}</DialogTitle>
                        <DialogDescription>Make changes to the feature details below.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {editingField === 'order_of_implementation' ? (
                            <Input
                                type="number"
                                value={data.order_of_implementation}
                                onChange={(e) => setData('order_of_implementation', parseInt(e.target.value) || 1)}
                                min={1}
                            />
                        ) : (
                            <Textarea
                                value={data[editingField as keyof typeof data] as string}
                                onChange={(e) => setData(editingField as any, e.target.value)}
                                rows={10}
                                className="font-mono text-sm"
                                placeholder="Type your content here..."
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel} disabled={processing}>Cancel</Button>
                        <Button onClick={handleSave} disabled={processing}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
