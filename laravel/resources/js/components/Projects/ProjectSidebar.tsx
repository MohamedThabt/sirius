import { RepoConnectDialog } from '@/components/github/repo-connect-dialog';
import { RepoManagementModal } from '@/components/github/repo-management-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type SharedData, type User } from '@/types';
import { usePage } from '@inertiajs/react';
import { AlertCircleIcon, CheckCircleIcon, ChevronDownIcon, ChevronLeftIcon, CircleIcon, ClockIcon, Github as GithubIcon, Search, SquarePen, TrendingUpIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Project {
    id: number;
    name: string;
    status: string;
    c4?: string | null;
    brief?: string;
}

interface NavItem {
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

interface NavGroup {
    label: string;
    items: NavItem[];
}

interface ProjectSidebarProps {
    project: Project;
    navGroups: NavGroup[];
    completionPercentage?: number;
    health?: {
        label: string;
        Icon: React.ComponentType<{ className?: string }>;
        color: string;
    };
    isCollapsed: boolean;
    user: User;
}

export default function ProjectSidebar({
    project,
    navGroups,
    completionPercentage,
    health,
    isCollapsed,
    user,
}: ProjectSidebarProps) {
    const { repository } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
    const [isRepoManagementOpen, setIsRepoManagementOpen] = useState(false);

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
            <aside className={`${isCollapsed ? 'w-0' : 'w-60'} hidden shrink-0 border-r border-border/30 transition-all duration-300 lg:block`}>
                <div
                    className={`sticky top-0 flex h-screen flex-col justify-between py-4 px-3 ${isCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                >
                    <div className="scrollbar-hide overflow-y-auto">
                        {/* Linear-style Header */}
                        <div className="mb-4 pb-3 border-b border-border/30">
                            <div className="flex items-center justify-between">
                                {/* Back + Project Selector */}
                                <div className="flex items-center gap-1">
                                    <a 
                                        href="/projects" 
                                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                    </a>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted/50 transition-colors">
                                                <div className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-medium ${getStatusColor(project.status).replace('border', 'border-0')}`}>
                                                    {project.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                                                    {project.name}
                                                </span>
                                                <ChevronDownIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-56">
                                            <UserMenuContent user={user} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                
                                {/* Action Icons */}
                                <div className="flex items-center gap-0.5">
                                    <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                                        <Search className="h-4 w-4" />
                                    </button>
                                    <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                                        <SquarePen className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Status Badge */}
                            <div className="mt-3 flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusColor(project.status)}`}
                                >
                                    {getStatusIcon(project.status)}
                                    <span className="capitalize">{project.status.replace('_', ' ')}</span>
                                </span>
                                {completionPercentage !== undefined && (
                                    <span className="text-[10px] text-muted-foreground">
                                        {completionPercentage}% complete
                                    </span>
                                )}
                            </div>
                            
                            {/* Progress Bar */}
                            {completionPercentage !== undefined && (
                                <div className="mt-2">
                                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted/50">
                                        <div 
                                            className="h-full bg-foreground/70 transition-all duration-500 ease-out rounded-full" 
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
                                                                  ? 'bg-muted font-medium text-foreground'
                                                                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                                            item.emphasize && !item.disabled ? 'font-medium text-foreground' : '',
                                                            item.key === 'brainstorming' && !item.disabled
                                                                ? 'border border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:hover:bg-amber-500/20'
                                                                : '',
                                                        ].join(' ')}
                                                        title={item.disabled ? `${item.label} (Not created yet)` : item.label}
                                                    >
                                                        <item.icon
                                                            className={`h-4 w-4 shrink-0 ${item.key === 'brainstorming' && !item.disabled ? 'text-amber-600 dark:text-amber-400' : ''}`}
                                                        />
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
                                
                                {/* Community Link */}
                                <a
                                    href="https://t.me/sirius_ai_community"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative flex items-center justify-between overflow-hidden rounded-lg px-2.5 py-2 text-sm transition-all duration-300 hover:scale-[1.01] bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:via-blue-500/20 hover:to-purple-500/20 border border-cyan-500/20 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] mx-0.5"
                                >
                                    {/* Animated shine effect */}
                                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                    
                                    <span className="relative inline-flex items-center gap-2">
                                        <span className="relative">
                                            <svg className="h-4 w-4 shrink-0 text-cyan-500" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                            </svg>
                                            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full bg-cyan-400/60" />
                                            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cyan-400" />
                                        </span>
                                        <span className="font-medium text-foreground">Community</span>
                                    </span>
                                    <span className="relative flex items-center gap-1 text-xs font-semibold text-cyan-500 group-hover:text-cyan-400">
                                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z"/>
                                        </svg>
                                        Join
                                    </span>
                                </a>
                            </div>
                        </nav>
                    </div>

                    <div className="shrink-0 border-t pt-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors hover:bg-muted">
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
            </aside>

            <RepoConnectDialog open={isGithubModalOpen} onOpenChange={setIsGithubModalOpen} projectId={project.id} />

            <RepoManagementModal open={isRepoManagementOpen} onOpenChange={setIsRepoManagementOpen} repository={repository ?? null} projectId={project.id} />
        </>
    );
}
