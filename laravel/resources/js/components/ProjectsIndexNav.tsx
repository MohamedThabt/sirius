import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { usePage, Link } from '@inertiajs/react';
import { FolderIcon, Mail, PlusIcon } from 'lucide-react';

export function ProjectsIndexNav() {
    const { props, url } = usePage<any>();

    const projects = props.projects || [];
    const invitations = props.invitations || [];

    const projectCount = projects.length;
    const invitationsCount = invitations.length;

    const isProjectsActive = url === '/projects' || url.startsWith('/projects?');
    const isInvitationsActive = url === '/projects/invitations';

    return (
        <>
            <SidebarGroup className="py-2">
                <SidebarGroupContent>
                    <SidebarMenu className="gap-1">
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isProjectsActive}
                                className={cn(
                                    'h-9 rounded-lg font-medium transition-all duration-200',
                                    isProjectsActive
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                                )}
                            >
                                <Link href="/projects" prefetch>
                                    <FolderIcon className="mr-2 h-4 w-4 opacity-70" />
                                    <span className="text-sm">All Projects</span>
                                    {projectCount > 0 && (
                                        <span className="ml-auto text-xs text-muted-foreground/60">
                                            {projectCount}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isInvitationsActive}
                                className={cn(
                                    'h-9 rounded-lg font-medium transition-all duration-200',
                                    isInvitationsActive
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                                )}
                            >
                                <Link href="/projects/invitations" prefetch>
                                    <Mail className="mr-2 h-4 w-4 opacity-70" />
                                    <span className="text-sm">Invitations</span>
                                    {invitationsCount > 0 && (
                                        <span className="ml-auto text-xs text-muted-foreground/60">
                                            {invitationsCount}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => window.dispatchEvent(new CustomEvent('open-create-project-modal'))}
                                className="h-9 cursor-pointer rounded-lg font-medium text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                            >
                                <PlusIcon className="mr-2 h-4 w-4 opacity-70" />
                                <span className="text-sm">Create Project</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="py-2">
                <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/50">
                    Pinned
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu className="gap-1">
                        {projects.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-muted-foreground/60 italic">No projects yet</div>
                        ) : (
                            projects.map((project: any) => (
                                <SidebarMenuItem key={project.id}>
                                    <SidebarMenuButton
                                        asChild
                                        className="h-9 rounded-lg font-medium text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                    >
                                        <Link href={`/projects/${project.id}`}>
                                            <FolderIcon className="mr-2 h-4 w-4 opacity-70" />
                                            <span className="text-sm">{project.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))
                        )}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
}
