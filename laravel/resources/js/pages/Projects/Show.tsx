import { PromptInput, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar } from '@/components/ai-elements/prompt-input';
import { Breadcrumbs } from '@/components/breadcrumbs';
import CreateFeatureModal from '@/components/Features/CreateFeatureModal';
import ProjectFlowCanvas from '@/components/Projects/ProjectFlowCanvas';
import ProjectMetricsPanel from '@/components/Projects/ProjectMetricsPanel';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Button } from '@/components/ui/button';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { getHealthStatus } from '@/utils/project-status';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronUp, CodeIcon, DatabaseIcon, FileIcon, FileText as FileTextIcon, Layers as LayersIcon, MessageCircleIcon, ZapIcon } from 'lucide-react';
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

export default function ProjectShow({
    project,
    sections,
    features = [],
    brainstormingCompleted = false,
    repository = null,
    teamMembers = [],
    teamMembersCount = 0,
}: Props) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const getInitials = useInitials();

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
    const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);

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
        isHardLocked: boolean;
        actionType: 'navigate' | 'generate' | 'view' | 'create';
        actionPath: string | null;
        actionHandler?: () => void;
        prerequisites: string[];
        prerequisiteMessage?: string;
    }

    const getRoadmapSteps = (): RoadmapStep[] => {
        const overviewExists = !!sections.overview;
        const featuresExist = features.length > 0;
        const prdExists = !!sections.prd;
        const erdExists = !!sections.data_modeling;
        const c4Exists = !!project.c4;
        const technicalDetailsExist = !!(sections.technical_details || project.technical_details);

        // Exclude Brainstorming from flow - it's only in sidebar
        const steps: RoadmapStep[] = [
            {
                id: 'overview',
                title: 'System Overview',
                description: 'Define the high-level system overview and requirements',
                icon: FileIcon,
                isCompleted: overviewExists,
                isCurrent: !overviewExists,
                isLocked: false,
                isHardLocked: false,
                actionType: 'navigate',
                actionPath: `/projects/${project.id}/system-overview`,
                prerequisites: [],
            },
            {
                id: 'technical_details',
                title: 'Technical Details',
                description: 'Specify technical requirements and constraints',
                icon: CodeIcon,
                isCompleted: technicalDetailsExist,
                isCurrent: !technicalDetailsExist && overviewExists,
                isLocked: false,
                isHardLocked: false,
                actionType: 'navigate',
                actionPath: `/projects/${project.id}/technology`,
                prerequisites: [],
            },
            {
                id: 'prd',
                title: 'Product Requirements',
                description: 'Create a detailed Product Requirements Document',
                icon: FileTextIcon,
                isCompleted: prdExists,
                isCurrent: overviewExists && !prdExists,
                isLocked: !overviewExists,
                isHardLocked: !overviewExists,
                actionType: prdExists ? 'navigate' : 'generate',
                actionPath: prdExists ? `/projects/${project.id}/prd` : null,
                prerequisites: ['overview'],
                prerequisiteMessage: 'Complete System Overview to generate PRD',
            },
            {
                id: 'features',
                title: 'Features',
                description: 'Break down the project into manageable features',
                icon: ZapIcon,
                isCompleted: featuresExist,
                isCurrent: overviewExists && prdExists && !featuresExist,
                isLocked: !overviewExists || !prdExists,
                isHardLocked: !overviewExists || !prdExists,
                actionType: featuresExist ? 'navigate' : 'create',
                actionPath: featuresExist ? `/projects/${project.id}/features` : `/features/create/${project.id}`,
                prerequisites: ['overview', 'prd'],
                prerequisiteMessage: 'Complete PRD to create features',
            },
            {
                id: 'erd',
                title: 'Database Design',
                description: 'Design the database schema and relationships',
                icon: DatabaseIcon,
                isCompleted: erdExists,
                isCurrent: overviewExists && prdExists && featuresExist && !erdExists,
                isLocked: !overviewExists || !prdExists || !featuresExist,
                isHardLocked: !prdExists || !featuresExist,
                actionType: 'navigate',
                actionPath: `/projects/${project.id}/erd`,
                prerequisites: ['overview', 'prd', 'features'],
                prerequisiteMessage: prdExists && featuresExist ? undefined : 'Complete PRD and Features to unlock Database Design',
            },
            {
                id: 'architecture',
                title: 'System Architecture',
                description: 'Visualize the system architecture using C4 model',
                icon: LayersIcon,
                isCompleted: c4Exists,
                isCurrent: overviewExists && prdExists && featuresExist && erdExists && !c4Exists,
                isLocked: !overviewExists || !prdExists || !featuresExist,
                isHardLocked: !prdExists || !featuresExist,
                actionType: c4Exists ? 'navigate' : 'generate',
                actionPath: c4Exists ? `/projects/${project.id}/c4` : null,
                prerequisites: ['overview', 'prd', 'features'],
                prerequisiteMessage: prdExists && featuresExist ? undefined : 'Complete PRD and Features to unlock System Architecture',
            },
        ];

        return steps;
    };

    const roadmapSteps = useMemo(() => getRoadmapSteps(), [sections, features.length, project.c4, project.technical_details]);
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

    const navGroups = useMemo(
        () =>
            buildProjectNavGroups({
                project,
                currentPage: 'home',
            }),
        [project.id],
    );

    const handleRoadmapAction = (step: RoadmapStep) => {
        if (step.isHardLocked) return;

        if (step.actionType === 'generate' && step.isLocked) return;

        if (step.actionType === 'navigate' && step.actionPath) {
            router.get(step.actionPath);
        } else if (step.actionType === 'generate') {
            if (step.isLocked) return;
            if (step.id === 'prd') {
                router.post(`/projects/${project.id}/prd/generate`);
            } else if (step.id === 'architecture') {
                router.post(`/projects/${project.id}/c4/generate`);
            }
        } else if (step.actionType === 'create' && step.actionPath) {
            if (step.isLocked) return;
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
                    <ProjectSidebarPanel
                        project={project}
                        navGroups={navGroups}
                        repository={repository}
                        completionPercentage={completionPercentage}
                        health={health}
                        isCollapsed={isSidebarCollapsed}
                        user={auth.user}
                    />

                    <main className="flex min-w-0 flex-1 flex-col">
                        {/* Minimal header bar with breadcrumbs */}
                        <div className="shrink-0 border-b border-border/50 bg-muted/20 px-4 py-3 sm:px-6">
                            <div className="flex items-center gap-3">
                                <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                        </div>

                        {/* Split layout container - Always vertical */}
                        <div className="relative flex flex-1 flex-col overflow-hidden">
                            {/* Canvas Section */}
                            <div
                                className={`relative flex flex-col overflow-hidden transition-all ${
                                    isCanvasExpanded ? 'h-full' : 'flex-1'
                                }`}
                            >
                                <ProjectFlowCanvas
                                    steps={roadmapSteps.map((step) => ({
                                        ...step,
                                        onClick: () => handleRoadmapAction(step),
                                    }))}
                                    teamMembers={[]}
                                    teamMembersCount={0}
                                    projectId={project.id}
                                    features={features}
                                />

                                {/* Collapse Toggle Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsCanvasExpanded(!isCanvasExpanded)}
                                    className="absolute bottom-0 left-0 z-20 gap-2 rounded-none rounded-tr-lg border-t border-r border-border/50 bg-background/90 shadow-md backdrop-blur-sm hover:bg-background hover:shadow-lg"
                                    title={isCanvasExpanded ? 'Show metrics panel' : 'Expand canvas'}
                                >
                                    {isCanvasExpanded ? (
                                        <>
                                            <ChevronDown className="h-4 w-4" />
                                            <span className="hidden sm:inline">Show Metrics</span>
                                        </>
                                    ) : (
                                        <>
                                            <ChevronUp className="h-4 w-4" />
                                            <span className="hidden sm:inline">Expand Canvas</span>
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Metrics Panel Section */}
                            {!isCanvasExpanded && (
                                <div className="border-t border-border/50 shrink-0">
                                    <ProjectMetricsPanel
                                        projectId={project.id}
                                        completionPercentage={completionPercentage}
                                        completedStepsCount={completedStepsCount}
                                        totalStepsCount={totalStepsCount}
                                        health={health}
                                        teamMembers={teamMembers}
                                        teamMembersCount={teamMembersCount}
                                        repository={repository}
                                        featuresCount={features.length}
                                        className="h-auto max-h-[50vh]"
                                    />
                                </div>
                            )}
                        </div>
                    </main>
                </div>

                <div className="fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6">
                    <Button
                        onClick={() => setIsFloatingChatOpen(!isFloatingChatOpen)}
                        className="h-12 w-12 rounded-full border-2 border-border/50 bg-background/80 shadow-md backdrop-blur-sm transition-all hover:bg-background hover:shadow-lg"
                        size="icon"
                        variant="outline"
                        aria-label="Open AI Assistant"
                    >
                        <MessageCircleIcon className="h-5 w-5 text-muted-foreground" />
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
