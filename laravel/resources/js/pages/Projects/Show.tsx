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
import { type User, type Project, type Sections } from '@/types';
import { getHealthStatus } from '@/utils/project-status';
import { getPriorityColor } from '@/utils/status-colors';
import { Head, router, usePage } from '@inertiajs/react';
import { 
    ChevronDown, 
    ChevronUp, 
    ClipboardList,
    Code2,
    Database,
    FileText,
    LayoutGrid,
    Network,
    ScrollText,
    Target
} from 'lucide-react';
import { useMemo, useState } from 'react';

// WHY: Using shared Project and Sections types from @/types instead of duplicate definitions

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
    status: 'planned' | 'in_progress' | 'completed';
    order_of_implementation: number;
    metrics?: string | null;
    erd?: string | null;
    erd_is_synced?: boolean;
    progress?: number;
    features?: FeatureItem[];
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
    modules?: ModuleItem[];
    brainstormingCompleted?: boolean;
    repository?: Repository | null;
    teamMembers?: TeamMember[];
    teamMembersCount?: number;
    hasTechnicalIntake?: boolean;
}

export default function ProjectShow({
    project,
    sections,
    modules = [],
    brainstormingCompleted = false,
    repository = null,
    teamMembers = [],
    teamMembersCount = 0,
    hasTechnicalIntake = false,
}: Props) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const getInitials = useInitials();

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
    ];
    const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
    const [isCreateFeatureModalOpen, setIsCreateFeatureModalOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isGeneratingModules, setIsGeneratingModules] = useState(false);
    const [isGeneratingTechnicalDetails, setIsGeneratingTechnicalDetails] = useState(false);
    const [isGeneratingERD, setIsGeneratingERD] = useState(false);
    const [isGeneratingPRD, setIsGeneratingPRD] = useState(false);
    const [isGeneratingArchitecture, setIsGeneratingArchitecture] = useState(false);
    const [navigatingStepId, setNavigatingStepId] = useState<string | null>(null);
    const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);

    // getPriorityColor now imported from @/utils/status-colors

    interface RoadmapStep {
        id: string;
        title: string;
        description: string;
        icon: React.ComponentType<{ className?: string }>;
        iconColorClass?: string;
        iconBgClass?: string;
        isCompleted: boolean;
        isCurrent: boolean;
        isLocked: boolean;
        isHardLocked: boolean;
        actionType: 'navigate' | 'generate' | 'view' | 'create';
        actionPath: string | null;
        actionHandler?: () => void;
        prerequisites: string[];
        prerequisiteMessage?: string;
        isLoading?: boolean;
        isOutOfSync?: boolean;
        currentBadgeLabel?: string;
    }

    const getRoadmapSteps = (): RoadmapStep[] => {
        const briefExists = !!project.brief;
        const overviewExists = !!sections.overview;
        const modulesExist = modules.length > 0;
        const prdExists = !!sections.prd;
        const erdExists = !!sections.data_modeling;
        const c4Exists = !!project.c4;
        const technicalDetailsExist = hasTechnicalIntake;

        // New Flow: Brief → Overview + Technical Details → System Modules → PRD, System Arch, Database
        const steps: RoadmapStep[] = [
            // Stage 1: Brief
            {
                id: 'brief',
                title: 'Project Brief',
                description: 'Define project purpose, audience, and core value',
                icon: Target,
                iconColorClass: 'text-rose-500',
                iconBgClass: 'bg-rose-100 dark:bg-rose-500/20',
                isCompleted: briefExists,
                isCurrent: !briefExists,
                isLocked: false,
                isHardLocked: false,
                actionType: briefExists ? 'view' : 'navigate',
                actionPath: briefExists ? null : `/projects/${project.id}/prepare`,
                actionHandler: briefExists ? () => setIsBriefModalOpen(true) : undefined,
                prerequisites: [],
            },
            // Stage 2: Overview & Technical Details (parallel, unlocked after Brief)
            {
                id: 'overview',
                title: 'System Overview',
                description: 'Define the high-level system overview and requirements',
                icon: ScrollText,
                iconColorClass: 'text-blue-500',
                iconBgClass: 'bg-blue-100 dark:bg-blue-500/20',
                isCompleted: overviewExists,
                isCurrent: briefExists && !overviewExists,
                isLocked: !briefExists,
                isHardLocked: !briefExists,
                actionType: 'navigate',
                actionPath: `/projects/${project.id}/system-overview`,
                prerequisites: ['brief'],
                prerequisiteMessage: 'Complete Project Brief first',
                isLoading: navigatingStepId === 'overview',
            },
            {
                id: 'technical_details',
                title: 'Technical Details',
                description: 'Specify technical requirements and constraints',
                icon: Code2,
                iconColorClass: 'text-cyan-500',
                iconBgClass: 'bg-cyan-100 dark:bg-cyan-500/20',
                isCompleted: technicalDetailsExist,
                isCurrent: briefExists && !technicalDetailsExist,
                isLocked: !briefExists,
                isHardLocked: !briefExists,
                actionType: 'navigate',
                actionPath: `/projects/${project.id}/technology`,
                prerequisites: ['brief'],
                prerequisiteMessage: 'Complete Project Brief first',
                currentBadgeLabel: 'Complete',
                isLoading: navigatingStepId === 'technical_details',
            },
            // Stage 3: System Modules (unlocked after Overview)
            {
                id: 'modules',
                title: 'System Modules',
                description: 'Define DDD bounded contexts and system modules',
                icon: LayoutGrid,
                iconColorClass: 'text-violet-500',
                iconBgClass: 'bg-violet-100 dark:bg-violet-500/20',
                isCompleted: modulesExist,
                isCurrent: overviewExists && !modulesExist,
                isLocked: !overviewExists,
                isHardLocked: !overviewExists,
                actionType: modulesExist ? 'navigate' : 'generate',
                actionPath: modulesExist ? `/projects/${project.id}/modules` : null,
                prerequisites: ['overview'],
                prerequisiteMessage: 'Complete System Overview to generate modules',
                isLoading: isGeneratingModules,
                currentBadgeLabel: 'Generate',
            },
            // Stage 4: PRD, System Architecture, Database (parallel, unlocked after Modules)
            {
                id: 'prd',
                title: 'Product Requirements',
                description: 'Create a detailed Product Requirements Document',
                icon: ClipboardList,
                iconColorClass: 'text-amber-500',
                iconBgClass: 'bg-amber-100 dark:bg-amber-500/20',
                isCompleted: prdExists,
                isCurrent: modulesExist && !prdExists,
                isLocked: !modulesExist,
                isHardLocked: !modulesExist,
                actionType: prdExists ? 'navigate' : 'generate',
                actionPath: prdExists ? `/projects/${project.id}/prd` : null,
                prerequisites: ['modules'],
                prerequisiteMessage: 'Complete System Modules to generate PRD',
                isLoading: isGeneratingPRD,
                isOutOfSync: prdExists && project.prd_is_synced === false,
            },
            {
                id: 'architecture',
                title: 'System Architecture',
                description: 'Visualize the system architecture using C4 model',
                icon: Network,
                iconColorClass: 'text-green-500',
                iconBgClass: 'bg-green-100 dark:bg-green-500/20',
                isCompleted: c4Exists,
                isCurrent: modulesExist && !c4Exists,
                isLocked: !modulesExist,
                isHardLocked: !modulesExist,
                actionType: c4Exists ? 'navigate' : 'generate',
                actionPath: c4Exists ? `/projects/${project.id}/c4` : null,
                prerequisites: ['modules'],
                prerequisiteMessage: 'Complete System Modules to unlock System Architecture',
                isLoading: isGeneratingArchitecture,
            },
            {
                id: 'erd',
                title: 'Database Design',
                description: 'Design the database schema and relationships',
                icon: Database,
                iconColorClass: 'text-orange-500',
                iconBgClass: 'bg-orange-100 dark:bg-orange-500/20',
                isCompleted: erdExists,
                isCurrent: modulesExist && !erdExists,
                isLocked: !modulesExist,
                isHardLocked: !modulesExist,
                actionType: erdExists ? 'navigate' : 'generate',
                actionPath: erdExists ? `/projects/${project.id}/erd` : null,
                prerequisites: ['modules'],
                prerequisiteMessage: 'Complete System Modules to unlock Database Design',
                isLoading: isGeneratingERD,
                currentBadgeLabel: erdExists ? undefined : 'Generate',
            },
        ];

        return steps;
    };

    /**
     * WHY: Fixed incomplete dependencies. Original deps were missing:
     * - project.brief, project.prd_is_synced
     * - sections.overview, sections.prd, sections.data_modeling
     * Without these, roadmap wouldn't update when those values change.
     */
    const roadmapSteps = useMemo(
        () => getRoadmapSteps(),
        [
            project.brief,
            project.c4,
            project.prd_is_synced,
            sections.overview,
            sections.prd,
            sections.data_modeling,
            modules.length,
            hasTechnicalIntake,
            isGeneratingModules,
            isGeneratingTechnicalDetails,
            isGeneratingERD,
            isGeneratingPRD,
            isGeneratingArchitecture,
            navigatingStepId,
        ]
    );
    const currentStep = roadmapSteps.find((step) => step.isCurrent);
    const completedStepsCount = roadmapSteps.filter((step) => step.isCompleted).length;
    const totalStepsCount = roadmapSteps.length;

    // Use backend-computed project progress for sidebar/health display
    const completionPercentage = useMemo(() => {
        return project.progress ?? 0;
    }, [project.progress]);

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

        if (step.actionType === 'view' && step.actionHandler) {
            step.actionHandler();
        } else if (step.actionType === 'navigate' && step.actionPath) {
            setNavigatingStepId(step.id);
            router.get(
                step.actionPath,
                {},
                {
                    onFinish: () => setNavigatingStepId(null),
                },
            );
        } else if (step.actionType === 'generate') {
            if (step.isLocked) return;
            if (step.id === 'prd') {
                setIsGeneratingPRD(true);
                router.post(
                    `/projects/${project.id}/prd/generate`,
                    {},
                    {
                        onFinish: () => setIsGeneratingPRD(false),
                    },
                );
            } else if (step.id === 'architecture') {
                setIsGeneratingArchitecture(true);
                router.post(
                    `/projects/${project.id}/c4/generate`,
                    {},
                    {
                        onFinish: () => setIsGeneratingArchitecture(false),
                    },
                );
            } else if (step.id === 'modules') {
                setIsGeneratingModules(true);
                router.get(
                    `/modules/create/${project.id}`,
                    {},
                    {
                        onFinish: () => setIsGeneratingModules(false),
                    },
                );
            } else if (step.id === 'technical_details') {
                setIsGeneratingTechnicalDetails(true);
                router.post(
                    `/projects/${project.id}/technology/generate`,
                    {},
                    {
                        onFinish: () => setIsGeneratingTechnicalDetails(false),
                        onSuccess: () => {
                            router.reload();
                        },
                    },
                );
            } else if (step.id === 'erd') {
                setIsGeneratingERD(true);
                router.post(
                    `/projects/${project.id}/erd/merge`,
                    {},
                    {
                        onFinish: () => setIsGeneratingERD(false),
                    },
                );
            }
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
                                    modules={modules}
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
                                        modulesCount={modules.length}
                                        className="h-auto max-h-[50vh]"
                                    />
                                </div>
                            )}
                        </div>
                    </main>
                </div>

                <Dialog open={isBriefModalOpen} onOpenChange={setIsBriefModalOpen}>
                    <DialogContent className="max-h-[80vh] max-w-3xl overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
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
