import type { ProjectNavGroup, ProjectSidebarProject } from '@/components/Projects/ProjectSidebarPanel';
import { router } from '@inertiajs/react';
import {
    CodeIcon,
    DatabaseIcon,
    FileIcon,
    HomeIcon,
    Layers as LayersIcon,
    Lightbulb as LightbulbIcon,
    Users as UsersIcon,
    ZapIcon,
} from 'lucide-react';

type NavPage =
    | 'home'
    | 'brainstorming'
    | 'team'
    | 'technology'
    | 'overview'
    | 'technical_details'
    | 'prd'
    | 'features'
    | 'erd'
    | 'c4';

interface BuildNavOptions {
    project: ProjectSidebarProject;
    currentPage: NavPage;
    sections?: {
        overview?: string | null;
        prd?: string | null;
        data_modeling?: string | null;
    };
    hasFeatures?: boolean;
    mode?: 'basic' | 'full';
    extraGroups?: ProjectNavGroup[];
}

export function buildProjectNavGroups({
    project,
    currentPage,
    sections,
    hasFeatures = false,
    mode = 'basic',
    extraGroups = [],
}: BuildNavOptions): ProjectNavGroup[] {
    const groups: ProjectNavGroup[] = [
        {
            label: 'Project',
            items: [
                {
                    key: 'home',
                    icon: HomeIcon,
                    label: 'Dashboard',
                    active: currentPage === 'home',
                    onClick: () => router.visit(`/projects/${project.id}`),
                },
                {
                    key: 'brainstorming',
                    icon: LightbulbIcon,
                    label: 'Brainstorming',
                    active: currentPage === 'brainstorming',
                    onClick: () => router.visit(`/projects/${project.id}/brainstorming`),
                },
                {
                    key: 'team',
                    icon: UsersIcon,
                    label: 'Team',
                    active: currentPage === 'team',
                    onClick: () => router.visit(`/projects/${project.id}/team`),
                },
            ],
        },
    ];

    if (mode === 'full') {
        groups.push(
            {
                label: 'Plan',
                items: [
                    {
                        key: 'overview',
                        icon: FileIcon,
                        label: 'System Overview',
                        active: currentPage === 'overview',
                        muted: !sections?.overview,
                        disabled: !sections?.overview,
                        onClick: () => sections?.overview && router.visit(`/projects/${project.id}/system-overview`),
                    },
                    {
                        key: 'prd',
                        icon: FileIcon,
                        label: sections?.prd ? 'PRD' : 'Generate PRD',
                        active: currentPage === 'prd',
                        emphasize: !sections?.prd,
                        disabled: !sections?.prd,
                        onClick: () =>
                            sections?.prd ? router.visit(`/projects/${project.id}/prd`) : router.post(`/projects/${project.id}/prd/generate`),
                    },
                    {
                        key: 'features',
                        icon: ZapIcon,
                        label: 'Features',
                        muted: !hasFeatures,
                        active: currentPage === 'features',
                        onClick: () => router.visit(`/projects/${project.id}`),
                    },
                ],
            },
            {
                label: 'Design',
                items: [
                    {
                        key: 'brainstorming-full',
                        icon: LightbulbIcon,
                        label: 'Brainstorming',
                        active: currentPage === 'brainstorming',
                        onClick: () => router.visit(`/projects/${project.id}/brainstorming`),
                    },
                ],
            },
            {
                label: 'Technical',
                items: [
                    {
                        key: 'erd',
                        icon: DatabaseIcon,
                        label: 'Database Designer',
                        active: currentPage === 'erd',
                        muted: !sections?.data_modeling,
                        disabled: !sections?.data_modeling,
                        onClick: () => sections?.data_modeling && router.visit(`/projects/${project.id}/erd`),
                    },
                    {
                        key: 'c4',
                        icon: LayersIcon,
                        label: project.c4 ? 'System Architecture' : 'Generate C4',
                        active: currentPage === 'c4',
                        emphasize: !project.c4,
                        disabled: !project.c4,
                        onClick: () =>
                            project.c4 ? router.visit(`/projects/${project.id}/c4`) : router.post(`/projects/${project.id}/c4/generate`),
                    },
                    {
                        key: 'technology',
                        icon: CodeIcon,
                        label: 'Technology Stack',
                        active: currentPage === 'technology',
                        onClick: () => router.visit(`/projects/${project.id}/technology`),
                    },
                ],
            },
        );
    }

    return [...groups, ...extraGroups];
}

