import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePage, Link } from '@inertiajs/react';
import { FolderIcon, Mail, PlusIcon } from 'lucide-react';

export function ProjectsIndexNav() {
    const { props, url } = usePage<any>();
    
    const projects = props.projects || [];
    const invitations = props.invitations || [];
    
    const projectCount = projects.length;
    const invitationsCount = invitations.length;

    // Check active states
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
                                className={isProjectsActive ? "rounded-lg bg-muted text-foreground font-medium shadow-none h-9" : "rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium h-9"}
                            >
                                <Link href="/projects" prefetch>
                                    <FolderIcon className="mr-2 h-4 w-4 opacity-70" />
                                    <span>All Projects</span>
                                    {projectCount > 0 && (
                                        <div className="ml-auto text-xs opacity-50">
                                            {projectCount}
                                        </div>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                asChild 
                                isActive={isInvitationsActive}
                                className={isInvitationsActive ? "rounded-lg bg-muted text-foreground font-medium shadow-none h-9" : "rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium h-9"}
                            >
                                <Link href="/projects/invitations" prefetch>
                                    <Mail className="mr-2 h-4 w-4 opacity-70" />
                                    <span>Invitations</span>
                                    {invitationsCount > 0 && (
                                        <div className="ml-auto text-xs opacity-50">
                                            {invitationsCount}
                                        </div>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => window.dispatchEvent(new CustomEvent('open-create-project-modal'))}
                                className="cursor-pointer rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium h-9 group"
                            >
                                <PlusIcon className="mr-2 h-4 w-4 opacity-70" />
                                <span>Create Project</span>
                                <div className="ml-auto flex h-4 w-4 items-center justify-center rounded bg-muted/60 text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100">
                                    +
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4 py-2">
                <SidebarGroupLabel className="text-sm font-medium text-muted-foreground px-2 h-8">
                    Pinned
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu className="gap-1">
                        {projects.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-muted-foreground italic">No projects yet</div>
                        ) : (
                            projects.map((project: any) => (
                                <SidebarMenuItem key={project.id}>
                                    <SidebarMenuButton 
                                        asChild
                                        className="rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium h-9"
                                    >
                                        <Link href={`/projects/${project.id}`}>
                                            <FolderIcon className="mr-2 h-4 w-4 opacity-70" />
                                            <span>{project.name}</span>
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
