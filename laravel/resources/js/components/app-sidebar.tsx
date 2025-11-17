import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { ProjectNav } from '@/components/project-nav';
import { Separator } from '@/components/ui/separator';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { type ProjectData } from '@/utils/project-navigation';
import { Link, usePage } from '@inertiajs/react';
import { Briefcase, FolderOpen, Shield, Users } from 'lucide-react';
import AppLogo from './app-logo';
import AppearanceToggleDropdown from './appearance-dropdown';

const mainNavItems: NavItem[] = [
    {
        title: 'Projects',
        href: '/projects',
        icon: FolderOpen,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
        icon: Shield,
    },
    {
        title: 'Admin Management',
        href: '/admin/admins',
        icon: Shield,
    },
    {
        title: 'User Management',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Project Management',
        href: '/admin/projects',
        icon: Briefcase,
    },
];

interface AppSidebarProps {
    project?: ProjectData;
}

export function AppSidebar({ project }: AppSidebarProps = {}) {
    const { props } = usePage<SharedData>();
    const isAdmin = props.auth?.admin; // Check if user is logged in as admin

    const getProjectStatusColor = (status?: string) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
            case 'in_progress':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
            case 'draft':
                return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <Sidebar collapsible="none" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/projects" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Global Navigation */}
                <NavMain items={mainNavItems} />

                {/* Project-specific Navigation */}
                {project && (
                    <>
                        <Separator className="my-2" />
                        <ProjectNav project={project} />
                    </>
                )}

                {/* Admin Navigation */}
                {isAdmin && (
                    <>
                        <Separator className="my-2" />
                        <NavMain items={adminNavItems} title="Administration" />
                    </>
                )}
            </SidebarContent>

            <SidebarFooter className="mt-auto">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <AppearanceToggleDropdown />
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
