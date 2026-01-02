import FeatureSidebar from '@/components/Features/FeatureSidebar';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { ContentCard } from '@/components/ContentCard';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type Project, type SharedData } from '@/types';
import { type FeatureItem, type FeaturePriority, type FeatureStatus, type ModuleItem } from '@/types/modules';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { getPriorityColor, getStatusColor, getHealthIndicator } from '@/utils/featureStatus';
import {
    ArrowLeft,
    CheckCircle2,
    DatabaseIcon,
    FileTextIcon,
    LayoutIcon,
    MessageSquareIcon,
    PencilIcon,
    RouteIcon,
    TargetIcon,
    WorkflowIcon,
    ZapIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Props {
    project: Project;
    module: ModuleItem;
    feature: FeatureItem;
}

export default function Show({ project, module, feature }: Props) {
    useFlashToasts();
    const { auth } = usePage<SharedData>().props;
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

    const handleEdit = useCallback((field: string) => {
        setEditingField(field);
    }, []);

    const handleSave = useCallback(() => {
        if (!editingField) return;

        put(`/projects/${project.id}/modules/${module.id}/features/${feature.id}/update`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingField(null);
            },
        });
    }, [editingField, project.id, module.id, feature.id, put]);

    const handleCancel = useCallback(() => {
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
    }, [feature, setData]);

    const handleStatusChange = useCallback((newStatus: FeatureStatus) => {
        router.put(`/projects/${project.id}/modules/${module.id}/features/${feature.id}/update`, 
            { status: newStatus },
            { preserveScroll: true }
        );
    }, [project.id, module.id, feature.id]);

    const handlePriorityChange = useCallback((newPriority: FeaturePriority) => {
        router.put(`/projects/${project.id}/modules/${module.id}/features/${feature.id}/update`, 
            { priority: newPriority },
            { preserveScroll: true }
        );
    }, [project.id, module.id, feature.id]);

    // Use backend-computed progress for consistency with sidebar
    const featureProgress = feature.progress ?? 0;

    const health = useMemo(() => getHealthIndicator(featureProgress), [featureProgress]);

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Modules', href: `/projects/${project.id}/modules` },
        { title: module.name, href: `/projects/${project.id}/modules/${module.id}` },
        { title: feature.name, href: `/projects/${project.id}/modules/${module.id}/features/${feature.id}` },
    ];

    const artifacts = [
        { name: 'Feature Overview', completed: !!(feature.description && feature.acceptance_criteria), icon: MessageSquareIcon, action: () => handleEdit(feature.description ? 'acceptance_criteria' : 'description'), disabled: false },
        { name: 'Database Schema', completed: !!feature.datamodel, icon: DatabaseIcon, action: () => feature.datamodel ? router.visit(`/features/${feature.id}/datamodel`) : undefined, disabled: !feature.datamodel },
        { name: 'Sequence Diagram', completed: !!feature.sequence_diagram, icon: WorkflowIcon, action: () => feature.sequence_diagram ? router.visit(`/features/${feature.id}/sequence-diagram`) : router.post(`/features/${feature.id}/sequence-diagram/generate`), disabled: false },
        { name: 'Wireframe', completed: !!feature.wireframe, icon: LayoutIcon, action: () => feature.wireframe ? router.visit(`/features/${feature.id}/wireframe`) : router.post(`/features/${feature.id}/wireframe/generate`), disabled: false },
    ];

    const completedArtifacts = artifacts.filter((a) => a.completed).length;

    // Determine health icon background color
    const healthBgColor = health.color.includes('emerald') ? 'bg-emerald-500/10' 
        : health.color.includes('blue') ? 'bg-blue-500/10' 
        : health.color.includes('orange') ? 'bg-amber-500/10' 
        : 'bg-red-500/10';

    return (
        <>
            <Head title={`${feature.name} - ${project.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <FeatureSidebar
                        project={project}
                        module={module}
                        feature={feature}
                        activeSection="overview"
                        auth={auth}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    />

                    <main className="flex min-w-0 flex-1 flex-col">
                        <div className="shrink-0 border-b border-border/50 bg-muted/20 px-4 py-3 sm:px-6">
                            <div className="flex items-center gap-3">
                                <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="py-8 pr-4 pb-32 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">
                                {/* Header */}
                                <header className="mb-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.visit(`/projects/${project.id}/modules/${module.id}`)}
                                                    className="gap-2"
                                                >
                                                    <ArrowLeft className="h-4 w-4" />
                                                    Back to Module
                                                </Button>
                                            </div>
                                            <div className="group mt-2 flex cursor-pointer items-center gap-3" onClick={() => handleEdit('name')}>
                                                <ZapIcon className="h-8 w-8 text-primary" />
                                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{data.name}</h1>
                                                <PencilIcon className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                                <Select value={data.status} onValueChange={handleStatusChange} disabled={processing}>
                                                    <SelectTrigger
                                                        className={`h-7 w-auto border-0 px-2.5 text-xs font-medium shadow-none ring-1 ring-inset ${getStatusColor(data.status)}`}
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="todo">To Do</SelectItem>
                                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                                        <SelectItem value="review">Review</SelectItem>
                                                        <SelectItem value="done">Done</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Select value={data.priority} onValueChange={handlePriorityChange} disabled={processing}>
                                                    <SelectTrigger
                                                        className={`h-7 w-auto border-0 px-2.5 text-xs font-medium shadow-none ring-1 ring-inset ${getPriorityColor(data.priority)}`}
                                                    >
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
                                </header>

                                {/* Minimal Stats Bar */}
                                <div className="mb-8 flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <ZapIcon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-semibold text-foreground">{featureProgress}%</div>
                                            <div className="text-xs text-muted-foreground">Progress</div>
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-border" />
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${healthBgColor}`}>
                                            <health.Icon className={`h-5 w-5 ${health.color}`} />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-semibold text-foreground">{completedArtifacts}/4</div>
                                            <div className="text-xs text-muted-foreground">Artifacts</div>
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-border" />
                                    <div className="flex items-center gap-1.5">
                                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${getStatusColor(data.status)}`}>
                                            {data.status === 'in_progress' ? 'In Progress' : data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="h-8 w-px bg-border" />
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="text-xs">Order</span>
                                        <span className="text-sm font-medium text-foreground">#{data.order_of_implementation}</span>
                                    </div>
                                </div>

                                {/* Feature Artifacts Section */}
                                <div className="mb-8">
                                    <h2 className="mb-4 flex items-center gap-2 text-base font-medium text-foreground">
                                        <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                                        Feature Artifacts
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        {artifacts.map((item, index) => {
                                            const iconColorClass = item.disabled 
                                                ? 'bg-muted/50 text-muted-foreground/50'
                                                : item.completed 
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                                    : 'bg-muted text-muted-foreground';
                                            
                                            return (
                                                <div
                                                    key={index}
                                                    className={`group cursor-pointer rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm transition-all duration-200 ease-out ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5'}`}
                                                    onClick={item.disabled ? undefined : item.action}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconColorClass}`}>
                                                                <item.icon className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <span className={`font-medium transition-colors ${item.disabled ? 'text-muted-foreground/50' : 'text-foreground group-hover:text-primary'}`}>
                                                                    {item.completed ? 'View & Edit' : 'Generate'}
                                                                </span>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {item.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {!item.disabled && (
                                                            <Button
                                                                variant={item.completed ? 'ghost' : 'default'}
                                                                size="sm"
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    item.action();
                                                                }}
                                                            >
                                                                {item.completed ? 'Open' : 'Generate'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Feature Details */}
                                <div className="space-y-4">
                                    <h2 className="flex items-center gap-2 text-base font-medium text-foreground">
                                        <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                                        Feature Details
                                    </h2>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <ContentCard
                                            title="Summary"
                                            field="summary"
                                            icon={FileTextIcon}
                                            placeholder="Add a brief summary..."
                                            value={data.summary}
                                            onEdit={handleEdit}
                                        />
                                        <ContentCard
                                            title="User Flows"
                                            field="user_flows"
                                            icon={RouteIcon}
                                            placeholder="Map out user journeys..."
                                            value={data.user_flows}
                                            onEdit={handleEdit}
                                        />
                                        <ContentCard
                                            title="Description"
                                            field="description"
                                            icon={MessageSquareIcon}
                                            placeholder="Describe the feature in detail..."
                                            value={data.description}
                                            onEdit={handleEdit}
                                            className="md:col-span-2"
                                        />
                                        <ContentCard
                                            title="Acceptance Criteria"
                                            field="acceptance_criteria"
                                            icon={CheckCircle2}
                                            placeholder="Define conditions for completion..."
                                            value={data.acceptance_criteria}
                                            onEdit={handleEdit}
                                            className="md:col-span-2"
                                        />
                                        <ContentCard
                                            title="Success Metrics"
                                            field="metrics"
                                            icon={TargetIcon}
                                            placeholder="Set KPIs and measurements..."
                                            value={data.metrics}
                                            onEdit={handleEdit}
                                            className="md:col-span-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
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
                        ) : editingField === 'name' ? (
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Feature name..." />
                        ) : (
                            <Textarea
                                value={data[editingField as keyof typeof data] as string}
                                onChange={(e) => setData(editingField as keyof typeof data, e.target.value)}
                                rows={10}
                                className="font-mono text-sm"
                                placeholder="Type your content here..."
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel} disabled={processing}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={processing}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
