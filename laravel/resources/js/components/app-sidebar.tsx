import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { SidebarUsageBar } from '@/components/sidebar-usage-bar';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarRail,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { type ProjectData } from '@/utils/project-navigation';
import { usePage } from '@inertiajs/react';
import {
    Activity,
    Briefcase,
    Bug,
    CoinsIcon,
    CreditCard,
    FileText,
    LayoutDashboard,
    Mail,
    MessageSquareText,
    Receipt,
    ScrollText,
    Shield,
    Users,
    Zap,
} from 'lucide-react';
import { useMemo } from 'react';
import { SettingsNav } from './SettingsNav';
import { ProjectContextNav } from './ProjectContextNav';
import { ProjectsIndexNav } from './ProjectsIndexNav';

const mainNavItems: NavItem[] = [];

const adminNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Admins', href: '/admin/admins', icon: Shield },
    { title: 'Users', href: '/admin/users', icon: Users },
    { title: 'Questionnaires', href: '/admin/questionnaires', icon: FileText },
    { title: 'Send Email', href: '/admin/emails', icon: Mail },
    { title: 'Plans', href: '/admin/plans', icon: CreditCard },
    { title: 'Subscriptions', href: '/admin/subscriptions', icon: Receipt },
    { title: 'Payments', href: '/admin/payments', icon: CreditCard },
    { title: 'Beta', href: '/admin/beta', icon: Zap },
    { title: 'Projects', href: '/admin/projects', icon: Briefcase },
    { title: 'Issues', href: '/admin/issues', icon: Bug },
    { title: 'Feedback', href: '/admin/feedback', icon: MessageSquareText },
    { title: 'Usage Logs', href: '/admin/usage-logs', icon: CoinsIcon },
    { title: 'FastAPI Logs', href: '/admin/logs/fastapi', icon: ScrollText },
    { title: 'Laravel Logs', href: '/admin/logs/laravel', icon: FileText },
    { title: 'Pulse', href: '/admin/pulse', icon: Activity },
];

interface AppSidebarProps {
    project?: ProjectData;
}

type SidebarContext = 'admin' | 'settings' | 'project' | 'feature' | 'projects-index' | 'default';

export function AppSidebar({ project: propProject }: AppSidebarProps = {}) {
    const { props, url } = usePage<SharedData>();
    const isAdmin = props.auth?.admin;

    const envProject = propProject || (props as any).project;

    const context = useMemo<SidebarContext>(() => {
        if (url.startsWith('/admin')) return 'admin';
        if (url.startsWith('/settings')) return 'settings';
        if (url.includes('/features/')) return 'feature';
        if (url.startsWith('/projects') && url !== '/projects') {
            const projectMatch = url.match(/^\/projects\/(\d+)/);
            if (projectMatch) return 'project';
            return 'projects-index';
        }
        if (url === '/projects') return 'projects-index';
        return 'default';
    }, [url]);

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border bg-sidebar">
            <SidebarContent className="px-2 gap-0">
                {/* Global Navigation */}
                {context !== 'settings' && context !== 'admin' && mainNavItems.length > 0 && (
                    <NavMain items={mainNavItems} />
                )}

                {/* Settings Navigation */}
                {context === 'settings' && (
                    <SettingsNav currentPath={url} />
                )}

                {/* Project-specific Navigation */}
                {context === 'project' && envProject && (
                    <ProjectContextNav project={envProject} />
                )}

                {/* Projects Index Navigation */}
                {context === 'projects-index' && (
                    <ProjectsIndexNav />
                )}

                {/* Admin Navigation */}
                {isAdmin && context === 'admin' && (
                    <NavMain items={adminNavItems} title="Admin" />
                )}

                <div className="mt-auto group-data-[collapsible=icon]:hidden">
                    <SidebarUsageBar />
                </div>
            </SidebarContent>

            <SidebarFooter className="p-2">
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
