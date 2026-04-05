import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { getModuleStatusColor, getPriorityColor } from '@/utils/status-colors';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeftIcon, 
    BoxIcon, 
    CheckCircleIcon, 
    ClockIcon, 
    DatabaseIcon, 
    FileTextIcon, 
    FolderIcon, 
    UserIcon, 
    ZapIcon,
    BarChart3Icon,
    LayersIcon
} from 'lucide-react';
import { useState } from 'react';

interface Project {
    id: number;
    name: string;
    status: string;
    user?: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
}

interface Feature {
    id: number;
    name: string;
    summary?: string;
    description?: string;
    priority: string;
    status: string;
    order_of_implementation: number;
    progress: number;
}

interface SiblingModule {
    id: number;
    name: string;
    status: string;
    order_of_implementation: number;
}

interface Module {
    id: number;
    project_id: number;
    name: string;
    description?: string;
    metrics?: string;
    erd?: string;
    erd_is_synced: boolean;
    status: string;
    order_of_implementation: number;
    created_at: string;
    updated_at: string;
    project: Project;
    features: Feature[];
}

interface ModuleStats {
    has_erd: boolean;
    erd_is_synced: boolean;
    has_description: boolean;
    has_metrics: boolean;
    total_features: number;
    features_by_status: Record<string, number>;
    features_by_priority: Record<string, number>;
    position_in_project: number;
    total_modules_in_project: number;
    completion_score: number;
}

interface Props {
    module: Module;
    project: Project;
    features: Feature[];
    siblingModules: SiblingModule[];
    moduleStats: ModuleStats;
}

