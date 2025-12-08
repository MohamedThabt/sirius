import {
    AlertCircleIcon,
    CheckCircleIcon,
    CircleIcon,
    ClockIcon,
    CodeIcon,
    DatabaseIcon,
    FileIcon,
    HomeIcon,
    Layers as LayersIcon,
    LightbulbIcon,
    Users as UsersIcon,
    ZapIcon,
    type LucideIcon,
} from 'lucide-react';

export interface ProjectData {
    id: number;
    name: string;
    status: string;
    c4?: string | null;
    sections?: {
        overview?: string | null;
        prd?: string | null;
        data_modeling?: string | null;
        non_functional_requirements?: string | null;
    };
}

export interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

export interface NavigationItem {
    title: string;
    href: string;
    icon: LucideIcon;
    badge?: string;
    status?: 'draft' | 'in_progress' | 'completed';
}

export function getStatusIcon(status: string) {
    switch (status) {
        case 'draft':
            return CircleIcon;
        case 'in_progress':
            return ClockIcon;
        case 'completed':
            return CheckCircleIcon;
        default:
            return AlertCircleIcon;
    }
}

export function generateProjectNavigation(project: ProjectData): NavigationSection[] {
    // New Flow: Brief → Overview + Technical Details → System Modules → PRD, System Arch, Database
    const sections: NavigationSection[] = [
        {
            title: 'Overview',
            items: [
                {
                    title: 'Project Home',
                    href: `/projects/${project.id}`,
                    icon: HomeIcon,
                    status: project.status as 'draft' | 'in_progress' | 'completed',
                },
                {
                    title: 'Project Brief',
                    href: `/projects/${project.id}/prepare`,
                    icon: FileIcon,
                    status: 'in_progress' as const,
                },
                {
                    title: project.sections?.overview ? 'System Overview' : 'Generate Overview',
                    href: `/projects/${project.id}/system-overview`,
                    icon: FileIcon,
                    status: project.sections?.overview ? 'completed' : 'draft',
                },
                {
                    title: 'Technical Details',
                    href: `/projects/${project.id}/technology`,
                    icon: CodeIcon,
                    status: 'in_progress' as const,
                },
            ],
        },
        {
            title: 'Modules',
            items: [
                {
                    title: 'System Modules',
                    href: `/projects/${project.id}/modules`,
                    icon: LayersIcon,
                    status: 'in_progress' as const,
                },
                {
                    title: 'Features',
                    href: `/projects/${project.id}`,
                    icon: ZapIcon,
                    status: 'in_progress' as const,
                },
            ],
        },
        {
            title: 'Documentation',
            items: [
                {
                    title: project.sections?.prd ? 'PRD' : 'Generate PRD',
                    href: `/projects/${project.id}/prd`,
                    icon: FileIcon,
                    status: project.sections?.prd ? 'completed' : 'draft',
                },
                {
                    title: project.c4 ? 'System Architecture' : 'Generate C4',
                    href: `/projects/${project.id}/c4`,
                    icon: LayersIcon,
                    status: project.c4 ? 'completed' : 'draft',
                },
                {
                    title: project.sections?.data_modeling ? 'Database Design' : 'Generate Database',
                    href: `/projects/${project.id}/erd`,
                    icon: DatabaseIcon,
                    status: project.sections?.data_modeling ? 'completed' : 'draft',
                },
            ],
        },
        {
            title: 'Collaboration',
            items: [
                {
                    title: 'Brainstorming',
                    href: `/projects/${project.id}/brainstorming`,
                    icon: LightbulbIcon,
                    status: 'in_progress' as const,
                },
                {
                    title: 'Team',
                    href: `/projects/${project.id}/team`,
                    icon: UsersIcon,
                    status: 'in_progress' as const,
                },
            ],
        },
    ];

    return sections;
}
