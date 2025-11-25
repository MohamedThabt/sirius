import { PromptInput, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar } from '@/components/ai-elements/prompt-input';
import { Breadcrumbs } from '@/components/breadcrumbs';
import CreateFeatureModal from '@/components/Features/CreateFeatureModal';
import ProjectSidebar from '@/components/Projects/ProjectSidebar';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { TeamPreview } from '@/components/TeamPreview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { getHealthStatus } from '@/utils/project-status';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ClockIcon,
    CodeIcon,
    DatabaseIcon,
    FileIcon,
    FileText as FileTextIcon,
    HomeIcon,
    Layers as LayersIcon,
    Lock as LockIcon,
    MessageCircleIcon,
    Users as UsersIcon,
    ZapIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface Project {
    id: number;
    name: string;
    brief: string;
    overview: string;
    non_functional_requirements: string;
    technical_details: string;
    erd: string | null;
    c4: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

interface Sections {
    overview: string | null;
    prd: string | null;
    data_modeling: string | null;
    wireframes: string | null;
    technical_details: string | null;
    user_stories: string | null;
    non_functional_requirements: string | null;
}

interface FeatureItem {
    id: number;
    name: string;
    summary: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'draft' | 'in_progress' | 'completed' | 'archived';
    order_of_implementation: number;
    acceptance_criteria?: string | null;
    user_flows?: string | null;
    metrics?: string | null;
    description?: string | null;
}

interface Repository {
    id: number;
    provider: string;
    repo_id: string;
    name: string;
    full_name: string;
    owner_login: string;
    owner_type: string;
    default_branch: string;
    html_url: string;
    ssh_url: string;
    visibility: string;
}

interface TeamMember {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface Props {
    project: Project;
    sections: Sections;
    features?: FeatureItem[];
    brainstormingCompleted?: boolean;
    repository?: Repository | null;
    teamMembers?: TeamMember[];
    teamMembersCount?: number;
}

export default function ProjectShow({ project, sections, features = [], repository = null, teamMembers = [], teamMembersCount = 0 }: Props) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const getInitials = useInitials();
    const [activeSection, setActiveSection] = useState<'home' | 'features'>('home');

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
    ];
    const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
    const [isCreateFeatureModalOpen, setIsCreateFeatureModalOpen] = useState(false);
    const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isCreatingFeatures, setIsCreatingFeatures] = useState(false);

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

    interface RoadmapStep {
        id: string;
        title: string;
        description: string;
        icon: React.ComponentType<{ className?: string }>;
        isCompleted: boolean;
        isCurrent: boolean;
        isLocked: boolean;
        actionType: 'navigate' | 'generate' | 'view' | 'create';
        actionPath: string | null;
        actionHandler?: () => void;
    }

    const getRoadmapSteps = (): RoadmapStep[] => {
        const overviewExists = !!sections.overview;
        const featuresExist = features.length > 0;
        const prdExists = !!sections.prd;
        const erdExists = !!sections.data_modeling;
        const c4Exists = !!project.c4;

        const steps: RoadmapStep[] = [
            {
                id: 'overview',
                title: 'System Overview',
                description: 'Define the high-level system overview and requirements',
                icon: FileIcon,
                isCompleted: overviewExists,
                isCurrent: !overviewExists,
                isLocked: false,
                actionType: 'navigate',
                actionPath: `/projects/${project.id}/system-overview`,
            },
            {
                id: 'features',
                title: 'Features',
                description: 'Break down the project into manageable features',
                icon: ZapIcon,
                isCompleted: featuresExist,
                isCurrent: overviewExists && !featuresExist,
                isLocked: !overviewExists,
                actionType: featuresExist ? 'view' : 'create',
                actionPath: featuresExist ? null : `/features/create/${project.id}`,
            },
            {
                id: 'prd',
                title: 'Product Requirements Document',
                description: 'Create a detailed Product Requirements Document',
                icon: FileTextIcon,
                isCompleted: prdExists,
                isCurrent: overviewExists && featuresExist && !prdExists,
                isLocked: !overviewExists || !featuresExist,
                actionType: prdExists ? 'navigate' : 'generate',
                actionPath: prdExists ? `/projects/${project.id}/prd` : null,
            },
            {
                id: 'erd',
                title: 'Database Design',
                description: 'Design the database schema and relationships',
                icon: DatabaseIcon,
                isCompleted: erdExists,
                isCurrent: overviewExists && featuresExist && prdExists && !erdExists,
                isLocked: !overviewExists || !featuresExist || !prdExists,
                actionType: 'navigate',
                actionPath: `/projects/${project.id}/erd`,
            },
            {
                id: 'architecture',
                title: 'System Architecture',
                description: 'Visualize the system architecture using C4 model',
                icon: LayersIcon,
                isCompleted: c4Exists,
                isCurrent: overviewExists && featuresExist && prdExists && erdExists && !c4Exists,
                isLocked: !overviewExists || !featuresExist || !prdExists,
                actionType: c4Exists ? 'navigate' : 'generate',
                actionPath: c4Exists ? `/projects/${project.id}/c4` : null,
            },
        ];

        return steps;
    };

    const roadmapSteps = useMemo(() => getRoadmapSteps(), [sections, features.length, project.c4]);
    const currentStep = roadmapSteps.find((step) => step.isCurrent);
    const completedStepsCount = roadmapSteps.filter((step) => step.isCompleted).length;
    const totalStepsCount = roadmapSteps.length;

    const completionPercentage = useMemo(() => {
        return Math.round((completedStepsCount / totalStepsCount) * 100);
    }, [completedStepsCount, totalStepsCount]);

    const health = useMemo(() => getHealthStatus(completionPercentage), [completionPercentage]);

    const renderMarkdown = (markdown: string | null | undefined) => {
        if (!markdown || typeof markdown !== 'string') return null;

        const lines = markdown.split('\n');
        const elements = lines.map((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return null;

            if (trimmedLine.startsWith('# ')) {
                return (
                    <h1 key={index} className="mb-4 text-2xl font-bold text-foreground">
                        {trimmedLine.substring(2)}
                    </h1>
                );
            }
            if (trimmedLine.startsWith('## ')) {
                return (
                    <h2 key={index} className="mb-3 text-xl font-semibold text-foreground">
                        {trimmedLine.substring(3)}
                    </h2>
                );
            }
            if (trimmedLine.startsWith('### ')) {
                return (
                    <h3 key={index} className="mb-2 text-lg font-medium text-foreground">
                        {trimmedLine.substring(4)}
                    </h3>
                );
            }

            if (trimmedLine.match(/^[-*_]{3,}$/)) {
                return <hr key={index} className="my-4 border-t border-border" />;
            }

            return (
                <p key={index} className="mb-3 leading-relaxed text-muted-foreground">
                    {trimmedLine}
                </p>
            );
        });

        const filtered = elements.filter(Boolean);
        return filtered.length > 0 ? <>{filtered}</> : null;
    };

    const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const message = formData.get('message') as string;
        if (!message.trim()) return;

        const userMessage = { role: 'user' as const, content: message };
        setChatMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        setTimeout(() => {
            const aiResponse = {
                role: 'assistant' as const,
                content: `I understand you're asking about "${message}" regarding the project "${project.name}". This is a simulated response.`,
            };
            setChatMessages((prev) => [...prev, aiResponse]);
            setIsLoading(false);
        }, 1200);

        e.currentTarget.reset();
    };

    const navGroups = [
        {
            label: 'Project',
            items: [
                {
                    key: 'home',
                    icon: HomeIcon,
                    label: 'Project Home',
                    active: activeSection === 'home',
                    onClick: () => {
                        setActiveSection('home');
                        router.visit(`/projects/${project.id}`);
                    },
                },
                {
                    key: 'team',
                    icon: UsersIcon,
                    label: 'Team',
                    onClick: () => router.get(`/projects/${project.id}/team`),
                },
            ],
        },
    ];

    const handleRoadmapAction = (step: RoadmapStep) => {
        if (step.isLocked || (step.isCompleted && step.actionType === 'generate')) return;

        if (step.id === 'features' && step.actionType === 'view') {
            setActiveSection('features');
            return;
        }

        if (step.actionType === 'navigate' && step.actionPath) {
            router.get(step.actionPath);
        } else if (step.actionType === 'generate') {
            if (step.id === 'prd') {
                router.post(`/projects/${project.id}/prd/generate`);
            } else if (step.id === 'architecture') {
                router.post(`/projects/${project.id}/c4/generate`);
            }
        } else if (step.actionType === 'create' && step.actionPath) {
            setIsCreatingFeatures(true);
            router.get(
                step.actionPath,
                {},
                {
                    onFinish: () => setIsCreatingFeatures(false),
                },
            );
        }
    };

    return (
        <>
            <Head title={`Project: ${project.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectSidebar
                        project={project}
                        navGroups={navGroups}
                        repository={repository}
                        completionPercentage={completionPercentage}
                        isCollapsed={isSidebarCollapsed}
                        user={auth.user}
                    />

                    <main className="min-w-0 flex-1">
                        <div className="py-8 pr-4 pb-32 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">
                            <div className="mb-6 flex items-center gap-3">
                                <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                            <header className="mb-8">
                                <div>
                                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">{project.name}</h1>
                                    <p className="mt-1 text-sm text-muted-foreground">Streamlined project workspace</p>
                                </div>
                            </header>

                            {activeSection === 'home' && (
                                <section className="space-y-8">
                                    {/* Next Step Callout */}
                                    {currentStep && (
                                        <div className="rounded-lg border-l-4 border-l-primary bg-primary/5 p-6 dark:bg-primary/10">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <span className="text-xs font-semibold tracking-wider text-primary uppercase">Next Step</span>
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            {completedStepsCount} / {totalStepsCount} completed
                                                        </Badge>
                                                    </div>
                                                    <h3 className="mb-1 text-lg font-semibold text-foreground">{currentStep.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{currentStep.description}</p>
                                                </div>
                                                <Button
                                                    onClick={() => handleRoadmapAction(currentStep)}
                                                    disabled={currentStep.isLocked || isCreatingFeatures}
                                                    size="lg"
                                                    className="shrink-0"
                                                >
                                                    {isCreatingFeatures && currentStep.id === 'features' ? (
                                                        <>
                                                            <ClockIcon className="mr-2 h-4 w-4 animate-spin" />
                                                            Creating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            {currentStep.isCompleted
                                                                ? 'View'
                                                                : currentStep.actionType === 'generate'
                                                                  ? 'Generate'
                                                                  : currentStep.actionType === 'create'
                                                                    ? 'Create'
                                                                    : 'Open'}
                                                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* All Steps Complete State */}
                                    {!currentStep && completedStepsCount === totalStepsCount && (
                                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                                            <div className="flex items-center gap-3">
                                                <CheckCircleIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                                <div>
                                                    <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">All core steps complete!</h3>
                                                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                                        Your project roadmap is complete. Explore team collaboration and integrations.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid gap-8 lg:grid-cols-3">
                                        <div className="space-y-8 lg:col-span-2">
                                            {/* Project Roadmap */}
                                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                                <div className="border-b p-4">
                                                    <div className="flex items-center justify-between">
                                                        <h2 className="text-lg font-semibold text-foreground">Project Roadmap</h2>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <span>
                                                                {completedStepsCount} of {totalStepsCount} steps
                                                            </span>
                                                            <span>•</span>
                                                            <span>{Math.round((completedStepsCount / totalStepsCount) * 100)}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <div className="space-y-6">
                                                        {roadmapSteps.map((step, index) => {
                                                            const isLast = index === roadmapSteps.length - 1;
                                                            const StepIcon = step.icon;

                                                            return (
                                                                <div key={step.id} className="relative">
                                                                    {/* Connecting Line */}
                                                                    {!isLast && (
                                                                        <div
                                                                            className={`absolute top-12 left-5 h-full w-0.5 ${
                                                                                step.isCompleted
                                                                                    ? 'bg-primary'
                                                                                    : step.isCurrent
                                                                                      ? 'bg-primary/30'
                                                                                      : 'bg-muted'
                                                                            }`}
                                                                        />
                                                                    )}

                                                                    <div className="relative flex items-start gap-4">
                                                                        {/* Step Icon/Status */}
                                                                        <div
                                                                            className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                                                                                step.isCompleted
                                                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                                                    : step.isCurrent
                                                                                      ? 'border-primary bg-background text-primary ring-4 ring-primary/20'
                                                                                      : step.isLocked
                                                                                        ? 'border-muted bg-muted text-muted-foreground opacity-50'
                                                                                        : 'border-muted bg-background text-muted-foreground'
                                                                            }`}
                                                                        >
                                                                            {step.isCompleted ? (
                                                                                <CheckCircleIcon className="h-5 w-5" />
                                                                            ) : step.isLocked ? (
                                                                                <LockIcon className="h-5 w-5" />
                                                                            ) : (
                                                                                <StepIcon className="h-5 w-5" />
                                                                            )}
                                                                        </div>

                                                                        {/* Step Content */}
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="flex items-start justify-between gap-4">
                                                                                <div className="flex-1">
                                                                                    <div className="mb-1 flex items-center gap-2">
                                                                                        <h3
                                                                                            className={`font-semibold ${
                                                                                                step.isCurrent
                                                                                                    ? 'text-foreground'
                                                                                                    : step.isLocked
                                                                                                      ? 'text-muted-foreground'
                                                                                                      : step.isCompleted
                                                                                                        ? 'text-foreground'
                                                                                                        : 'text-muted-foreground'
                                                                                            }`}
                                                                                        >
                                                                                            {step.title}
                                                                                        </h3>
                                                                                        {step.isCurrent && (
                                                                                            <Badge variant="default" className="text-[10px]">
                                                                                                Current
                                                                                            </Badge>
                                                                                        )}
                                                                                        {step.isCompleted && (
                                                                                            <Badge
                                                                                                variant="outline"
                                                                                                className="border-emerald-200 text-[10px] text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400"
                                                                                            >
                                                                                                Complete
                                                                                            </Badge>
                                                                                        )}
                                                                                    </div>
                                                                                    <p
                                                                                        className={`text-sm ${
                                                                                            step.isLocked
                                                                                                ? 'text-muted-foreground/70'
                                                                                                : 'text-muted-foreground'
                                                                                        }`}
                                                                                    >
                                                                                        {step.description}
                                                                                    </p>
                                                                                    {step.isLocked && (
                                                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                                                            Complete previous steps to unlock
                                                                                        </p>
                                                                                    )}
                                                                                </div>

                                                                                {/* Action Button */}
                                                                                {!step.isLocked && (
                                                                                    <Button
                                                                                        onClick={() => handleRoadmapAction(step)}
                                                                                        disabled={
                                                                                            (step.isCompleted && step.actionType === 'generate') ||
                                                                                            (isCreatingFeatures && step.id === 'features')
                                                                                        }
                                                                                        variant={step.isCurrent ? 'default' : 'outline'}
                                                                                        size="sm"
                                                                                        className="shrink-0"
                                                                                    >
                                                                                        {isCreatingFeatures && step.id === 'features' ? (
                                                                                            <>
                                                                                                <ClockIcon className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                                                                Creating...
                                                                                            </>
                                                                                        ) : step.isCompleted ? (
                                                                                            step.actionType === 'generate' ? (
                                                                                                'Regenerate'
                                                                                            ) : (
                                                                                                'View'
                                                                                            )
                                                                                        ) : step.actionType === 'generate' ? (
                                                                                            'Generate'
                                                                                        ) : step.actionType === 'create' ? (
                                                                                            'Create'
                                                                                        ) : (
                                                                                            'Open'
                                                                                        )}
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Simplified Metrics */}
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                                                    <div className="mb-1 text-xs font-medium text-muted-foreground">Overall Progress</div>
                                                    <div className="flex items-end justify-between">
                                                        <div className="text-2xl font-bold">{completionPercentage}%</div>
                                                        <health.Icon className={`h-5 w-5 ${health.color} mb-1`} />
                                                    </div>
                                                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full bg-primary transition-all"
                                                            style={{ width: `${completionPercentage}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div
                                                    className="cursor-pointer rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-muted/50"
                                                    onClick={() => {
                                                        if (features.length > 0) {
                                                            setActiveSection('features');
                                                        }
                                                    }}
                                                >
                                                    <div className="mb-1 text-xs font-medium text-muted-foreground">Total Features</div>
                                                    <div className="text-2xl font-bold">{features.length}</div>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {features.filter((f) => f.status === 'completed').length} completed
                                                        {features.length > 0 && <span className="ml-1 text-primary">• Click to view</span>}
                                                    </p>
                                                </div>

                                                {/* Technology Stack Card */}
                                                <div
                                                    className="cursor-pointer rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-muted/50 sm:col-span-2"
                                                    onClick={() => router.visit(`/projects/${project.id}/technology`)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="mb-1 text-xs font-medium text-muted-foreground">Technical</div>
                                                            <div className="flex items-center gap-2 text-lg font-bold">
                                                                <CodeIcon className="h-5 w-5 text-primary" />
                                                                Technology Stack
                                                            </div>
                                                            <p className="mt-1 text-xs text-muted-foreground">View and manage project technologies</p>
                                                        </div>
                                                        <ArrowRightIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Team Preview */}
                                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                                <div className="border-b p-4">
                                                    <h3 className="text-sm font-semibold">Team</h3>
                                                </div>
                                                <div className="p-4">
                                                    <TeamPreview members={teamMembers} totalCount={teamMembersCount} projectId={project.id} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {activeSection === 'features' && (
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-foreground">Features</h2>
                                            {!sections.prd && (
                                                <div className="mt-1 inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                                    <AlertCircleIcon className="h-3.5 w-3.5" />
                                                    <span>Generate PRD first to enable feature generation</span>
                                                </div>
                                            )}
                                        </div>
                                        <Button onClick={() => setIsCreateFeatureModalOpen(true)} size="sm" disabled={!sections.prd}>
                                            Create Feature
                                        </Button>
                                    </div>

                                    {features.length === 0 ? (
                                        <div className="rounded border p-8 text-center text-sm text-muted-foreground">No features yet.</div>
                                    ) : (
                                        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {features.map((f) => (
                                                <li
                                                    key={f.id}
                                                    className="cursor-pointer rounded border p-4 transition-colors hover:bg-muted/40"
                                                    onClick={() => router.visit(`/features/${f.id}`)}
                                                >
                                                    <div className="mb-2 flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <div className="truncate text-sm font-medium text-foreground">{f.name}</div>
                                                            <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{f.summary}</div>
                                                        </div>
                                                        <Badge className={`shrink-0 border text-xs capitalize ${getPriorityColor(f.priority)}`}>
                                                            {f.priority}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {f.status === 'in_progress' ? 'In progress' : f.status}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            Order #{f.order_of_implementation}
                                                        </Badge>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </section>
                            )}
                        </div>
                    </main>
                </div>

                <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
                    <Button onClick={() => setIsFloatingChatOpen(!isFloatingChatOpen)} className="h-14 w-14 rounded-full shadow-lg" size="icon">
                        <MessageCircleIcon className="h-6 w-6" />
                    </Button>

                    {isFloatingChatOpen && (
                        <div className="absolute right-0 bottom-16 w-[calc(100vw-2rem)] rounded border bg-background shadow-lg sm:w-96">
                            <div className="border-b px-4 py-3 text-sm font-medium">AI Assistant</div>
                            <div className="space-y-4 p-4">
                                {chatMessages.length > 0 && (
                                    <div className="max-h-40 space-y-2 overflow-y-auto">
                                        {chatMessages.map((message, index) => (
                                            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`max-w-xs rounded px-3 py-2 text-sm ${
                                                        message.role === 'user' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {message.content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <PromptInput onSubmit={handleChatSubmit}>
                                    <PromptInputTextarea
                                        name="message"
                                        placeholder="Ask about your project..."
                                        className="min-h-[80px] resize-none"
                                    />
                                    <PromptInputToolbar>
                                        <PromptInputSubmit disabled={isLoading} />
                                    </PromptInputToolbar>
                                </PromptInput>
                            </div>
                        </div>
                    )}
                </div>

                <Dialog open={isBriefModalOpen} onOpenChange={setIsBriefModalOpen}>
                    <DialogContent className="max-h-[80vh] max-w-3xl overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FileIcon className="h-4 w-4" />
                                Project Brief
                            </DialogTitle>
                            <DialogDescription>Overview and context for this project</DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 max-h-[calc(80vh-8rem)] overflow-y-auto pr-2">
                            <div className="prose prose-slate dark:prose-invert max-w-none">{renderMarkdown(project.brief)}</div>
                        </div>
                    </DialogContent>
                </Dialog>

                <CreateFeatureModal open={isCreateFeatureModalOpen} onOpenChange={setIsCreateFeatureModalOpen} projectId={project.id} />
            </div>
        </>
    );
}
