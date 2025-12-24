import { Breadcrumbs } from '@/components/breadcrumbs';
import { ContentCard } from '@/components/ContentCard';
import { SyncIndicator } from '@/components/SyncIndicator';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { useErdOperations } from '@/hooks/useErdOperations';
import { type Project, type SharedData, type User } from '@/types';
import type { FeatureItem, ModuleItem, ModuleStatus } from '@/types/modules';
import { getModuleStatusConfig, getFeatureStatusConfig, getFeaturePriorityConfig } from '@/utils/statusHelpers';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
    ArrowLeft,
    BarChart3,
    CheckCircle2,
    DatabaseIcon,
    FileTextIcon,
    Layers,
    Loader2,
    PencilIcon,
    Plus,
    Sparkles,
    ZapIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    project: Project;
    module: ModuleItem;
}

export default function ModuleShow({ project, module }: Props) {
    useFlashToasts();
    const shared = usePage<SharedData>().props;
    const { auth } = shared;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [isGeneratingFeatures, setIsGeneratingFeatures] = useState(false);
    const [isAddFeatureModalOpen, setIsAddFeatureModalOpen] = useState(false);
    const [isCreatingFeature, setIsCreatingFeature] = useState(false);
    const [newFeature, setNewFeature] = useState({ name: '', description: '' });

    // WHY: Hook encapsulates ERD sync logic, reducing duplication with DatabaseDesigner.tsx
    const { isSyncing, syncErd } = useErdOperations({ projectId: project.id, moduleId: module.id });

    const { data, setData, put, processing } = useForm({
        name: module.name,
        description: module.description || '',
        metrics: module.metrics || '',
        erd: module.erd || '',
        status: module.status || 'planned',
        order_of_implementation: module.order_of_implementation || 1,
    });

    // WHY: Syncs form data when module prop changes (e.g., after server update)
    // Only reset if we're not in the middle of editing a field
    useEffect(() => {
        if (!editingField) {
            setData({
                name: module.name,
                description: module.description || '',
                metrics: module.metrics || '',
                erd: module.erd || '',
                status: module.status || 'planned',
                order_of_implementation: module.order_of_implementation || 1,
            });
        }
    }, [module, editingField, setData]);

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Modules', href: `/projects/${project.id}/modules` },
        { title: module.name, href: `/projects/${project.id}/modules/${module.id}` },
    ];

    const navGroups = useMemo(
        () =>
            buildProjectNavGroups({
                project,
                currentPage: 'modules',
            }),
        [project],
    );

    // WHY: useCallback prevents recreating these functions on each render,
    // which is important since they're passed to child components
    const handleEdit = useCallback((field: string) => {
        setEditingField(field);
    }, []);

    const handleSave = useCallback(() => {
        if (!editingField) return;

        put(`/projects/${project.id}/modules/${module.id}/update`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingField(null);
                toast.success('Module updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update module. Please try again.');
            },
        });
    }, [editingField, project.id, module.id, put]);

    const handleCancel = useCallback(() => {
        setEditingField(null);
        setData({
            name: module.name,
            description: module.description || '',
            metrics: module.metrics || '',
            erd: module.erd || '',
            status: module.status || 'planned',
            order_of_implementation: module.order_of_implementation || 1,
        });
    }, [module, setData]);

    const handleStatusChange = useCallback((newStatus: ModuleStatus) => {
        setData('status', newStatus);
        put(`/projects/${project.id}/modules/${module.id}/update`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Status updated successfully!'),
            onError: () => toast.error('Failed to update status.'),
        });
    }, [project.id, module.id, put, setData]);

    // WHY: Helper function to get status config from centralized utilities
    const statusConfig = getModuleStatusConfig(data.status);

    const features = module.features || [];
    const completedFeatures = features.filter((f) => f.status === 'completed').length;

    // Calculate module progress based on features
    const moduleProgress = features.length > 0 ? Math.round((completedFeatures / features.length) * 100) : 0;

    const health = useMemo(() => {
        if (moduleProgress >= 80) return { label: 'excellent', Icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' };
        if (moduleProgress >= 60) return { label: 'good', Icon: CheckCircle2, color: 'text-blue-600 dark:text-blue-400' };
        if (moduleProgress >= 40) return { label: 'fair', Icon: AlertCircleIcon, color: 'text-orange-600 dark:text-orange-400' };
        return { label: 'needs attention', Icon: AlertCircleIcon, color: 'text-red-600 dark:text-red-400' };
    }, [moduleProgress]);

    // WHY: ContentCard is now imported from @/components/ContentCard
    // This prevents the component from being recreated on every render

    return (
        <>
            <Head title={`${module.name} - ${project.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectSidebarPanel
                        project={project}
                        navGroups={navGroups}
                        isCollapsed={isSidebarCollapsed}
                        user={auth.user as User}
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
                                                    onClick={() => router.visit(`/projects/${project.id}/modules`)}
                                                    className="gap-2"
                                                >
                                                    <ArrowLeft className="h-4 w-4" />
                                                    Back to Modules
                                                </Button>
                                            </div>
                                            <div className="group mt-2 flex cursor-pointer items-center gap-3" onClick={() => handleEdit('name')}>
                                                <Layers className="h-8 w-8 text-primary" />
                                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{data.name}</h1>
                                                <PencilIcon className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                                <Select value={data.status} onValueChange={handleStatusChange} disabled={processing}>
                                                    <SelectTrigger
                                                        className={`h-7 w-auto border-0 px-2.5 text-xs font-medium shadow-none ring-1 ring-inset ${statusConfig.color}`}
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="planned">Planned</SelectItem>
                                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
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
                                            <Layers className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-semibold text-foreground">{moduleProgress}%</div>
                                            <div className="text-xs text-muted-foreground">Progress</div>
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-border" />
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${health.color.includes('emerald') ? 'bg-emerald-500/10' : health.color.includes('blue') ? 'bg-blue-500/10' : health.color.includes('orange') ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                                            <ZapIcon className={`h-5 w-5 ${health.color}`} />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-semibold text-foreground">{completedFeatures}/{features.length}</div>
                                            <div className="text-xs text-muted-foreground">Features</div>
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-border" />
                                    <div className="flex items-center gap-1.5">
                                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${statusConfig.color}`}>
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                    <div className="h-8 w-px bg-border" />
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="text-xs">Order</span>
                                        <span className="text-sm font-medium text-foreground">#{data.order_of_implementation}</span>
                                    </div>
                                </div>

                                {/* ERD Section */}
                                <div className="mb-8">
                                    <h2 className="mb-4 flex items-center gap-2 text-base font-medium text-foreground">
                                        <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                                        Database Schema
                                    </h2>
                                    
                                    {/* Warning Banner for Out of Sync */}
                                    {module.erd_is_synced === false && (
                                        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertCircleIcon className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                                        Feature data models have been updated
                                                    </p>
                                                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                                                        Your module ERD may be out of sync with the latest feature changes. Click the sync button below to merge all feature ERDs into the module ERD.
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-amber-500 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300 flex-shrink-0"
                                                    disabled={isSyncing}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        syncErd();
                                                    }}
                                                >
                                                    {isSyncing ? (
                                                        <>
                                                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                            Syncing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ZapIcon className="mr-1 h-3 w-3" />
                                                            Sync ERD
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className="group cursor-pointer rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm transition-all duration-200 ease-out hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
                                        onClick={() => {
                                            if (module.erd) {
                                                router.visit(`/projects/${project.id}/modules/${module.id}/erd`);
                                            } else {
                                                router.post(`/projects/${project.id}/modules/${module.id}/erd/generate`);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div
                                                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${module.erd ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}
                                                    >
                                                        {module.erd ? <CheckCircle2 className="h-6 w-6" /> : <DatabaseIcon className="h-6 w-6" />}
                                                    </div>
                                                    <SyncIndicator 
                                                        isSynced={module.erd_is_synced} 
                                                        position="absolute" 
                                                        className="-top-1 -right-1 ring-card" 
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                            {module.erd ? 'View & Edit Schema' : 'Generate Schema'}
                                                        </span>
                                                        {module.erd_is_synced === false && (
                                                            <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
                                                                Out of sync
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {module.erd ? 'ERD diagram ready' : 'Generate database schema with AI'}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant={module.erd ? 'ghost' : 'default'}
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (module.erd) {
                                                        router.visit(`/projects/${project.id}/modules/${module.id}/erd`);
                                                    } else {
                                                        router.post(`/projects/${project.id}/modules/${module.id}/erd/generate`);
                                                    }
                                                }}
                                            >
                                                {module.erd ? 'Open' : 'Generate'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Module Details */}
                                <div className="mb-8 space-y-4">
                                    <h2 className="flex items-center gap-2 text-base font-medium text-foreground">
                                        <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                                        Module Details
                                    </h2>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <ContentCard
                                            title="Description"
                                            field="description"
                                            icon={FileTextIcon}
                                            placeholder="Add a description for this module..."
                                            value={data.description}
                                            onEdit={handleEdit}
                                        />
                                        <ContentCard
                                            title="Success Metrics"
                                            field="metrics"
                                            icon={BarChart3}
                                            placeholder="Define KPIs and measurements..."
                                            value={data.metrics}
                                            onEdit={handleEdit}
                                        />
                                    </div>
                                </div>

                                {/* Features Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="flex items-center gap-2 text-base font-medium text-foreground">
                                            <ZapIcon className="h-4 w-4 text-muted-foreground" />
                                            Features
                                            {features.length > 0 && (
                                                <span className="text-sm font-normal text-muted-foreground">({features.length})</span>
                                            )}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            {features.length > 0 && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="gap-2" 
                                                    onClick={() => setIsAddFeatureModalOpen(true)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Add Feature
                                                </Button>
                                            )}
                                            {features.length === 0 && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="gap-2"
                                                    disabled={!module.erd || isGeneratingFeatures}
                                                    onClick={() => {
                                                        setIsGeneratingFeatures(true);
                                                        router.visit(`/projects/${project.id}/modules/${module.id}/features/create`, {
                                                            onFinish: () => setIsGeneratingFeatures(false),
                                                        });
                                                    }}
                                                    title={!module.erd ? 'Generate ERD first to enable feature generation' : 'Generate features with AI'}
                                                >
                                                    {isGeneratingFeatures ? (
                                                        <>
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                            Generating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="h-4 w-4" />
                                                            Generate Features
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {features.length === 0 ? (
                                        <EmptyState
                                            icon={ZapIcon}
                                            title="No features yet"
                                            description={
                                                !module.erd 
                                                    ? 'Generate an ERD first, then you can generate features for this module'
                                                    : 'Click "Generate Features" to create AI-powered feature suggestions'
                                            }
                                            variant="dashed"
                                        />
                                    ) : (
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {features.map((feature) => {
                                                const featureStatusConfig = getFeatureStatusConfig(feature.status);
                                                const FeatureStatusIcon = featureStatusConfig.icon;
                                                const priorityConfig = getFeaturePriorityConfig(feature.priority);
                                                
                                                // Determine icon color based on status
                                                const iconColorClass = feature.status === 'completed' 
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : feature.status === 'in_progress'
                                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
                                                
                                                return (
                                                    <div
                                                        key={feature.id}
                                                        className="group flex h-full cursor-pointer flex-col rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm transition-all duration-200 ease-out hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                        onClick={() => router.visit(`/projects/${project.id}/modules/${module.id}/features/${feature.id}`)}
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={(e) => e.key === 'Enter' && router.visit(`/projects/${project.id}/modules/${module.id}/features/${feature.id}`)}
                                                        aria-label={`View feature ${feature.name}`}
                                                    >
                                                        {/* Header with colored icon */}
                                                        <div className="mb-3 flex items-start justify-between gap-3">
                                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconColorClass}`}>
                                                                <ZapIcon className="h-5 w-5" />
                                                            </div>
                                                            <Badge className={`shrink-0 border text-xs font-medium capitalize ${priorityConfig.color}`}>
                                                                {priorityConfig.label}
                                                            </Badge>
                                                        </div>
                                                        
                                                        {/* Content */}
                                                        <div className="flex-1">
                                                            <h3 className="text-base font-medium text-foreground transition-colors group-hover:text-primary">
                                                                {feature.name}
                                                            </h3>
                                                            {feature.summary && (
                                                                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground/80 leading-relaxed">
                                                                    {feature.summary}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Footer with status */}
                                                        <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40">
                                                            <div className="flex items-center gap-1.5">
                                                                <FeatureStatusIcon className={`h-3.5 w-3.5 ${
                                                                    feature.status === 'completed' ? 'text-emerald-500' :
                                                                    feature.status === 'in_progress' ? 'text-blue-500' : 'text-amber-500'
                                                                }`} />
                                                                <span className="text-xs font-medium text-muted-foreground">
                                                                    {featureStatusConfig.label}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground/60">
                                                                #{feature.order_of_implementation}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
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
                        <DialogDescription>Make changes to the module details below.</DialogDescription>
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
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Module name..." />
                        ) : (
                            <Textarea
                                value={data[editingField as keyof typeof data] as string}
                                onChange={(e) => setData(editingField as keyof typeof data, e.target.value)}
                                rows={editingField === 'erd' ? 20 : 10}
                                className="font-mono text-sm"
                                placeholder={editingField === 'erd' ? 'Enter ERD in Mermaid format...' : 'Type your content here...'}
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

            {/* Add Feature Modal */}
            <Dialog open={isAddFeatureModalOpen} onOpenChange={(open) => {
                if (!open && !isCreatingFeature) {
                    setIsAddFeatureModalOpen(false);
                    setNewFeature({ name: '', description: '' });
                }
            }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Feature</DialogTitle>
                        <DialogDescription>
                            Create a new feature for this module. AI will generate detailed specifications based on your input.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="feature-name">Feature Name</Label>
                            <Input
                                id="feature-name"
                                placeholder="e.g., User Authentication"
                                value={newFeature.name}
                                onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                                disabled={isCreatingFeature}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="feature-description">Description</Label>
                            <Textarea
                                id="feature-description"
                                placeholder="Describe the feature's purpose and key functionality..."
                                value={newFeature.description}
                                onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                                rows={5}
                                disabled={isCreatingFeature}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsAddFeatureModalOpen(false);
                                setNewFeature({ name: '', description: '' });
                            }}
                            disabled={isCreatingFeature}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (!newFeature.name.trim() || !newFeature.description.trim()) {
                                    toast.error('Please fill in both name and description.');
                                    return;
                                }
                                setIsCreatingFeature(true);
                                router.post(
                                    `/projects/${project.id}/modules/${module.id}/features/single`,
                                    {
                                        name: newFeature.name.trim(),
                                        description: newFeature.description.trim(),
                                    },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setIsAddFeatureModalOpen(false);
                                            setNewFeature({ name: '', description: '' });
                                            toast.success('Feature created successfully!');
                                        },
                                        onError: (errors) => {
                                            const errorMessage = Object.values(errors).flat().join(' ') || 'Failed to create feature.';
                                            toast.error(errorMessage);
                                        },
                                        onFinish: () => {
                                            setIsCreatingFeature(false);
                                        },
                                    }
                                );
                            }}
                            disabled={isCreatingFeature || !newFeature.name.trim() || !newFeature.description.trim()}
                        >
                            {isCreatingFeature ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Feature'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
