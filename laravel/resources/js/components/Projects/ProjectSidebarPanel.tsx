import { GithubRepoLink } from '@/components/github-repo-link';
import { SidebarUsageBar } from '@/components/sidebar-usage-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { AlertCircleIcon, CheckCircleIcon, ChevronDownIcon, ChevronLeftIcon, CircleIcon, ClockIcon, TrendingUpIcon } from 'lucide-react';
import { useMemo } from 'react';

export interface ProjectSidebarProject {
    id: number;
    name: string;
    status: string;
    c4?: string | null;
    brief?: string;
}

export interface ProjectNavItem {
    key: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    muted?: boolean;
    emphasize?: boolean;
    active?: boolean;
    badge?: string;
    disabled?: boolean;
    hidden?: boolean;
    onClick: () => void;
}

export interface ProjectNavGroup {
    label: string;
    items: ProjectNavItem[];
}

export interface ProjectSidebarPanelProps {
    project: ProjectSidebarProject;
    navGroups: ProjectNavGroup[];
    completionPercentage?: number;
    health?: {
        label: string;
        Icon: React.ComponentType<{ className?: string }>;
        color: string;
    };
    isCollapsed: boolean;
    user: User;
    isMobileSheet?: boolean;
}

export default function ProjectSidebarPanel({
    project,
    navGroups,
    completionPercentage,
    health,
    isCollapsed,
    user,
    isMobileSheet = false,
}: ProjectSidebarPanelProps) {
    const getInitials = useInitials();

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

    const defaultHealth = useMemo(() => {
        if (completionPercentage === undefined) return undefined;
        if (completionPercentage >= 80) return { label: 'excellent', Icon: CheckCircleIcon, color: 'text-emerald-600 dark:text-emerald-300' };
        if (completionPercentage >= 60) return { label: 'good', Icon: TrendingUpIcon, color: 'text-blue-600 dark:text-blue-300' };
        if (completionPercentage >= 40) return { label: 'fair', Icon: AlertCircleIcon, color: 'text-orange-600 dark:text-orange-300' };
        return { label: 'needs attention', Icon: AlertCircleIcon, color: 'text-red-600 dark:text-red-300' };
    }, [completionPercentage]);

    const activeHealth = health || defaultHealth;

    return (
        <>
            <aside
                className={`${isMobileSheet ? 'w-full' : isCollapsed ? 'w-0' : 'hidden w-60 shrink-0 border-r border-sidebar-border lg:block'} bg-sidebar transition-all duration-300`}
            >
                <div
                    className={`${isMobileSheet ? 'flex' : 'sticky'} top-0 flex h-screen flex-col justify-between px-3 py-4 ${isCollapsed && !isMobileSheet ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                >
                    <div className="scrollbar-hide overflow-x-hidden overflow-y-auto">
                        {/* Linear-style Header */}
                        <div className="mb-4 border-b border-sidebar-border pb-3">
                            <div className="flex items-center justify-between">
                                {/* Back + Project Name */}
                                <div className="flex items-center gap-1">
                                    <a
                                        href="/projects"
                                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-foreground"
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                    </a>
                                    <div className="flex items-center gap-2 px-1.5 py-1">
                                        <div
                                            className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-medium ${getStatusColor(project.status).replace('border', 'border-0')}`}
                                        >
                                            {project.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <span className="max-w-[140px] truncate text-sm font-medium text-foreground">{project.name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badge + Progress */}
                            <div className="mt-3 flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusColor(project.status)}`}
                                >
                                    {getStatusIcon(project.status)}
                                    <span className="capitalize">{project.status.replace('_', ' ')}</span>
                                </span>
                                {completionPercentage !== undefined && (
                                    <span className="text-[10px] text-muted-foreground">{completionPercentage}% complete</span>
                                )}
                            </div>

                            {/* Progress Bar */}
                            {completionPercentage !== undefined && (
                                <div className="mt-2">
                                    <div className="h-1 w-full overflow-hidden rounded-full bg-sidebar-accent">
                                        <div
                                            className="h-full rounded-full bg-foreground/70 transition-all duration-500 ease-out"
                                            style={{ width: `${completionPercentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <nav className="space-y-6">
                            {navGroups.map((group) => (
                                <div key={group.label} className="space-y-2">
                                    <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{group.label}</div>
                                    <ul className="space-y-1">
                                        {group.items
                                            .filter((item) => !item.hidden)
                                            .map((item) => (
                                                <li key={item.key}>
                                                    <button
                                                        onClick={item.disabled ? undefined : item.onClick}
                                                        disabled={item.disabled}
                                                        className={[
                                                            'flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors',
                                                            item.disabled
                                                                ? 'cursor-not-allowed opacity-50'
                                                                : item.active
                                                                  ? 'cursor-pointer bg-sidebar-accent font-medium text-foreground'
                                                                  : 'cursor-pointer text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground',
                                                            item.emphasize && !item.disabled ? 'font-medium text-foreground' : '',
                                                        ].join(' ')}
                                                        title={item.disabled ? `${item.label} (Not created yet)` : item.label}
                                                    >
                                                        <item.icon
                                                            className={`h-4 w-4 shrink-0 ${item.key === 'brainstorming' && !item.disabled ? 'text-amber-600 dark:text-amber-400' : ''}`}
                                                        />
                                                        <span className={item.muted ? 'opacity-70' : ''}>{item.label}</span>
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
                        </nav>
                    </div>

                    <div className="shrink-0 space-y-3">
                        {/* Source code */}
                        <div className="border-t pt-3">
                            <GithubRepoLink />
                        </div>

                        {/* Usage Bar */}
                        <div className="border-t pt-3">
                            <SidebarUsageBar />
                        </div>

                        {/* User Menu */}
                        <div className="border-t pt-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent">
                                        <Avatar className="h-5 w-5 shrink-0">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback className="bg-neutral-200 text-[10px] text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-xs font-medium text-foreground">{user.name}</div>
                                            <div className="truncate text-[10px] text-muted-foreground">{user.email}</div>
                                        </div>
                                        <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <UserMenuContent user={user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
