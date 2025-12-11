import AppLogo from '@/components/app-logo';
import { RepoConnectDialog } from '@/components/github/repo-connect-dialog';
import { RepoManagementModal } from '@/components/github/repo-management-modal';
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
    FileIcon,
    GithubIcon,
    LayoutDashboard,
    LightbulbIcon,
    UsersIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface Project {
    id: number;
    name: string;
}

interface FeatureItem {
    id: number;
    name: string;
    summary: string | null;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'draft' | 'in_progress' | 'completed' | 'archived';
    order_of_implementation: number;
    progress?: number | null;
    description?: string | null;
    acceptance_criteria?: string | null;
    user_flows?: string | null;
    metrics?: string | null;
    erd?: string | null;
    sequence_diagram?: string | null;
    wireframe?: string | null;
}

interface Props {
    project: Project;
    feature: FeatureItem;
    activeSection?: 'dashboard' | 'overview' | 'erd' | 'sequence' | 'wireframe' | 'specs' | 'brainstorming' | 'team' | 'integrations' | 'github';
    auth: { user: User };
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
}

export default function FeatureSidebar({ project, feature, activeSection, auth, isSidebarCollapsed = false }: Props) {
    const { repository } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
    const [isRepoManagementOpen, setIsRepoManagementOpen] = useState(false);
    const calculateProgress = useMemo(() => {
        const artifacts = [
            !!(feature.description && feature.acceptance_criteria), // Overview
            !!feature.erd, // ERD
            !!feature.sequence_diagram, // Sequence
            !!feature.user_flows, // User flows (shown in overview)
            !!feature.wireframe, // Wireframe
        ];
        const completed = artifacts.filter(Boolean).length;
        return Math.round((completed / 5) * 100);
    }, [feature]);

    const health = useMemo(() => {
        if (calculateProgress >= 80) return { label: 'excellent', Icon: CheckCircleIcon, color: 'text-emerald-600 dark:text-emerald-300' };
        if (calculateProgress >= 60) return { label: 'good', Icon: CheckCircleIcon, color: 'text-blue-600 dark:text-blue-300' };
        if (calculateProgress >= 40) return { label: 'fair', Icon: AlertCircleIcon, color: 'text-orange-600 dark:text-orange-300' };
        return { label: 'needs attention', Icon: AlertCircleIcon, color: 'text-red-600 dark:text-red-300' };
    }, [calculateProgress]);

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
                    onClick: () => router.visit(`/features/${feature.id}`),
                },
                {
                    key: 'specs',
                    icon: FileIcon,
                    label: 'Specs',
                    active: activeSection === 'specs',
                    disabled: false,
                    onClick: () => router.visit(`/features/${feature.id}/specs`),
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
                <div className="overflow-y-auto scrollbar-hide">
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
                                <span>{calculateProgress}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded bg-muted">
                                <div className="h-full bg-foreground transition-all" style={{ width: `${calculateProgress}%` }} />
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
                                                          ? 'bg-muted font-medium text-foreground'
                                                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
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
            <RepoConnectDialog open={isGithubModalOpen} onOpenChange={setIsGithubModalOpen} projectId={project.id} projectName={project.name} />
            <RepoManagementModal open={isRepoManagementOpen} onOpenChange={setIsRepoManagementOpen} repository={repository} projectId={project.id} />
        </>
    );
}
