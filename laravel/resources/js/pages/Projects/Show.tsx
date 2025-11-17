import { PromptInput, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar } from '@/components/ai-elements/prompt-input';
import { Breadcrumbs } from '@/components/breadcrumbs';
import CreateFeatureModal from '@/components/Features/CreateFeatureModal';
import { RepoConnectDialog } from '@/components/github/repo-connect-dialog';
import { RepoManagementModal } from '@/components/github/repo-management-modal';
import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { TeamPreview } from '@/components/TeamPreview';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, RadialBarChart, RadialBar } from 'recharts';
import {
    AlertCircleIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    CircleIcon,
    ClockIcon,
    CodeIcon,
    DatabaseIcon,
    FileIcon,
    FileText as FileTextIcon,
    Github as GithubIcon,
    HomeIcon,
    Layers as LayersIcon,
    LightbulbIcon,
    MessageCircleIcon,
    PanelLeftClose,
    PanelLeftOpen,
    TrendingUpIcon,
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
    const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
    const [isRepoManagementOpen, setIsRepoManagementOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isCreatingFeatures, setIsCreatingFeatures] = useState(false);

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
                return <CheckCircleIcon className="h-4 w-4" />;
            default:
                return <AlertCircleIcon className="h-4 w-4" />;
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

    const completionPercentage = useMemo(() => {
        const total = 6;
        let done = 0;
        if (sections.overview) done++;
        if (sections.prd) done++;
        if (features.length > 0) done++;
        if (sections.data_modeling) done++;
        if (project.c4) done++;
        if (project.brief) done++;
        return Math.round((done / total) * 100);
    }, [sections, features.length, project.c4, project.brief]);

    const health = useMemo(() => {
        if (completionPercentage >= 80) return { label: 'excellent', Icon: CheckCircleIcon, color: 'text-emerald-600 dark:text-emerald-300' };
        if (completionPercentage >= 60) return { label: 'good', Icon: TrendingUpIcon, color: 'text-blue-600 dark:text-blue-300' };
        if (completionPercentage >= 40) return { label: 'fair', Icon: AlertCircleIcon, color: 'text-orange-600 dark:text-orange-300' };
        return { label: 'needs attention', Icon: AlertCircleIcon, color: 'text-red-600 dark:text-red-300' };
    }, [completionPercentage]);

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

    interface NavItem {
        key: string;
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        muted?: boolean;
        emphasize?: boolean;
        active?: boolean;
        badge?: string;
        disabled?: boolean;
        onClick: () => void;
    }

    interface NavGroup {
        label: string;
        items: NavItem[];
    }

    const navGroups: NavGroup[] = [
        {
            label: 'Plan',
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
                    key: 'overview',
                    icon: FileIcon,
                    label: 'System Overview',
                    muted: !sections.overview,
                    disabled: !sections.overview,
                    onClick: () => sections.overview && router.get(`/projects/${project.id}/system-overview`),
                },
                {
                    key: 'prd',
                    icon: FileIcon,
                    label: sections.prd ? 'PRD' : 'Generate PRD',
                    emphasize: !sections.prd,
                    disabled: !sections.prd,
                    onClick: () => (sections.prd ? router.get(`/projects/${project.id}/prd`) : router.post(`/projects/${project.id}/prd/generate`)),
                },
                {
                    key: 'features',
                    icon: ZapIcon,
                    label: 'Features',
                    active: activeSection === 'features',
                    disabled: features.length === 0,
                    onClick: () => {
                        if (features.length > 0) {
                            setActiveSection('features');
                        }
                    },
                },
                {
                    key: 'team',
                    icon: UsersIcon,
                    label: 'Team Collaboration',
                    onClick: () => router.get(`/projects/${project.id}/team`),
                },
            ],
        },
        {
            label: 'Design',
            items: [
                {
                    key: 'brainstorming',
                    icon: LightbulbIcon,
                    label: 'Brainstorming',
                    emphasize: true,
                    onClick: () => router.get(`/projects/${project.id}/brainstorming`),
                },
            ],
        },
        {
            label: 'Technical',
            items: [
                {
                    key: 'erd',
                    icon: DatabaseIcon,
                    label: 'Database Designer',
                    muted: !sections.data_modeling,
                    disabled: !sections.data_modeling,
                    onClick: () => sections.data_modeling && router.get(`/projects/${project.id}/erd`),
                },
                {
                    key: 'c4',
                    icon: LayersIcon,
                    label: project.c4 ? 'System Architecture' : 'Generate C4',
                    emphasize: !project.c4,
                    disabled: !project.c4,
                    onClick: () => {
                        if (project.c4) {
                            router.get(`/projects/${project.id}/c4`);
                        } else {
                            router.post(`/projects/${project.id}/c4/generate`);
                        }
                    },
                },
                {
                    key: 'technology',
                    icon: CodeIcon,
                    label: 'Technology Stack',
                    onClick: () => router.get(`/projects/${project.id}/technology`),
                },
            ],
        },
    ];

    const getNextSteps = () => {
        const steps = [];
        
        // Priority 1: If overview is not created, it's the only step and has highest priority
        if (!sections.overview) {
            steps.push({
                title: 'Generate System Overview',
                description: 'Create a comprehensive system overview document - Required before proceeding',
                action: () => router.get(`/projects/${project.id}/system-overview`),
                icon: FileIcon,
                priority: 'critical',
                isLoading: false,
            });
            return steps; // Return early - only show overview step
        }
        
        // Priority 2: If overview exists but no features, show only the features step
        if (features.length === 0) {
            steps.push({
                title: 'Create Features',
                description: 'Define features to break down the work - Required before proceeding',
                action: () => {
                    setIsCreatingFeatures(true);
                    router.get(`/features/create/${project.id}`, {}, {
                        onFinish: () => setIsCreatingFeatures(false)
                    });
                },
                icon: ZapIcon,
                priority: 'critical',
                isLoading: isCreatingFeatures,
            });
            return steps; // Return early - only show features step
        }
        
        // Priority 3: Only show PRD if overview and features exist
        if (!sections.prd) {
            steps.push({
                title: 'Generate PRD',
                description: 'Create a Product Requirements Document to define your project',
                action: () => router.post(`/projects/${project.id}/prd/generate`),
                icon: FileIcon,
                priority: 'high',
                isLoading: false,
            });
        }
        
        // Priority 4: Only show C4 if features are created and PRD exists
        if (!project.c4 && sections.prd) {
            steps.push({
                title: 'Generate C4 Architecture',
                description: 'Create system architecture diagrams using C4 model',
                action: () => router.post(`/projects/${project.id}/c4/generate`),
                icon: LayersIcon,
                priority: 'medium',
                isLoading: false,
            });
        }
        return steps.slice(0, 3);
    };

    const getCompletionBreakdown = () => {
        // Check what should be disabled based on priority
        const overviewExists = !!sections.overview;
        const featuresExist = features.length > 0;
        const prdExists = !!sections.prd;
        
        return [
            {
                name: 'System Overview',
                completed: overviewExists,
                icon: FileIcon,
                href: `/projects/${project.id}/system-overview`,
                disabled: false, // Always enabled as it's the first step
            },
            {
                name: 'Features',
                completed: featuresExist,
                icon: ZapIcon,
                href: featuresExist ? null : `/features/create/${project.id}`,
                count: features.length,
                disabled: !overviewExists, // Disabled if overview doesn't exist
                action: featuresExist ? 'view' : 'create',
            },
            {
                name: 'PRD',
                completed: prdExists,
                icon: FileIcon,
                href: prdExists ? `/projects/${project.id}/prd` : null,
                action: prdExists ? 'view' : 'generate',
                disabled: !overviewExists || !featuresExist, // Disabled if overview or features don't exist
            },
            {
                name: 'Database Design',
                completed: !!sections.data_modeling,
                icon: DatabaseIcon,
                href: `/projects/${project.id}/erd`,
                disabled: !overviewExists || !featuresExist, // Disabled if overview or features don't exist
            },
            {
                name: 'System Architecture',
                completed: !!project.c4,
                icon: LayersIcon,
                href: project.c4 ? `/projects/${project.id}/c4` : null,
                action: project.c4 ? 'view' : 'generate',
                disabled: !overviewExists || !featuresExist || !prdExists, // Disabled if overview, features, or PRD don't exist
            },
            {
                name: 'Project Brief',
                completed: !!project.brief,
                icon: FileTextIcon,
                href: null,
                action: 'view',
                disabled: !overviewExists || !featuresExist, // Disabled if overview or features don't exist
            },
        ];
    };

    const statusChartConfig: ChartConfig = {
        completed: {
            label: 'Completed',
            theme: {
                light: 'oklch(0.5638 0.1471 264.8522)', // chart-1
                dark: 'oklch(0.5638 0.1471 264.8522)', // chart-1
            },
        },
        'in_progress': {
            label: 'In Progress',
            theme: {
                light: 'oklch(0.6907 0.1554 160.3454)', // chart-2
                dark: 'oklch(0.6907 0.1554 160.3454)', // chart-2
            },
        },
        draft: {
            label: 'Draft',
            theme: {
                light: 'oklch(0.8214 0.16 82.5337)', // chart-3
                dark: 'oklch(0.8214 0.16 82.5337)', // chart-3
            },
        },
        archived: {
            label: 'Archived',
            theme: {
                light: 'oklch(0.7064 0.1822 151.7125)', // chart-4
                dark: 'oklch(0.7064 0.1822 151.7125)', // chart-4
            },
        },
    };

    const priorityChartConfig: ChartConfig = {
        critical: {
            label: 'Critical',
            theme: {
                light: 'oklch(0.6188 0.2376 25.7658)', // destructive
                dark: 'oklch(0.6188 0.2376 25.7658)', // destructive
            },
        },
        high: {
            label: 'High',
            theme: {
                light: 'oklch(0.5638 0.1471 264.8522)', // chart-1
                dark: 'oklch(0.5638 0.1471 264.8522)', // chart-1
            },
        },
        medium: {
            label: 'Medium',
            theme: {
                light: 'oklch(0.6907 0.1554 160.3454)', // chart-2
                dark: 'oklch(0.6907 0.1554 160.3454)', // chart-2
            },
        },
        low: {
            label: 'Low',
            theme: {
                light: 'oklch(0.8214 0.16 82.5337)', // chart-3
                dark: 'oklch(0.8214 0.16 82.5337)', // chart-3
            },
        },
    };

    const getFeatureStatusData = useMemo(() => {
        const statusMap: Record<string, number> = {
            completed: 0,
            'in_progress': 0,
            draft: 0,
            archived: 0,
        };

        features.forEach((feature) => {
            if (statusMap[feature.status] !== undefined) {
                statusMap[feature.status]++;
            }
        });

        return Object.entries(statusMap)
            .filter(([_, count]) => count > 0)
            .map(([status]) => ({
                name: status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1),
                value: statusMap[status],
                statusKey: status,
                fill: `var(--color-${status})`,
            }));
    }, [features]);

    const getFeaturePriorityData = useMemo(() => {
        const priorityMap: Record<string, number> = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
        };

        features.forEach((feature) => {
            if (priorityMap[feature.priority] !== undefined) {
                priorityMap[feature.priority]++;
            }
        });

        return Object.entries(priorityMap)
            .filter(([_, count]) => count > 0)
            .map(([priority]) => ({
                name: priority.charAt(0).toUpperCase() + priority.slice(1),
                value: priorityMap[priority],
                priorityKey: priority,
                fill: `var(--color-${priority})`,
            }));
    }, [features]);

    const completionChartConfig: ChartConfig = {
        completion: {
            label: 'Completion',
            theme: {
                light: 'oklch(0.5638 0.1471 264.8522)', // chart-1 - blue
                dark: 'oklch(0.5638 0.1471 264.8522)', // chart-1 - blue
            },
        },
    };

    const completionChartData = useMemo(
        () => [
            {
                name: 'completion',
                value: completionPercentage,
                fill: 'var(--color-completion)',
            },
        ],
        [completionPercentage],
    );

    return (
        <>
            <Head title={`Project: ${project.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <aside className={`${isSidebarCollapsed ? 'w-0' : 'w-60'} hidden shrink-0 border-r transition-all duration-300 lg:block`}>
                        <div
                            className={`sticky top-0 flex h-screen flex-col justify-between py-8 pr-6 pl-4 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                        >
                            <div className="overflow-y-auto scrollbar-hide">
                            {/* Logo/Brand */}
                                <div className="mb-6 border-b pb-4">
                                    <a href="/" className="flex items-center text-lg font-bold text-foreground transition-opacity hover:opacity-80">
                                        Sirius
                                    </a>
                                </div>

                            <div className="mb-6">
                                <div className="mb-3">
                                    <div className="truncate text-sm font-medium text-foreground">{project.name}</div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs ${getStatusColor(project.status)}`}
                                        >
                                            {getStatusIcon(project.status)}
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Progress</span>
                                        <span>{completionPercentage}%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded bg-muted">
                                        <div className="h-full bg-foreground transition-all" style={{ width: `${completionPercentage}%` }} />
                                    </div>
                                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                                        <health.Icon className={`h-3.5 w-3.5 ${health.color}`} />
                                        <span className={`capitalize ${health.color}`}>{health.label}</span>
                                    </div>
                                </div>
                            </div>

                            <nav className="space-y-6">
                                {navGroups.map((group) => (
                                    <div key={group.label} className="space-y-2">
                                            <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                {group.label}
                                            </div>
                                        <ul className="space-y-1">
                                            {group.items.map((item) => (
                                                <li key={item.key}>
                                                    <button
                                                        onClick={item.disabled ? undefined : item.onClick}
                                                        disabled={item.disabled}
                                                        className={[
                                                            'flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors',
                                                            item.disabled
                                                                ? 'cursor-not-allowed opacity-50'
                                                                : item.active
                                                                  ? 'bg-muted font-medium text-foreground'
                                                                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                                            item.emphasize && !item.disabled ? 'font-medium text-foreground' : '',
                                                            item.key === 'brainstorming' && !item.disabled
                                                                ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                                                                : '',
                                                        ].join(' ')}
                                                        title={item.disabled ? `${item.label} (Not created yet)` : item.label}
                                                    >
                                                        <item.icon className={`h-4 w-4 shrink-0 ${item.key === 'brainstorming' && !item.disabled ? 'text-amber-600 dark:text-amber-400' : ''}`} />
                                                        <span
                                                            className={
                                                                item.muted
                                                                    ? 'opacity-70'
                                                                    : item.key === 'brainstorming' && !item.disabled
                                                                      ? 'text-amber-900 dark:text-amber-200'
                                                                      : ''
                                                            }
                                                        >
                                                            {item.label}
                                                        </span>
                                                        {item.badge && (
                                                            <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px]">
                                                                {item.badge}
                                                            </Badge>
                                                        )}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}

                                <div className="space-y-2">
                                    <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Integrations</div>
                                    <button
                                        className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                                        onClick={() => (repository ? setIsRepoManagementOpen(true) : setIsGithubModalOpen(true))}
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <GithubIcon className="h-4 w-4 shrink-0" />
                                            GitHub
                                        </span>
                                        {repository ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                                <CheckCircleIcon className="h-3.5 w-3.5" />
                                                Connected
                                            </span>
                                        ) : (
                                            <span className="text-xs">Connect</span>
                                        )}
                                    </button>
                                </div>
                            </nav>
                            </div>

                            <div className="shrink-0 border-t pt-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors hover:bg-muted">
                                            <Avatar className="h-5 w-5 shrink-0">
                                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                                <AvatarFallback className="text-[10px] bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {getInitials(auth.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-xs font-medium text-foreground">{auth.user.name}</div>
                                                <div className="truncate text-[10px] text-muted-foreground">{auth.user.email}</div>
                                            </div>
                                            <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        </aside>

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
                                    {/* Project Metrics Dashboard */}
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div className="rounded border p-4">
                                            <div className="mb-1 text-xs font-medium text-muted-foreground">Overall Progress</div>
                                            <div className="mb-2 text-2xl font-semibold text-foreground">{completionPercentage}%</div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full bg-foreground transition-all"
                                                    style={{ width: `${completionPercentage}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="rounded border p-4">
                                            <div className="mb-1 text-xs font-medium text-muted-foreground">Total Features</div>
                                            <div className="mb-2 text-2xl font-semibold text-foreground">{features.length}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {features.length > 0 ? (
                                                    <>
                                                        {features.filter((f) => f.status === 'completed').length} completed,{' '}
                                                        {features.filter((f) => f.status === 'in_progress').length} in progress
                                                    </>
                                                ) : (
                                                    'No features yet'
                                                )}
                                            </div>
                                        </div>

                                        <TeamPreview
                                            projectId={project.id}
                                            members={teamMembers}
                                            totalCount={teamMembersCount}
                                        />

                                        <div className="rounded border p-4">
                                            <div className="mb-1 text-xs font-medium text-muted-foreground">GitHub Integration</div>
                                            <div className="mb-2 flex items-center gap-2">
                                                {repository ? (
                                                    <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                                                        <CheckCircleIcon className="h-4 w-4" />
                                                        Connected
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">Not connected</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => (repository ? setIsRepoManagementOpen(true) : setIsGithubModalOpen(true))}
                                                className="text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                {repository ? 'Manage' : 'Connect'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Next Steps Section */}
                                    {getNextSteps().length > 0 && (
                                    <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                                <ArrowRightIcon className="h-5 w-5 text-foreground" />
                                                <h2 className="text-lg font-semibold text-foreground">Next Steps</h2>
                                    </div>
                                            <div className="grid gap-4 md:grid-cols-3">
                                                {getNextSteps().map((step, index) => (
                                                    <div
                                                        key={index}
                                                        className="group cursor-pointer rounded border p-4 transition-colors hover:bg-muted/40"
                                                        onClick={step.isLoading ? undefined : step.action}
                                                    >
                                                        <div className="mb-3 flex items-center gap-3">
                                                            <div
                                                                className={`flex h-10 w-10 items-center justify-center rounded ${
                                                                    step.priority === 'critical' 
                                                                        ? 'bg-red-100 dark:bg-red-500/10' 
                                                                        : step.priority === 'high' 
                                                                        ? 'bg-orange-100 dark:bg-orange-500/10' 
                                                                        : 'bg-muted'
                                                                }`}
                                                            >
                                                                {step.isLoading ? (
                                                                    <svg
                                                                        className="h-5 w-5 animate-spin text-red-600 dark:text-red-400"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <circle
                                                                            className="opacity-25"
                                                                            cx="12"
                                                                            cy="12"
                                                                            r="10"
                                                                            stroke="currentColor"
                                                                            strokeWidth="4"
                                                                        ></circle>
                                                                        <path
                                                                            className="opacity-75"
                                                                            fill="currentColor"
                                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                        ></path>
                                                                    </svg>
                                                                ) : (
                                                                <step.icon
                                                                    className={`h-5 w-5 ${
                                                                        step.priority === 'critical'
                                                                            ? 'text-red-600 dark:text-red-400'
                                                                            : step.priority === 'high' 
                                                                            ? 'text-orange-600 dark:text-orange-400' 
                                                                            : 'text-foreground'
                                                                    }`}
                                                                />
                                                                )}
                                </div>
                                                            {step.priority === 'critical' && (
                                                                <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                                                                    Required
                                                                </span>
                                                            )}
                                                            {step.priority === 'high' && (
                                                                <span className="rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400">
                                                                    Priority
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="mb-1 text-sm font-semibold text-foreground">
                                                            {step.isLoading ? 'Loading...' : step.title}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground">{step.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Completion Breakdown */}
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-semibold text-foreground">Project Completion</h2>
                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {getCompletionBreakdown().map((item, index) => (
                                                <div
                                                    key={index}
                                                    className={`rounded border p-4 ${
                                                        item.disabled 
                                                            ? 'cursor-not-allowed opacity-50' 
                                                            : (item.href || item.action) 
                                                            ? 'cursor-pointer transition-colors hover:bg-muted/40' 
                                                            : ''
                                                    }`}
                                                    onClick={() => {
                                                        if (item.disabled) return;
                                                        
                                                        if (item.href) {
                                                            router.get(item.href);
                                                        } else if (item.action === 'view' && item.name === 'Project Brief') {
                                                            setIsBriefModalOpen(true);
                                                        } else if (item.action === 'generate') {
                                                            if (item.name === 'PRD') {
                                                                router.post(`/projects/${project.id}/prd/generate`);
                                                            } else if (item.name === 'System Architecture') {
                                                                router.post(`/projects/${project.id}/c4/generate`);
                                                            }
                                                        } else if (item.action === 'create' && item.name === 'Features') {
                                                            setIsCreatingFeatures(true);
                                                            router.get(`/features/create/${project.id}`, {}, {
                                                                onFinish: () => setIsCreatingFeatures(false)
                                                            });
                                                        }
                                                    }}
                                                    title={item.disabled ? `Complete previous steps first` : undefined}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`flex h-8 w-8 items-center justify-center rounded ${
                                                                    item.completed ? 'bg-emerald-100 dark:bg-emerald-500/10' : 'bg-muted'
                                                                }`}
                                                            >
                                                                {item.completed ? (
                                                                    <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                                ) : (
                                                                    <item.icon
                                                                        className={`h-4 w-4 ${item.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-foreground">{item.name}</div>
                                                                {item.count !== undefined && (
                                                                    <div className="text-xs text-muted-foreground">{item.count} items</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {item.href || item.action ? (
                                                            <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                                                        ) : null}
                                                    </div>
                                                    {!item.completed && (item.href || item.action) && (
                                                        <div className="mt-3">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-xs"
                                                                disabled={item.disabled}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (item.disabled) return;
                                                                    
                                                                    if (item.href) {
                                                                        router.get(item.href);
                                                                    } else if (item.action === 'view' && item.name === 'Project Brief') {
                                                                        setIsBriefModalOpen(true);
                                                                    } else if (item.action === 'generate') {
                                                                        if (item.name === 'PRD') {
                                                                            router.post(`/projects/${project.id}/prd/generate`);
                                                                        } else if (item.name === 'System Architecture') {
                                                                            router.post(`/projects/${project.id}/c4/generate`);
                                                                        }
                                                                    } else if (item.action === 'create' && item.name === 'Features') {
                                                                        setIsCreatingFeatures(true);
                                                                        router.get(`/features/create/${project.id}`, {}, {
                                                                            onFinish: () => setIsCreatingFeatures(false)
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                {item.action === 'generate' ? 'Generate' : item.action === 'create' ? 'Create' : 'Open'}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Charts Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold text-foreground">Project Analytics</h2>
                                            {features.length > 0 && (
                                                <Button size="sm" variant="outline" onClick={() => setActiveSection('features')}>
                                                    View All Features
                                                </Button>
                                            )}
                                        </div>

                                        {features.length > 0 ? (
                                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                                {/* Feature Status Chart */}
                                        <div className="rounded border p-4">
                                                    <div className="mb-4">
                                                        <h3 className="text-sm font-semibold text-foreground">Feature Status</h3>
                                                        <p className="text-xs text-muted-foreground">Distribution by status</p>
                                                    </div>
                                                    <ChartContainer config={statusChartConfig} className="h-[200px] w-full">
                                                        <PieChart>
                                                            <ChartTooltip content={<ChartTooltipContent nameKey="statusKey" />} />
                                                            <Pie
                                                                data={getFeatureStatusData}
                                                                dataKey="value"
                                                                nameKey="statusKey"
                                                                cx="50%"
                                                                cy="50%"
                                                                outerRadius={70}
                                                                label={({ value }) => value}
                                                                labelLine={false}
                                                            >
                                                                {getFeatureStatusData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Pie>
                                                        </PieChart>
                                                    </ChartContainer>
                                                </div>

                                                {/* Feature Priority Chart */}
                                                <div className="rounded border p-4">
                                                    <div className="mb-4">
                                                        <h3 className="text-sm font-semibold text-foreground">Feature Priority</h3>
                                                        <p className="text-xs text-muted-foreground">Distribution by priority</p>
                                                    </div>
                                                    <ChartContainer config={priorityChartConfig} className="h-[200px] w-full">
                                                        <BarChart data={getFeaturePriorityData}>
                                                            <ChartTooltip content={<ChartTooltipContent nameKey="priorityKey" />} />
                                                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                                            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                                {getFeaturePriorityData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ChartContainer>
                                                </div>

                                                {/* Completion Progress Chart */}
                                                <div className="rounded border p-4">
                                                    <div className="mb-4">
                                                        <h3 className="text-sm font-semibold text-foreground">Project Completion</h3>
                                                        <p className="text-xs text-muted-foreground">{completionPercentage}% complete</p>
                                                    </div>
                                                    <div className="relative h-[200px] w-full">
                                                        <ChartContainer config={completionChartConfig} className="h-full w-full">
                                                            <RadialBarChart
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius="70%"
                                                                outerRadius="90%"
                                                                data={completionChartData}
                                                                startAngle={90}
                                                                endAngle={-270}
                                                            >
                                                                <RadialBar dataKey="value" cornerRadius={4} fill="var(--color-completion)" background={{ fill: 'hsl(var(--muted))' }} />
                                                            </RadialBarChart>
                                                        </ChartContainer>
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <div className="text-center">
                                                                <div className="text-3xl font-bold text-foreground">{completionPercentage}%</div>
                                                                <div className="text-xs text-muted-foreground mt-1">Complete</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                </div>
                                            ) : (
                                            <div className="rounded border p-12 text-center">
                                                <ZapIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                                <h3 className="text-sm font-semibold text-foreground mb-2">No Features Yet</h3>
                                                <p className="text-xs text-muted-foreground mb-4">
                                                    Create features to see analytics and insights about your project.
                                                </p>
                                                {sections.prd && (
                                                    <Button size="sm" onClick={() => setIsCreateFeatureModalOpen(true)}>
                                                        Create Feature
                                                    </Button>
                                            )}
                                        </div>
                                        )}
                                    </div>

                                    {/* Quick Access */}
                                    <div className="space-y-4">
                                            <h2 className="text-lg font-semibold text-foreground">Quick Access</h2>
                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                            {/* Brainstorming - Always shown */}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="justify-start bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/20"
                                                onClick={() => router.get(`/projects/${project.id}/brainstorming`)}
                                            >
                                                <LightbulbIcon className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                <span className="text-amber-900 dark:text-amber-200">Brainstorming</span>
                                            </Button>
                                            
                                            {/* PRD - Only show if exists */}
                                            {sections.prd && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="justify-start"
                                                    onClick={() => router.get(`/projects/${project.id}/prd`)}
                                                >
                                                    <FileIcon className="mr-2 h-4 w-4" />
                                                    Open PRD
                                                </Button>
                                            )}
                                            
                                            {/* Database Designer - Only show if exists */}
                                            {sections.data_modeling && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="justify-start"
                                                    onClick={() => router.get(`/projects/${project.id}/erd`)}
                                                >
                                                    <DatabaseIcon className="mr-2 h-4 w-4" />
                                                    Database Designer
                                                </Button>
                                            )}
                                            
                                            {/* C4 Diagram - Only show if exists */}
                                            {project.c4 && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="justify-start"
                                                    onClick={() => router.get(`/projects/${project.id}/c4`)}
                                                >
                                                    <LayersIcon className="mr-2 h-4 w-4" />
                                                    C4 Diagram
                                                </Button>
                                            )}
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
                                                    onClick={() => sections.prd && router.visit(`/features/${f.id}`)}
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

                <RepoConnectDialog open={isGithubModalOpen} onOpenChange={setIsGithubModalOpen} projectId={project.id} />

                <RepoManagementModal
                    open={isRepoManagementOpen}
                    onOpenChange={setIsRepoManagementOpen}
                    repository={repository}
                    projectId={project.id}
                />

                <CreateFeatureModal open={isCreateFeatureModalOpen} onOpenChange={setIsCreateFeatureModalOpen} projectId={project.id} />
            </div>
        </>
    );
}
