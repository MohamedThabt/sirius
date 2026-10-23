import { SidebarUsageBar } from '@/components/sidebar-usage-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { router } from '@inertiajs/react';
import { ChevronDownIcon, FolderIcon, Mail, PlusIcon } from 'lucide-react';

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
    isMobileSheet?: boolean;
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
    isMobileSheet = false,
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
        <aside
            className={`${isMobileSheet ? 'w-full' : isSidebarCollapsed ? 'w-0' : 'hidden w-60 shrink-0 border-r border-sidebar-border lg:block'} bg-sidebar transition-all duration-300`}
        >
            <div
                className={`${isMobileSheet ? 'flex' : 'sticky'} top-0 flex h-screen flex-col justify-between px-3 py-4 ${isSidebarCollapsed && !isMobileSheet ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            >
                <div className="scrollbar-hide overflow-x-hidden overflow-y-auto">
                    <nav className="space-y-6">
                        {navGroups.map((group) => (
                            <div key={group.label} className="space-y-2">
                                <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{group.label}</div>
                                <ul className="space-y-1">
                                    {group.label === 'Overview' ? (
                                        <>
                                            {group.items.slice(0, 2).map((item) => (
                                                <li key={item.key}>
                                                    <button
                                                        type="button"
                                                        onClick={item.onClick}
                                                        className={[
                                                            'flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors',
                                                            item.active
                                                                ? 'bg-sidebar-accent font-medium text-foreground'
                                                                : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground',
                                                        ].join(' ')}
                                                        title={item.label}
                                                    >
                                                        <item.icon className="h-4 w-4 shrink-0" />
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
                                            {group.items.slice(2).map((item) => (
                                                <li key={item.key}>
                                                    <button
                                                        type="button"
                                                        onClick={item.onClick}
                                                        className={[
                                                            'flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors',
                                                            item.active
                                                                ? 'bg-sidebar-accent font-medium text-foreground'
                                                                : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground',
                                                        ].join(' ')}
                                                        title={item.label}
                                                    >
                                                        <item.icon className="h-4 w-4 shrink-0" />
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
                                                        'flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors',
                                                        item.active
                                                            ? 'bg-sidebar-accent font-medium text-foreground'
                                                            : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground',
                                                    ].join(' ')}
                                                    title={item.label}
                                                >
                                                    <item.icon className="h-4 w-4 shrink-0" />
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
                            <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Projects</div>
                            {projects.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground italic">No projects loaded</div>
                            ) : (
                                <ul className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent max-h-64 space-y-1 overflow-x-hidden overflow-y-auto">
                                    {projects.map((p) => (
                                        <li key={p.id}>
                                            <button
                                                onClick={() => router.visit(`/projects/${p.id}`)}
                                                className={[
                                                    'flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors',
                                                    currentProjectId === p.id
                                                        ? 'bg-sidebar-accent font-medium text-foreground'
                                                        : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground',
                                                ].join(' ')}
                                            >
                                                <FolderIcon
                                                    className={`h-4 w-4 shrink-0 ${currentProjectId === p.id ? 'text-primary' : 'text-muted-foreground'}`}
                                                />
                                                <span className="line-clamp-1 flex-1 text-left">{p.name}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
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
                                <button className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent">
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
    );
}
