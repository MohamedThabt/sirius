import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { ProjectNav } from '@/components/project-nav';
import { Separator } from '@/components/ui/separator';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
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

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border/50">
            <SidebarHeader className="border-b border-sidebar-border/50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
                            <Link href="/projects" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className={cn(
                'flex flex-col gap-0',
                '[&>div]:px-0 [&>div]:py-2'
            )}>
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

            <SidebarFooter className="border-t border-sidebar-border/50">
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
