import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { router } from '@inertiajs/react';
import {
    ChevronDownIcon,
    FolderIcon,
    PlusIcon,
    Mail,
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
    currentPage?: 'projects' | 'invitations';
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
                <div className="overflow-y-auto scrollbar-hide">
                    {/* Logo/Brand */}
                    <div className="mb-8 border-b border-border/50 pb-5">
                        <a href="/" className="flex items-center text-xl font-bold text-foreground transition-all duration-300 hover:opacity-80 hover:translate-x-0.5">
                            Sirius
                        </a>
                    </div>

                    <div className="mb-8">
                        <div className="mb-4">
                            <div className="text-sm font-semibold text-foreground">My Projects</div>
                        </div>

                        <div className="mt-4">
                            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                                <span>Total Projects</span>
                                <span className="font-medium">{projectCount}</span>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-center shadow-sm border border-primary/10">
                                <div className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">{projectCount}</div>
                                <div className="text-xs text-muted-foreground mt-1">Active Workspace</div>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-6">
                        {navGroups.map((group) => (
                            <div key={group.label} className="space-y-2">
                                <div className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.label}</div>
                                <ul className="space-y-1">
                                    {group.items.map((item) => (
                                        <li key={item.key}>
                                            <button
                                                onClick={item.onClick}
                                                className={[
                                                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                                                    item.active
                                                        ? 'bg-gradient-to-r from-primary/15 to-primary/5 font-semibold text-foreground shadow-sm border border-primary/20'
                                                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:translate-x-0.5',
                                                ].join(' ')}
                                                title={item.label}
                                            >
                                                <item.icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-primary' : ''}`} />
                                                <span className="flex-1 text-left">{item.label}</span>
                                                {item.badge && (
                                                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                        item.active 
                                                            ? 'bg-primary/20 text-primary' 
                                                            : 'bg-muted-foreground/20 text-muted-foreground'
                                                    }`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Projects List */}
                        <div className="space-y-2">
                            <div className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Projects</div>
                            {projects.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground italic">No projects loaded</div>
                            ) : (
                                <ul className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                                    {projects.map((p) => (
                                        <li key={p.id}>
                                            <button
                                                onClick={() => router.visit(`/projects/${p.id}`)}
                                                className={[
                                                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200',
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
                    </nav>
                </div>

                <div className="shrink-0 border-t border-border/50 pt-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 hover:bg-muted/70">
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
        </aside>
    );
}
