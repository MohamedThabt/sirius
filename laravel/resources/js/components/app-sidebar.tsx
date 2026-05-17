import { FeedbackModal } from '@/components/FeedbackWidget/FeedbackModal';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { ProjectNav } from '@/components/project-nav';
import { SidebarUsageBar } from '@/components/sidebar-usage-bar';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { type ProjectData } from '@/utils/project-navigation';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Briefcase,
    Bug,
    CoinsIcon,
    CreditCard,
    FileText,
    FolderKanbanIcon,
    LayoutDashboard,
    Mail,
    MessageSquareText,
    Receipt,
    ScrollText,
    Shield,
    Users,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLogo from './app-logo';
import { SettingsNav } from './SettingsNav';
import { ProjectContextNav } from './ProjectContextNav';

const mainNavItems: NavItem[] = [];

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
        title: 'Questionnaires',
        href: '/admin/questionnaires',
        icon: FileText,
    },
    {
        title: 'Send Email',
        href: '/admin/emails',
        icon: Mail,
    },
    {
        title: 'Plans',
        href: '/admin/plans',
        icon: CreditCard,
    },
    {
        title: 'Subscriptions',
        href: '/admin/subscriptions',
        icon: Receipt,
    },
    {
        title: 'Payments',
        href: '/admin/payments',
        icon: CreditCard,
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
        title: 'Issues',
        href: '/admin/issues',
        icon: Bug,
    },
    {
        title: 'Feedback',
        href: '/admin/feedback',
        icon: MessageSquareText,
    },
    {
        title: 'Usage Logs',
        href: '/admin/usage-logs',
        icon: CoinsIcon,
    },
    {
        title: 'FastAPI Logs',
        href: '/admin/logs/fastapi',
        icon: ScrollText,
    },
    {
        title: 'Laravel Logs',
        href: '/admin/logs/laravel',
        icon: FileText,
    },
    {
        title: 'Pulse',
        href: '/admin/pulse',
        icon: Activity,
    },
];

interface AppSidebarProps {
    project?: ProjectData;
}

type SidebarContext = 'admin' | 'settings' | 'project' | 'feature' | 'projects-index' | 'default';

export function AppSidebar({ project: propProject }: AppSidebarProps = {}) {
    const { props, url } = usePage<SharedData>();
    const isAdmin = props.auth?.admin;
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    
    // Resolve project from prop, or fallback to Inertia prop, or undefined
    const envProject = propProject || (props as any).project;

    // Detect current context based on URL
    const context = useMemo<SidebarContext>(() => {
        if (url.startsWith('/admin')) return 'admin';
        if (url.startsWith('/settings')) return 'settings';
        if (url.includes('/features/')) return 'feature';
        if (url.startsWith('/projects') && url !== '/projects') {
            // Check if it's a specific project detail page
            const projectMatch = url.match(/^\/projects\/(\d+)/);
            if (projectMatch) return 'project';
            return 'projects-index';
        }
        if (url === '/projects') return 'projects-index';
        return 'default';
    }, [url]);

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-border/40 bg-gradient-to-b from-background to-muted/20">
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
                {context !== 'settings' && context !== 'admin' && mainNavItems.length > 0 && (
                    <NavMain items={mainNavItems} />
                )}

                {/* Settings Navigation */}
                {context === 'settings' && (
                    <SettingsNav currentPath={url} />
                )}

                {/* Project-specific Navigation */}
                {context === 'project' && envProject && (
                    <div className="mt-4">
                        <ProjectContextNav project={envProject} />
                    </div>
                )}

                {/* Projects Index Navigation */}
                {context === 'projects-index' && (
                    <div className="mt-4">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={context === 'projects-index'}>
                                            <Link href="/projects" prefetch>
                                                <FolderKanbanIcon className="h-4 w-4" />
                                                <span>Projects</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </div>
                )}

                {/* Admin Navigation */}
                {isAdmin && context === 'admin' && (
                    <div className="mt-4">
                        <NavMain items={adminNavItems} title="Admin" />
                    </div>
                )}

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>Feedback</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Send Feedback" onClick={() => setFeedbackOpen(true)}>
                                    <MessageSquareText className="h-4 w-4" />
                                    <span>Send Feedback</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="mt-auto group-data-[collapsible=icon]:hidden">
                    <SidebarUsageBar />
                </div>
            </SidebarContent>

            <SidebarFooter className="border-t border-border/40 p-2">
                <NavUser />
            </SidebarFooter>
            <SidebarRail />

            <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
        </Sidebar>
    );
}
