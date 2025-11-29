import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ActivityIcon,
    AlertCircleIcon,
    ArrowLeftIcon,
    BarChart3Icon,
    BoxIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClipboardCheckIcon,
    DatabaseIcon,
    ExternalLinkIcon,
    FileTextIcon,
    GitBranchIcon,
    LayoutIcon,
    ListIcon,
    RouteIcon,
    SparklesIcon,
    TrendingUpIcon,
    UserIcon,
    ZapIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Project {
    id: number;
    name: string;
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
}

interface Feature {
    id: number;
    project_id: number;
    name: string;
    summary?: string;
    description?: string;
    status: string;
    priority: string;
    order_of_implementation: number;
    created_at: string;
    updated_at: string;
    erd?: string;
    sequence_diagram?: string;
    wireframe?: string;
    user_flows?: string;
    metrics?: string;
    acceptance_criteria?: string;
}

interface SiblingFeature {
    id: number;
    name: string;
    status: string;
    priority: string;
    order_of_implementation: number;
}

interface FeatureStats {
    has_erd: boolean;
    has_sequence_diagram: boolean;
    has_wireframe: boolean;
    has_user_flows: boolean;
    has_metrics: boolean;
    has_acceptance_criteria: boolean;
    has_description: boolean;
    has_summary: boolean;
    position_in_project: number;
    total_features_in_project: number;
    completion_score: number;
}

interface Props {
    feature: Feature;
    project: Project;
    siblingFeatures: SiblingFeature[];
    featureStats: FeatureStats;
}

