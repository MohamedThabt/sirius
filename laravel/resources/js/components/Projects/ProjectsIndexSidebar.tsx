import AppLogo from '@/components/app-logo';
import { SidebarUsageBar } from '@/components/sidebar-usage-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { router } from '@inertiajs/react';
import {
    ArrowRightIcon,
    ChevronDownIcon,
    FolderIcon,
    PlusIcon,
    Mail,
    SparklesIcon,
} from 'lucide-react';

interface ProjectItem {
    id: number;
    name: string;
    status?: string;
}

interface Props {
    auth: { user: User };
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
    onCreateProject: () => void;
    projectCount: number;
    invitationsCount?: number;
    projects?: ProjectItem[];
    currentProjectId?: number;
    currentPage?: 'projects' | 'invitations' | 'upgrade';
}

export default function ProjectsIndexSidebar({ 
    auth, 
    isSidebarCollapsed = false, 
    onCreateProject, 
    projectCount, 
    invitationsCount = 0,
    projects = [], 
    currentProjectId,
    currentPage = 'projects',
}: Props) {
    const getInitials = useInitials();
    const showProUpgrade = auth.user.plan?.slug !== 'pro';

    interface NavItem {
        key: string;
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        active?: boolean;
        badge?: string;
        onClick: () => void;
    }

    interface NavGroup {
        label: string;
        items: NavItem[];
    }

    const navGroups: NavGroup[] = [
        {
            label: 'Overview',
            items: [
                {
                    key: 'all-projects',
                    icon: FolderIcon,
                    label: 'All Projects',
                    active: currentPage === 'projects',
                    badge: projectCount.toString(),
                    onClick: () => router.visit('/projects'),
                },
                {
                    key: 'invitations',
                    icon: Mail,
                    label: 'Invitations',
                    active: currentPage === 'invitations',
                    badge: invitationsCount > 0 ? invitationsCount.toString() : undefined,
                    onClick: () => router.visit('/projects/invitations'),
                },
                {
                    key: 'create',
                    icon: PlusIcon,
                    label: 'Create Project',
                    onClick: onCreateProject,
                },
            ],
        },
    ];

    return (
        <aside className={`${isSidebarCollapsed ? 'w-0' : 'w-64'} hidden shrink-0 border-r border-border/50 transition-all duration-300 lg:block bg-gradient-to-b from-background to-muted/10`}>
            <div
                className={`sticky top-0 flex h-screen flex-col justify-between py-8 pr-6 pl-4 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            >
                <div className="overflow-x-hidden overflow-y-auto scrollbar-hide">
                    {/* Header with App Logo */}
                    <div className="mb-6 pb-4 border-b border-border/30">
                        <div className="flex items-center justify-center">
                            <AppLogo />
                        </div>
                    </div>

                    <nav className="space-y-6">
                        {navGroups.map((group) => (
                            <div key={group.label} className="space-y-2">
                                <div className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.label}</div>
                                <ul className="space-y-1.5">
                                    {group.label === 'Overview' ? (
                                        <>
                                            {group.items.slice(0, 2).map((item) => (
                                                <li key={item.key}>
                                                    <button
                                                        type="button"
                                                        onClick={item.onClick}
                                                        className={[
                                                            'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 cursor-pointer',
                                                            item.active
                                                                ? 'bg-gradient-to-r from-primary/15 to-primary/5 font-semibold text-foreground shadow-sm border border-primary/20'
                                                                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:translate-x-0.5',
                                                        ].join(' ')}
                                                        title={item.label}
                                                    >
                                                        <item.icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-primary' : ''}`} />
                                                        <span className="flex-1 text-left">{item.label}</span>
                                                        {item.badge && (
                                                            <span
                                                                className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                                    item.active
                                                                        ? 'bg-primary/20 text-primary'
                                                                        : 'bg-muted-foreground/20 text-muted-foreground'
                                                                }`}
                                                            >
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </button>
                                                </li>
                                            ))}
                                            {showProUpgrade && (
                                                <li>
                                                    <button
                                                        type="button"
                                                        onClick={() => router.visit('/upgrade/pro')}
                                                        title="Upgrade to Pro"
                                                        className={[
                                                            'group relative w-full overflow-hidden rounded-xl border text-left transition-all duration-300',
                                                            'p-0.5',
                                                            currentPage === 'upgrade'
                                                                ? 'border-primary/60 shadow-[0_0_24px_-4px_hsl(var(--primary))] ring-1 ring-primary/30'
                                                                : 'border-amber-500/25 shadow-md shadow-amber-500/5 hover:border-amber-400/45 hover:shadow-lg hover:shadow-amber-500/10',
                                                        ].join(' ')}
                                                    >
                                                        <div
                                                            className={[
                                                                'relative rounded-[0.65rem] px-3 py-2.5',
                                                                'bg-gradient-to-br from-violet-500/15 via-amber-500/12 to-rose-500/15',
                                                                'before:pointer-events-none before:absolute before:inset-0 before:rounded-[0.65rem] before:bg-[linear-gradient(120deg,transparent_40%,hsl(var(--primary)/0.12)_50%,transparent_60%)]',
                                                                'before:translate-x-[-100%] before:transition-transform before:duration-700',
                                                                'group-hover:before:translate-x-[100%]',
                                                            ].join(' ')}
                                                        >
                                                            <div className="relative flex items-start gap-2.5">
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400/25 to-violet-500/30 shadow-inner">
                                                                    <SparklesIcon className="h-4 w-4 text-amber-200" />
                                                                </div>
                                                                <div className="min-w-0 flex-1 pt-0.5">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90">
                                                                            Pro
                                                                        </span>
                                                                        <span
                                                                            aria-hidden
                                                                            className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40"
                                                                        />
                                                                        <span className="text-xs font-semibold text-foreground">Go Pro</span>
                                                                    </div>
                                                                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                                                                        2k AI credits · InstaPay
                                                                    </p>
                                                                </div>
                                                                <ArrowRightIcon
                                                                    className={[
                                                                        'h-3.5 w-3.5 shrink-0 text-amber-400/80 transition-transform',
                                                                        'group-hover:translate-x-0.5',
                                                                        currentPage === 'upgrade' ? 'text-primary' : '',
                                                                    ].join(' ')}
                                                                />
                                                            </div>
                                                        </div>
                                                    </button>
                                                </li>
                                            )}
                                            {group.items.slice(2).map((item) => (
                                                <li key={item.key}>
                                                    <button
                                                        type="button"
                                                        onClick={item.onClick}
                                                        className={[
                                                            'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 cursor-pointer',
                                                            item.active
                                                                ? 'bg-gradient-to-r from-primary/15 to-primary/5 font-semibold text-foreground shadow-sm border border-primary/20'
                                                                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:translate-x-0.5',
                                                        ].join(' ')}
                                                        title={item.label}
                                                    >
                                                        <item.icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-primary' : ''}`} />
                                                        <span className="flex-1 text-left">{item.label}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </>
                                    ) : (
                                        group.items.map((item) => (
                                            <li key={item.key}>
                                                <button
                                                    type="button"
                                                    onClick={item.onClick}
                                                    className={[
                                                        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 cursor-pointer',
                                                        item.active
                                                            ? 'bg-gradient-to-r from-primary/15 to-primary/5 font-semibold text-foreground shadow-sm border border-primary/20'
                                                            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:translate-x-0.5',
                                                    ].join(' ')}
                                                    title={item.label}
                                                >
                                                    <item.icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-primary' : ''}`} />
                                                    <span className="flex-1 text-left">{item.label}</span>
                                                    {item.badge && (
                                                        <span
                                                            className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                                item.active
                                                                    ? 'bg-primary/20 text-primary'
                                                                    : 'bg-muted-foreground/20 text-muted-foreground'
                                                            }`}
                                                        >
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </button>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        ))}

                        {/* Projects List */}
                        <div className="space-y-2">
                            <div className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Projects</div>
                            {projects.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground italic">No projects loaded</div>
                            ) : (
                                <ul className="space-y-1 max-h-64 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                                    {projects.map((p) => (
                                        <li key={p.id}>
                                            <button
                                                onClick={() => router.visit(`/projects/${p.id}`)}
                                                className={[
                                                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 cursor-pointer',
                                                    currentProjectId === p.id
                                                        ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-foreground font-medium shadow-sm border border-primary/20'
                                                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:translate-x-0.5',
                                                ].join(' ')}
                                            >
                                                <FolderIcon className={`h-4 w-4 shrink-0 ${currentProjectId === p.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                                <span className="line-clamp-1 flex-1 text-left">{p.name}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        {/* Community Link Section */}
                        <div className="space-y-2">
                            <div className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Community</div>
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

                <div className="shrink-0 space-y-4">
                    {/* Usage Bar */}
                    <div className="border-t border-border/50 pt-4">
                        <SidebarUsageBar />
                    </div>

                    {/* User Menu */}
                    <div className="border-t border-border/50 pt-4">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 hover:bg-muted/70 cursor-pointer">
                                <Avatar className="h-8 w-8 shrink-0 ring-2 ring-primary/10">
                                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-foreground font-semibold">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold text-foreground">{auth.user.name}</div>
                                    <div className="truncate text-xs text-muted-foreground">{auth.user.email}</div>
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
    );
}
