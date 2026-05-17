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
import { ProjectsIndexNav } from './ProjectsIndexNav';

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
        <Sidebar collapsible="icon" variant="inset" className="border-r border-border bg-sidebar">
            <SidebarHeader className="px-4 py-4">
                <SidebarMenu>
                    <SidebarMenuItem className="mb-2">
                        <SidebarMenuButton
                            size="lg"
                            className="w-full rounded-xl border border-border/40 bg-background/50 hover:bg-sidebar-accent"
                        >
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                                        <img
                                            src="/images/brand-logo.png"
                                            alt="Sirius Logo"
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                // Fallback if image fails to load
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    parent.innerHTML = '<div class="h-5 w-5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-300"></div>';
                                                }
                                            }}
                                        />
                                    </div>
                                    <span className="font-semibold text-sm">Sirius</span>
                                </div>
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground h-4 w-4">
                                    <path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75605 9.60753 8.75605 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75605 5.10753 8.75605 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.26618 11.9026 7.38064 11.95 7.49999 11.95C7.61933 11.95 7.73379 11.9026 7.81819 11.8182L10.0682 9.56819Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-3 gap-0">
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
                    <div className="mt-2 text-sidebar-foreground">
                        <ProjectsIndexNav />
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

            <SidebarFooter className="p-3">
                <NavUser />
            </SidebarFooter>
            <SidebarRail />

            <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
        </Sidebar>
    );
}