export default function FeatureShow({ feature, project, siblingFeatures, featureStats }: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedContent, setSelectedContent] = useState<{ title: string; content: string } | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Projects', href: '/admin/projects' },
        { title: project.name, href: `/admin/projects/${project.id}` },
        { title: 'Features', href: `/admin/projects/${project.id}?tab=features` },
        { title: feature.name, href: '#' },
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
            case 'in_progress':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'draft':
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
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

    const getCompletionColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
        if (score >= 50) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 50) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const health = useMemo(() => {
        const score = featureStats.completion_score;
        if (score >= 80) return { label: 'Excellent', Icon: CheckCircleIcon, color: 'text-emerald-600 dark:text-emerald-400' };
        if (score >= 60) return { label: 'Good', Icon: TrendingUpIcon, color: 'text-blue-600 dark:text-blue-400' };
        if (score >= 40) return { label: 'Fair', Icon: AlertCircleIcon, color: 'text-orange-600 dark:text-orange-400' };
        return { label: 'Needs Attention', Icon: AlertCircleIcon, color: 'text-red-600 dark:text-red-400' };
    }, [featureStats.completion_score]);

    // Content Modal Component
    const ContentItem = ({
        title,
        description,
        content,
        icon: Icon,
        iconColor,
        iconBg,
        available,
    }: {
        title: string;
        description: string;
        content?: string;
        icon: React.ComponentType<{ className?: string }>;
        iconColor: string;
        iconBg: string;
        available: boolean;
    }) => (
        <Card 
            className="cursor-pointer transition-all hover:bg-muted/50 hover:shadow-sm group"
            onClick={() => content && setSelectedContent({ title: `${title} - ${description}`, content })}
        >
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
                        <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                                {title}
                            </h3>
                            {available ? (
                                <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                                <span className="text-xs text-muted-foreground">Empty</span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{description}</p>
                    </div>
                    {available && <ExternalLinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                </div>
            </CardContent>
        </Card>
    );

    // Resource Card Component for navigation links
    const ResourceCard = ({
        title,
        description,
        icon: Icon,
        href,
        available,
        colorClass,
        bgClass,
    }: {
        title: string;
        description: string;
        icon: React.ComponentType<{ className?: string }>;
        href: string;
        available: boolean;
        colorClass: string;
        bgClass: string;
    }) => (
        <Link href={href}>
            <Card className="h-full transition-all hover:bg-muted/50 hover:shadow-sm cursor-pointer group">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgClass}`}>
                            <Icon className={`h-5 w-5 ${colorClass}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                                    {title}
                                </h3>
                                {available ? (
                                    <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                    <span className="text-xs text-muted-foreground">Empty</span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{description}</p>
                        </div>
                        <ExternalLinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );

    // Stat Item Component
    const StatItem = ({
        label,
        value,
        icon: Icon,
        colorClass = 'text-muted-foreground',
    }: {
        label: string;
        value: string | number;
        icon: React.ComponentType<{ className?: string }>;
        colorClass?: string;
    }) => (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <div className={`p-2 rounded-lg bg-background ${colorClass}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold">{value}</p>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Feature: ${feature.name}`} />

            <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={`/admin/projects/${project.id}?tab=features`}>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <ArrowLeftIcon className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{feature.name}</h1>
                                <Badge variant="outline" className={`${getStatusColor(feature.status)} text-xs font-medium`}>
                                    {feature.status.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className={`${getPriorityColor(feature.priority)} text-xs font-medium`}>
                                    {feature.priority} Priority
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Created {new Date(feature.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Dashboard */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Progress Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Completion
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-3xl font-semibold">{featureStats.completion_score}%</div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div 
                                    className={`h-full transition-all duration-500 ${getProgressColor(featureStats.completion_score)}`} 
                                    style={{ width: `${featureStats.completion_score}%` }} 
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <health.Icon className={`h-3.5 w-3.5 ${health.color}`} />
                                <span className={`text-sm font-medium ${health.color}`}>{health.label}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Order
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-3xl font-semibold">#{feature.order_of_implementation}</div>
                            <p className="text-sm text-muted-foreground">
                                of {featureStats.total_features_in_project} features
                            </p>
                        </CardContent>
                    </Card>

                    {/* Owner Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Owner
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                {project.user.avatar ? (
                                    <img 
                                        src={project.user.avatar} 
                                        alt={project.user.name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{project.user.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{project.user.email}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Last Updated Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Last Updated
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-3xl font-semibold">
                                {Math.floor((Date.now() - new Date(feature.updated_at).getTime()) / (1000 * 60 * 60 * 24))}d
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {new Date(feature.updated_at).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 bg-muted/50">
                        <TabsTrigger value="overview" className="gap-2">
                            <BoxIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="specifications" className="gap-2">
                            <ClipboardCheckIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Specifications</span>
                        </TabsTrigger>
                        <TabsTrigger value="design" className="gap-2">
                            <LayoutIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Design</span>
                        </TabsTrigger>
                        <TabsTrigger value="features" className="gap-2">
                            <ZapIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Related Features</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4 mt-4">
                        {/* Summary */}
                        {feature.summary && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <SparklesIcon className="h-4 w-4" />
                                        Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.summary}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Description */}
                        <Card 
                            className={feature.description ? "cursor-pointer transition-colors hover:bg-muted/50" : ""}
                            onClick={() => feature.description && setSelectedContent({ 
                                title: 'Feature Description', 
                                content: feature.description 
                            })}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between text-sm font-medium">
                                    <span className="flex items-center gap-2">
                                        <FileTextIcon className="h-4 w-4" />
                                        Description
                                    </span>
                                    {feature.description && <ExternalLinkIcon className="h-3.5 w-3.5 text-muted-foreground" />}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {feature.description ? (
                                    <p className="line-clamp-4 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No description provided</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Project Info */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <ActivityIcon className="h-4 w-4" />
                                    Project Context
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Link href={`/admin/projects/${project.id}`} className="group">
                                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                <BoxIcon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-medium group-hover:text-primary transition-colors">{project.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {featureStats.position_in_project} of {featureStats.total_features_in_project} features
                                                </div>
                                            </div>
                                        </div>
                                        <ExternalLinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Specifications Tab */}
                    <TabsContent value="specifications" className="space-y-4 mt-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-medium">Feature Specifications</h3>
                                <p className="text-sm text-muted-foreground">Requirements, criteria, and success metrics</p>
                            </div>
                            <Link href={`/admin/features/${feature.id}/specs`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                                    View All Specs
                                </Button>
                            </Link>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <ContentItem
                                title="Acceptance Criteria"
                                description="Requirements for completion"
                                content={feature.acceptance_criteria}
                                icon={CheckCircleIcon}
                                iconColor="text-emerald-600 dark:text-emerald-400"
                                iconBg="bg-emerald-500/10"
                                available={featureStats.has_acceptance_criteria}
                            />

                            <ContentItem
                                title="User Flows"
                                description="Step-by-step interactions"
                                content={feature.user_flows}
                                icon={RouteIcon}
                                iconColor="text-cyan-600 dark:text-cyan-400"
                                iconBg="bg-cyan-500/10"
                                available={featureStats.has_user_flows}
                            />

                            <ContentItem
                                title="Success Metrics"
                                description="KPIs and indicators"
                                content={feature.metrics}
                                icon={BarChart3Icon}
                                iconColor="text-amber-600 dark:text-amber-400"
                                iconBg="bg-amber-500/10"
                                available={featureStats.has_metrics}
                            />
                        </div>
                    </TabsContent>

                    {/* Design Tab */}
                    <TabsContent value="design" className="space-y-4 mt-4">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium">Design & Technical Resources</h3>
                            <p className="text-sm text-muted-foreground">ERDs, diagrams, wireframes, and flows</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <ResourceCard
                                title="Database ERD"
                                description="Schema & relationships"
                                icon={DatabaseIcon}
                                href={`/admin/features/${feature.id}/erd`}
                                available={featureStats.has_erd}
                                colorClass="text-purple-600 dark:text-purple-400"
                                bgClass="bg-purple-500/10"
                            />
                            <ResourceCard
                                title="Sequence Diagram"
                                description="Logic flow & interactions"
                                icon={GitBranchIcon}
                                href={`/admin/features/${feature.id}/sequence-diagram`}
                                available={featureStats.has_sequence_diagram}
                                colorClass="text-amber-600 dark:text-amber-400"
                                bgClass="bg-amber-500/10"
                            />
                            <ResourceCard
                                title="User Journey"
                                description="User flows visualization"
                                icon={RouteIcon}
                                href={`/admin/features/${feature.id}/user-journey`}
                                available={featureStats.has_user_flows}
                                colorClass="text-teal-600 dark:text-teal-400"
                                bgClass="bg-teal-500/10"
                            />
                            <ResourceCard
                                title="Wireframe"
                                description="UI layout & design"
                                icon={LayoutIcon}
                                href={`/admin/features/${feature.id}/wireframe`}
                                available={featureStats.has_wireframe}
                                colorClass="text-rose-600 dark:text-rose-400"
                                bgClass="bg-rose-500/10"
                            />
                        </div>
                    </TabsContent>

                    {/* Related Features Tab */}
                    <TabsContent value="features" className="space-y-4 mt-4">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium">Project Features</h3>
                            <p className="text-sm text-muted-foreground">All features in {project.name}</p>
                        </div>

                        {siblingFeatures && siblingFeatures.length > 0 ? (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {siblingFeatures.map((sibling) => (
                                    <Link
                                        key={sibling.id}
                                        href={`/admin/features/${sibling.id}`}
                                    >
                                        <Card className={`group cursor-pointer transition-all duration-200 hover:shadow-sm ${
                                            sibling.id === feature.id
                                                ? 'bg-primary/5 border-primary/30'
                                                : 'hover:border-muted-foreground/20'
                                        }`}>
                                            <CardContent className="p-4">
                                                {/* Header */}
                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                    <h4 className={`text-sm font-medium line-clamp-2 leading-snug flex-1 ${
                                                        sibling.id === feature.id 
                                                            ? 'text-primary' 
                                                            : 'group-hover:text-foreground transition-colors'
                                                    }`}>
                                                        {sibling.name}
                                                    </h4>
                                                    <span className={`text-xs font-medium flex-shrink-0 ${
                                                        sibling.id === feature.id ? 'text-primary' : 'text-muted-foreground'
                                                    }`}>
                                                        #{sibling.order_of_implementation}
                                                    </span>
                                                </div>

                                                {/* Badges */}
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={`${getStatusColor(sibling.status)} text-[10px] h-5 px-2 border-0`}
                                                    >
                                                        {sibling.status.replace('_', ' ')}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={`${getPriorityColor(sibling.priority)} text-[10px] h-5 px-2 border-0`}
                                                    >
                                                        {sibling.priority}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <ZapIcon className="h-10 w-10 text-muted-foreground/20 mb-3" />
                                    <h3 className="text-sm font-medium">No other features</h3>
                                    <p className="text-xs text-muted-foreground mt-1">This is the only feature in the project</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Content Modal */}
                <Dialog open={!!selectedContent} onOpenChange={(open) => !open && setSelectedContent(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                        <DialogHeader>
                            <DialogTitle>{selectedContent?.title}</DialogTitle>
                        </DialogHeader>
                        <Separator />
                        <div className="overflow-y-auto max-h-[calc(80vh-8rem)]">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedContent?.content || ''}</ReactMarkdown>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
