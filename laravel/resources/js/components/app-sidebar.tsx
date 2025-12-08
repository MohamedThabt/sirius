import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { ProjectNav } from '@/components/project-nav';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type NavItem, type SharedData } from '@/types';
import { type ProjectData } from '@/utils/project-navigation';
import { Link, usePage } from '@inertiajs/react';
import { Briefcase, FolderOpen, LayoutDashboard, ScrollText, Shield, Telescope, Users, Zap } from 'lucide-react';
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
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Admins',
        href: '/admin/admins',
        icon: Shield,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Beta',
        href: '/admin/beta',
        icon: Zap,
    },
    {
        title: 'Projects',
        href: '/admin/projects',
        icon: Briefcase,
    },
    {
        title: 'FastAPI Logs',
        href: '/admin/logs',
        icon: ScrollText,
    },
    {
        title: 'Telescope',
        href: '/telescope',
        icon: Telescope,
    },
];

interface AppSidebarProps {
    project?: ProjectData;
}

export function AppSidebar({ project }: AppSidebarProps = {}) {
    const { props } = usePage<SharedData>();
    const isAdmin = props.auth?.admin; // Check if user is logged in as admin

    return (
        <Sidebar 
            collapsible="icon" 
            variant="inset" 
            className="border-r border-border/40 bg-gradient-to-b from-background to-muted/20"
        >
            <SidebarHeader className="border-b border-border/40 px-2 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            size="lg" 
                            asChild 
                            className="group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 hover:bg-primary/5"
                        >
                            <Link href="/projects" prefetch className="flex items-center gap-2">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 py-4">
                {/* Global Navigation */}
                <NavMain items={mainNavItems} />

                {/* Project-specific Navigation */}
                {project && (
                    <div className="mt-4">
                        <ProjectNav project={project} />
                    </div>
                )}

                {/* Admin Navigation */}
                {isAdmin && (
                    <div className="mt-4">
                        <NavMain items={adminNavItems} title="Admin" />
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-border/40 p-2">
                <SidebarMenu className="gap-1">
                    <SidebarMenuItem>
                        <AppearanceToggleDropdown />
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
