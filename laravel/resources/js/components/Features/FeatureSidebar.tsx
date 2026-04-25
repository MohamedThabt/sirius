import { RepoConnectDialog } from '@/components/github/repo-connect-dialog';
import { RepoManagementModal } from '@/components/github/repo-management-modal';
import { SidebarUsageBar } from '@/components/sidebar-usage-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type SharedData, type User } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    DatabaseIcon,
    FileIcon,
    GithubIcon,
    LayoutDashboard,
    LayoutIcon,
    LightbulbIcon,
    UsersIcon,
    WorkflowIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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
    status: 'draft' | 'todo' | 'in_progress' | 'review' | 'done';
    order_of_implementation: number;
    progress?: number | null;
    description?: string | null;
    acceptance_criteria?: string | null;
    user_flows?: string | null;
    metrics?: string | null;
    erd?: string | null;
    sequence_diagram?: string | null;
    wireframe?: string | null;
    module?: Module;
}

interface Props {
    project: Project;
    module?: Module;
    feature: FeatureItem;
    activeSection?: 'dashboard' | 'overview' | 'erd' | 'sequence' | 'wireframe' | 'specs' | 'brainstorming' | 'team' | 'integrations' | 'github';
    auth: { user: User };
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
}

export default function FeatureSidebar({ project, module, feature, activeSection, auth, isSidebarCollapsed = false }: Props) {
    const { repository } = usePage<SharedData>().props;
    // Get module from props or from feature.module
    const currentModule = module || feature.module;
    const getInitials = useInitials();
    const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
    const [isRepoManagementOpen, setIsRepoManagementOpen] = useState(false);

    // Use backend-computed progress (considers all 8 artifact fields)
    const featureProgress = feature.progress ?? 0;

    const health = useMemo(() => {
        if (featureProgress >= 80) return { label: 'excellent', Icon: CheckCircleIcon, color: 'text-emerald-600 dark:text-emerald-300' };
        if (featureProgress >= 60) return { label: 'good', Icon: CheckCircleIcon, color: 'text-blue-600 dark:text-blue-300' };
        if (featureProgress >= 40) return { label: 'fair', Icon: AlertCircleIcon, color: 'text-orange-600 dark:text-orange-300' };
        return { label: 'needs attention', Icon: AlertCircleIcon, color: 'text-red-600 dark:text-red-300' };
    }, [featureProgress]);

    interface NavItem {
        key: string;
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        muted?: boolean;
        emphasize?: boolean;
        active?: boolean;
        disabled?: boolean;
        onClick: () => void;
    }

    interface NavGroup {
        label: string;
        items: NavItem[];
    }

    // Build feature base URL based on whether module is available
    const featureBaseUrl = currentModule ? `/projects/${project.id}/modules/${currentModule.id}/features/${feature.id}` : `/features/${feature.id}`;

    const navGroups: NavGroup[] = [
        {
            label: 'Feature',
            items: [
                {
                    key: 'overview',
                    icon: LayoutDashboard,
                    label: 'Feature',
                    active: activeSection === 'overview',
                    disabled: false,
                    onClick: () => router.visit(featureBaseUrl),
                },
                {
                    key: 'specs',
                    icon: FileIcon,
                    label: 'Specs',
                    active: activeSection === 'specs',
                    disabled: false,
                    onClick: () => router.visit(`${featureBaseUrl}/specs`),
                },
                {
                    key: 'erd',
                    icon: DatabaseIcon,
                    label: 'Database Schema',
                    active: activeSection === 'erd',
                    disabled: false,
                    onClick: () => router.visit(`/features/${feature.id}/datamodel`),
                },
                {
                    key: 'sequence',
                    icon: WorkflowIcon,
                    label: 'Sequence Diagram',
                    active: activeSection === 'sequence',
                    disabled: false,
                    onClick: () => router.visit(`/features/${feature.id}/sequence-diagram`),
                },
                {
                    key: 'wireframe',
                    icon: LayoutIcon,
                    label: 'Wireframe',
                    active: activeSection === 'wireframe',
                    disabled: false,
                    onClick: () => router.visit(`/features/${feature.id}/wireframe`),
                },
            ],
        },
        {
            label: 'Project Tools',
            items: [
                {
                    key: 'brainstorming',
                    icon: LightbulbIcon,
                    label: 'Brainstorming',
                    active: activeSection === 'brainstorming',
                    disabled: false,
                    onClick: () => router.visit(`/projects/${project.id}/brainstorming`),
                },
                {
                    key: 'team',
                    icon: UsersIcon,
                    label: 'Team',
                    active: activeSection === 'team',
                    disabled: false,
                    onClick: () => router.visit(`/projects/${project.id}/team`),
                },
            ],
        },
    ];

    return (
        <>
            <aside className={`${isSidebarCollapsed ? 'w-0' : 'w-60'} hidden shrink-0 border-r transition-all duration-300 lg:block`}>
                <div
                    className={`sticky top-0 flex h-screen flex-col justify-between py-8 pr-6 pl-4 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                >
                    <div className="scrollbar-hide overflow-x-hidden overflow-y-auto">
                        {/* Logo/Brand */}
                        <div className="mb-6 border-b pb-4">
                            <a href="/" className="flex items-center text-lg font-bold text-foreground transition-opacity hover:opacity-80">
                                Sirius
                            </a>
                        </div>

                        <div className="mb-6">
                            <div className="mb-3">
                                <div className="truncate text-sm font-medium text-foreground">{feature.name}</div>
                            </div>

                            <div className="mt-4">
                                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Progress</span>
                                    <span>{featureProgress}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded bg-muted">
                                    <div className="h-full bg-foreground transition-all" style={{ width: `${featureProgress}%` }} />
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
                                    <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{group.label}</div>
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
                                                              ? 'cursor-pointer bg-muted font-medium text-foreground'
                                                              : 'cursor-pointer text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                                        item.emphasize && !item.disabled ? 'font-medium text-foreground' : '',
                                                    ].join(' ')}
                                                    title={item.disabled ? `${item.label} (Not created yet)` : item.label}
                                                >
                                                    <item.icon className="h-4 w-4 shrink-0" />
                                                    <span className={item.muted ? 'opacity-70' : ''}>{item.label}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            <div className="space-y-2">
                                <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Integrations</div>
                                <button
                                    className="flex w-full cursor-pointer items-center justify-between rounded px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
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

                                {/* Community Link */}
                                <a
                                    href="https://t.me/sirius_ai_community"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative mx-0.5 flex items-center justify-between overflow-hidden rounded-lg border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 px-2.5 py-2 text-sm transition-all duration-300 hover:scale-[1.01] hover:border-cyan-400/40 hover:from-cyan-500/20 hover:via-blue-500/20 hover:to-purple-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                                >
                                    {/* Animated shine effect */}
                                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                                    <span className="relative inline-flex items-center gap-2">
                                        <span className="relative">
                                            <svg className="h-4 w-4 shrink-0 text-cyan-500" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                            </svg>
                                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 animate-ping rounded-full bg-cyan-400/60" />
                                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-400" />
                                        </span>
                                        <span className="font-medium text-foreground">Community</span>
                                    </span>
                                    <span className="relative flex items-center gap-1 text-xs font-semibold text-cyan-500 group-hover:text-cyan-400">
                                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
                                        </svg>
                                        Join
                                    </span>
                                </a>
                            </div>
                        </nav>
                    </div>

                    <div className="shrink-0 space-y-3">
                        {/* Usage Bar */}
                        <div className="border-t pt-3">
                            <SidebarUsageBar />
                        </div>

                        {/* User Menu */}
                        <div className="border-t pt-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors hover:bg-muted">
                                        <Avatar className="h-5 w-5 shrink-0">
                                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                            <AvatarFallback className="bg-neutral-200 text-[10px] text-black dark:bg-neutral-700 dark:text-white">
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
                </div>
            </aside>
            <RepoConnectDialog open={isGithubModalOpen} onOpenChange={setIsGithubModalOpen} projectId={project.id} projectName={project.name} />
            <RepoManagementModal
                open={isRepoManagementOpen}
                onOpenChange={setIsRepoManagementOpen}
                repository={repository ?? null}
                projectId={project.id}
            />
        </>
    );
}
