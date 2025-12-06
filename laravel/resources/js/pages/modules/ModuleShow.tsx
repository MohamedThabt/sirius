import { Breadcrumbs } from '@/components/breadcrumbs';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type SharedData, type User } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
    ArrowLeft,
    BarChart3,
    CheckCircle2,
    CircleIcon,
    ClockIcon,
    DatabaseIcon,
    FileTextIcon,
    Layers,
    Loader2,
    PencilIcon,
    Plus,
    Sparkles,
    ZapIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Project {
    id: number;
    name: string;
    brief: string;
    overview: string;
    status: string;
    c4?: string | null;
}

interface FeatureItem {
    id: number;
    name: string;
    summary: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'draft' | 'in_progress' | 'completed' | 'archived';
    order_of_implementation: number;
}

interface ModuleItem {
    id: number;
    name: string;
    description: string;
    metrics: string | null;
    erd: string | null;
    erd_is_synced?: boolean;
    status: 'planned' | 'in_progress' | 'completed';
    order_of_implementation: number;
    features?: FeatureItem[];
}

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
    const [isSyncing, setIsSyncing] = useState(false);
    const [isAddFeatureModalOpen, setIsAddFeatureModalOpen] = useState(false);
    const [isCreatingFeature, setIsCreatingFeature] = useState(false);
    const [newFeature, setNewFeature] = useState({ name: '', description: '' });

    const { data, setData, put, processing } = useForm({
        name: module.name,
        description: module.description || '',
        metrics: module.metrics || '',
        erd: module.erd || '',
        status: module.status || 'planned',
        order_of_implementation: module.order_of_implementation || 1,
    });

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [module]);

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Modules', href: `/projects/${project.id}/modules` },
        { title: module.name },
    ];

    const navGroups = useMemo(
        () =>
            buildProjectNavGroups({
                project,
                currentPage: 'modules',
            }),
        [project],
    );

    const handleEdit = (field: string) => {
        setEditingField(field);
    };

    const handleSave = () => {
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
    };

    const handleCancel = () => {
        setEditingField(null);
        setData({
            name: module.name,
            description: module.description || '',
            metrics: module.metrics || '',
            erd: module.erd || '',
            status: module.status || 'planned',
            order_of_implementation: module.order_of_implementation || 1,
        });
    };

    const handleStatusChange = (newStatus: 'planned' | 'in_progress' | 'completed') => {
        setData('status', newStatus);
        put(`/projects/${project.id}/modules/${module.id}/update`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Status updated successfully!'),
            onError: () => toast.error('Failed to update status.'),
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'planned':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const formatStatus = (status: string) => {
        switch (status) {
            case 'in_progress':
                return 'In Progress';
            case 'planned':
                return 'Planned';
            case 'completed':
                return 'Completed';
            default:
                return status;
        }
    };

    const getFeatureStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <CircleIcon className="h-4 w-4" />;
            case 'in_progress':
                return <ClockIcon className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle2 className="h-4 w-4" />;
            default:
                return <CircleIcon className="h-4 w-4" />;
        }
    };

    const getFeatureStatusColor = (status: string) => {
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

    const ContentCard = ({
        title,
        field,
        icon: Icon,
        placeholder,
        className = '',
    }: {
        title: string;
        field: string;
        icon: React.ComponentType<{ className?: string }>;
        placeholder: string;
        className?: string;
    }) => (
        <div
            className={`group relative rounded-xl border border-border/40 bg-card/50 p-6 transition-all hover:border-border/80 hover:bg-card hover:shadow-sm ${className}`}
        >
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(field)} className="opacity-0 transition-opacity group-hover:opacity-100">
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
            <Head title={`${module.name} - ${project.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectSidebarPanel
                        project={project}
                        navGroups={navGroups}
                        repository={null}
                        completionPercentage={undefined}
                        health={undefined}
                        isCollapsed={isSidebarCollapsed}
                        user={auth.user as unknown as User}
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
                                                        className={`h-7 w-auto border-0 px-2.5 text-xs font-medium shadow-none ring-1 ring-inset ${getStatusColor(data.status)}`}
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

                                {/* Metrics Grid */}
                                <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="rounded-xl border border-border/40 bg-card/50 p-4">
                                        <div className="mb-1 text-xs font-medium text-muted-foreground">Module Progress</div>
                                        <div className="mb-2 text-2xl font-bold text-foreground">{moduleProgress}%</div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${moduleProgress}%` }} />
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-border/40 bg-card/50 p-4">
                                        <div className="mb-1 text-xs font-medium text-muted-foreground">Features</div>
                                        <div className="mb-2 text-2xl font-bold text-foreground">
                                            {completedFeatures}/{features.length}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <health.Icon className={`h-3.5 w-3.5 ${health.color}`} />
                                            <span className={`capitalize ${health.color}`}>{health.label}</span>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-border/40 bg-card/50 p-4">
                                        <div className="mb-1 text-xs font-medium text-muted-foreground">Module Status</div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium ${getStatusColor(data.status)}`}
                                            >
                                                {formatStatus(data.status)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-border/40 bg-card/50 p-4">
                                        <div className="mb-1 text-xs font-medium text-muted-foreground">Implementation Order</div>
                                        <div className="mb-2 text-2xl font-bold text-foreground">#{data.order_of_implementation}</div>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={() => handleEdit('order_of_implementation')}
                                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            Edit Order
                                        </Button>
                                    </div>
                                </div>

                                {/* ERD Section */}
                                <div className="mb-8">
                                    <h2 className="mb-4 text-lg font-semibold text-foreground">Entity Relationship Diagram</h2>
                                    
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
                                                        setIsSyncing(true);
                                                        router.post(
                                                            `/projects/${project.id}/modules/${module.id}/erd/sync`,
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                                onSuccess: () => {
                                                                    toast.success('Module ERD synced successfully from features!');
                                                                },
                                                                onError: () => {
                                                                    toast.error('Failed to sync ERD. Please try again.');
                                                                },
                                                                onFinish: () => {
                                                                    setIsSyncing(false);
                                                                }
                                                            }
                                                        );
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
                                        className="group cursor-pointer rounded-xl border border-border/40 bg-card/50 p-6 transition-all hover:border-border/80 hover:bg-card hover:shadow-sm"
                                        onClick={() => {
                                            if (module.erd) {
                                                // Navigate to ERD designer page
                                                router.visit(`/projects/${project.id}/modules/${module.id}/erd`);
                                            } else {
                                                // Generate ERD (navigate to generate page)
                                                router.post(`/projects/${project.id}/modules/${module.id}/erd/generate`);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div
                                                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${module.erd ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}
                                                    >
                                                        {module.erd ? <CheckCircle2 className="h-5 w-5" /> : <DatabaseIcon className="h-5 w-5" />}
                                                    </div>
                                                    {module.erd_is_synced === false && (
                                                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500 ring-2 ring-card" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-foreground">Database Schema</span>
                                                        {module.erd_is_synced === false && (
                                                            <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
                                                                Out of sync
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {module.erd ? 'Click to view and edit ERD diagram' : 'Generate database schema with AI'}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant={module.erd ? 'ghost' : 'default'}
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (module.erd) {
                                                        router.visit(`/projects/${project.id}/modules/${module.id}/erd`);
                                                    } else {
                                                        router.post(`/projects/${project.id}/modules/${module.id}/erd/generate`);
                                                    }
                                                }}
                                            >
                                                {module.erd ? 'View ERD' : 'Generate ERD'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Module Details */}
                                <div className="mb-8 space-y-4">
                                    <h2 className="text-lg font-semibold text-foreground">Module Details</h2>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <ContentCard
                                            title="Description"
                                            field="description"
                                            icon={FileTextIcon}
                                            placeholder="Add a description for this module..."
                                        />
                                        <ContentCard
                                            title="Success Metrics"
                                            field="metrics"
                                            icon={BarChart3}
                                            placeholder="Define KPIs and measurements..."
                                        />
                                    </div>
                                </div>

                                {/* Features Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-foreground">Module Features</h2>
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
                                        <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-12 text-center">
                                            <ZapIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                            <p className="mt-4 text-sm font-medium text-foreground">No features yet</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {!module.erd 
                                                    ? 'Generate an ERD first, then you can generate features for this module'
                                                    : 'Click "Generate Features" to create AI-powered feature suggestions'
                                                }
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {features.map((feature) => (
                                                <div
                                                    key={feature.id}
                                                    className="group cursor-pointer rounded-lg border-2 border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
                                                    onClick={() => router.visit(`/projects/${project.id}/modules/${module.id}/features/${feature.id}`)}
                                                >
                                                    <div className="mb-4 flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                {getFeatureStatusIcon(feature.status)}
                                                                <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
                                                                    {feature.name}
                                                                </h3>
                                                            </div>
                                                            {feature.summary && (
                                                                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                                                    {feature.summary}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge className={`border text-xs font-medium ${getFeatureStatusColor(feature.status)}`}>
                                                            {getFeatureStatusIcon(feature.status)}
                                                            <span className="ml-1">
                                                                {feature.status === 'in_progress' ? 'In Progress' : feature.status}
                                                            </span>
                                                        </Badge>
                                                        <Badge className={`border text-xs font-medium capitalize ${getPriorityColor(feature.priority)}`}>
                                                            {feature.priority}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            #{feature.order_of_implementation}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
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