export default function ModuleShow({ module, project, features, siblingModules, moduleStats }: Props) {
    const [activeTab, setActiveTab] = useState('overview');

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
            title: project.name,
            href: `/admin/projects/${project.id}`,
        },
        {
            title: 'Modules',
            href: '/admin/modules',
        },
        {
            title: module.name,
            href: '#',
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
            case 'in_progress':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'planned':
                return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
            case 'draft':
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'critical':
                return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
            case 'high':
                return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
            case 'medium':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'low':
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Module: ${module.name}`} />

            <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/modules">
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <ArrowLeftIcon className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{module.name}</h1>
                                <Badge variant="outline" className={`${getStatusColor(module.status)} text-xs font-medium`}>
                                    {module.status?.replace('_', ' ') || 'N/A'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Link href={`/admin/projects/${project.id}`} className="hover:text-foreground transition-colors flex items-center gap-1">
                                    <FolderIcon className="h-3.5 w-3.5" />
                                    {project.name}
                                </Link>
                                <span>•</span>
                                <span>Module {moduleStats.position_in_project} of {moduleStats.total_modules_in_project}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Dashboard */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Completion Score */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Completion
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-3xl font-semibold">{moduleStats.completion_score}%</div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500" 
                                    style={{ width: `${moduleStats.completion_score}%` }} 
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Features Count */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Features
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-3xl font-semibold">{moduleStats.total_features}</div>
                            {moduleStats.total_features > 0 && (
                                <div className="flex gap-3 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span className="text-muted-foreground">{moduleStats.features_by_status?.done || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span className="text-muted-foreground">{moduleStats.features_by_status?.in_progress || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-slate-400" />
                                        <span className="text-muted-foreground">{moduleStats.features_by_status?.draft || 0}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ERD Status */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                ERD Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {moduleStats.has_erd ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        {moduleStats.erd_is_synced ? (
                                            <>
                                                <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Synced</span>
                                            </>
                                        ) : (
                                            <>
                                                <ClockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending Sync</span>
                                            </>
                                        )}
                                    </div>
                                    <Link href={`/admin/modules/${module.id}/erd`}>
                                        <Button variant="outline" size="sm" className="w-full mt-2">
                                            <DatabaseIcon className="h-3.5 w-3.5 mr-2" />
                                            View ERD
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <DatabaseIcon className="h-5 w-5" />
                                    <span className="text-sm">No ERD</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Implementation Order */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Implementation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-3xl font-semibold">#{module.order_of_implementation}</div>
                            <p className="text-sm text-muted-foreground">in project order</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                        <TabsTrigger value="overview" className="gap-2">
                            <BoxIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="features" className="gap-2">
                            <ZapIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Features ({moduleStats.total_features})</span>
                        </TabsTrigger>
                        <TabsTrigger value="siblings" className="gap-2">
                            <LayersIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Sibling Modules</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4 mt-4">
                        {/* Project Info & Description */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Project</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex flex-col items-center text-center">
                                        {project.user?.avatar ? (
                                            <img 
                                                src={project.user.avatar} 
                                                alt={project.user.name}
                                                className="h-16 w-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                                <UserIcon className="h-7 w-7 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="mt-3 space-y-1 w-full">
                                            <Link 
                                                href={`/admin/projects/${project.id}`}
                                                className="text-sm font-medium truncate hover:text-primary transition-colors"
                                            >
                                                {project.name}
                                            </Link>
                                            <div className="text-xs text-muted-foreground truncate">
                                                by {project.user?.name}
                                            </div>
                                            <Badge variant="outline" className={`${getStatusColor(project.status)} text-xs mt-2`}>
                                                {project.status?.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                        <FileTextIcon className="h-4 w-4" />
                                        Description
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {module.description ? (
                                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                            {module.description}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No description provided</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Metrics */}
                        {module.metrics && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                        <BarChart3Icon className="h-4 w-4" />
                                        Metrics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="max-h-[200px] overflow-auto rounded-lg bg-muted p-3 text-xs leading-relaxed">
                                        {module.metrics}
                                    </pre>
                                </CardContent>
                            </Card>
                        )}

                        {/* Timestamps */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Created</p>
                                        <p className="text-sm font-medium">
                                            {new Date(module.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Last Updated</p>
                                        <p className="text-sm font-medium">
                                            {new Date(module.updated_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Features Tab */}
                    <TabsContent value="features" className="space-y-4 mt-4">
                        {features && features.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {features.map((feature) => (
                                    <Link key={feature.id} href={`/admin/features/${feature.id}`}>
                                        <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <CardTitle className="text-sm line-clamp-2 leading-tight font-medium">
                                                        {feature.name}
                                                    </CardTitle>
                                                    {feature.priority && (
                                                        <Badge variant="outline" className={`${getPriorityColor(feature.priority)} text-xs flex-shrink-0`}>
                                                            {feature.priority.charAt(0).toUpperCase()}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {(feature.summary || feature.description) && (
                                                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                                                        {feature.summary || feature.description}
                                                    </p>
                                                )}
                                                {/* Progress Bar */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">Progress</span>
                                                        <span className={`font-medium ${
                                                            feature.progress >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                                                            feature.progress >= 50 ? 'text-amber-600 dark:text-amber-400' :
                                                            'text-muted-foreground'
                                                        }`}>{feature.progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                        <div 
                                                            className={`h-full transition-all duration-300 ${
                                                                feature.progress >= 80 ? 'bg-emerald-500' :
                                                                feature.progress >= 50 ? 'bg-amber-500' :
                                                                'bg-slate-400'
                                                            }`}
                                                            style={{ width: `${feature.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t">
                                                    <Badge variant="outline" className={`${getStatusColor(feature.status)} text-xs`}>
                                                        {feature.status?.replace('_', ' ') || 'draft'}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        #{feature.order_of_implementation}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <ZapIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground">No Features Yet</h3>
                                    <p className="text-sm text-muted-foreground/70 mt-1">
                                        This module doesn't have any features defined
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Sibling Modules Tab */}
                    <TabsContent value="siblings" className="space-y-4 mt-4">
                        {siblingModules && siblingModules.length > 0 ? (
                            <div className="grid gap-3">
                                {siblingModules.map((sibling) => (
                                    <Link key={sibling.id} href={`/admin/modules/${sibling.id}`}>
                                        <Card className={`cursor-pointer transition-colors hover:bg-muted/50 ${sibling.id === module.id ? 'ring-2 ring-primary/50' : ''}`}>
                                            <CardContent className="flex items-center justify-between p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                                        {sibling.order_of_implementation}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {sibling.name}
                                                            {sibling.id === module.id && (
                                                                <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`${getStatusColor(sibling.status)} text-xs`}>
                                                    {sibling.status?.replace('_', ' ') || 'N/A'}
                                                </Badge>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <LayersIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground">Only Module</h3>
                                    <p className="text-sm text-muted-foreground/70 mt-1">
                                        This is the only module in the project
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
