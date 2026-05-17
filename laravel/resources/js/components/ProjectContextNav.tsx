import { NavMain } from '@/components/nav-main';
import { type NavItem } from '@/types';
import { generateProjectNavigation, getStatusIcon, type ProjectData } from '@/utils/project-navigation';

interface ProjectContextNavProps {
    project: ProjectData;
}

/**
 * ProjectContextNav
 * Renders the project-specific navigation within the unified AppSidebar.
 * Refactored from ProjectSidebarPanel.tsx to work as a composition within the global sidebar.
 */
export function ProjectContextNav({ project }: ProjectContextNavProps) {
    const sections = generateProjectNavigation(project);

    // Convert project sections to nested navigation items for NavMain
    const projectNavItems: NavItem[] = sections.map((section) => ({
        title: section.title,
        href: section.items[0]?.href || `/projects/${project.id}`,
        icon: section.items[0]?.icon,
        items: section.items.map((item) => ({
            title: item.title,
            href: item.href,
            icon: item.icon,
            badge: item.badge,
            status: item.status,
            StatusIcon: item.status ? getStatusIcon(item.status) : undefined,
        })),
    }));

    return (
        <>
            {projectNavItems.map((navItem, index) => (
                <NavMain
                    key={navItem.title}
                    items={[navItem]}
                    title={index === 0 ? project.name : undefined}
                />
            ))}
        </>
    );
}
