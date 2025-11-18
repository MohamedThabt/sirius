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
    const sections: NavigationSection[] = [
        {
            title: 'Plan',
            items: [
                {
                    title: 'Project Home',
                    href: `/projects/${project.id}`,
                    icon: HomeIcon,
                    status: project.status as 'draft' | 'in_progress' | 'completed',
                },
                {
                    title: project.sections?.overview ? 'System Overview' : 'Generate Overview',
                    href: project.sections?.overview ? `/projects/${project.id}/system-overview` : `/projects/${project.id}/system-overview`,
                    icon: FileIcon,
                    status: project.sections?.overview ? 'completed' : 'draft',
                },
                {
                    title: project.sections?.prd ? 'PRD' : 'Generate PRD',
                    href: project.sections?.prd ? `/projects/${project.id}/prd` : `/projects/${project.id}/prd`,
                    icon: FileIcon,
                    status: project.sections?.prd ? 'completed' : 'draft',
                },
                {
                    title: 'Features',
                    href: `/projects/${project.id}`,
                    icon: ZapIcon,
                    status: 'in_progress' as const,
                },
                {
                    title: 'Team Collaboration',
                    href: `/projects/${project.id}/team`,
                    icon: UsersIcon,
                    status: 'in_progress' as const,
                },
            ],
        },
        {
            title: 'Design',
            items: [
                {
                    title: 'Brainstorming',
                    href: `/projects/${project.id}/brainstorming`,
                    icon: LightbulbIcon,
                    status: 'in_progress' as const,
                },
            ],
        },
        {
            title: 'Technical',
            items: [
                {
                    title: project.sections?.data_modeling ? 'Database Designer' : 'Generate Database',
                    href: project.sections?.data_modeling ? `/projects/${project.id}/erd` : `/projects/${project.id}/erd`,
                    icon: DatabaseIcon,
                    status: project.sections?.data_modeling ? 'completed' : 'draft',
                },
                {
                    title: project.c4 ? 'System Architecture' : 'Generate C4',
                    href: project.c4 ? `/projects/${project.id}/c4` : `/projects/${project.id}/c4`,
                    icon: LayersIcon,
                    status: project.c4 ? 'completed' : 'draft',
                },
                {
                    title: 'Technology Stack',
                    href: `/projects/${project.id}/technology`,
                    icon: CodeIcon,
                    status: 'in_progress' as const,
                },
            ],
        },
    ];

    return sections;
}
