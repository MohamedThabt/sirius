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
    | 'modules'
    | 'erd'
    | 'c4'
    | 'brief';

interface BuildNavOptions {
    project: ProjectSidebarProject;
    currentPage: NavPage;
    sections?: {
        overview?: string | null;
        prd?: string | null;
        data_modeling?: string | null;
    };
    hasFeatures?: boolean;
    hasModules?: boolean;
    mode?: 'basic' | 'full';
    extraGroups?: ProjectNavGroup[];
}

export function buildProjectNavGroups({
    project,
    currentPage,
    sections,
    hasFeatures = false,
    hasModules = false,
    mode = 'basic',
    extraGroups = [],
}: BuildNavOptions): ProjectNavGroup[] {
    // New Flow: Brief → Overview + Technical Details → System Modules → PRD, System Arch, Database
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
            // Stage 1 & 2: Overview (Brief, System Overview, Technical Details)
            {
                label: 'Overview',
                items: [
                    {
                        key: 'brief',
                        icon: FileIcon,
                        label: 'Project Brief',
                        active: currentPage === 'brief',
                        onClick: () => router.visit(`/projects/${project.id}/prepare`),
                    },
                    {
                        key: 'overview',
                        icon: FileIcon,
                        label: 'System Overview',
                        active: currentPage === 'overview',
                        muted: !sections?.overview,
                        disabled: !sections?.overview && !project.brief,
                        onClick: () => router.visit(`/projects/${project.id}/system-overview`),
                    },
                    {
                        key: 'technology',
                        icon: CodeIcon,
                        label: 'Technical Details',
                        active: currentPage === 'technology',
                        disabled: !project.brief,
                        onClick: () => router.visit(`/projects/${project.id}/technology`),
                    },
                ],
            },
            // Stage 3: Modules
            {
                label: 'Modules',
                items: [
                    {
                        key: 'modules',
                        icon: LayersIcon,
                        label: 'System Modules',
                        active: currentPage === 'modules',
                        muted: !hasModules,
                        onClick: () => router.visit(`/projects/${project.id}/modules`),
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
            // Stage 4: Documentation (PRD, Architecture, Database)
            {
                label: 'Documentation',
                items: [
                    {
                        key: 'prd',
                        icon: FileIcon,
                        label: sections?.prd ? 'PRD' : 'Generate PRD',
                        active: currentPage === 'prd',
                        emphasize: !sections?.prd && hasModules,
                        disabled: !hasModules,
                        onClick: () =>
                            sections?.prd
                                ? router.visit(`/projects/${project.id}/prd`)
                                : hasModules && router.post(`/projects/${project.id}/prd/generate`),
                    },
                    {
                        key: 'c4',
                        icon: LayersIcon,
                        label: project.c4 ? 'System Architecture' : 'Generate C4',
                        active: currentPage === 'c4',
                        emphasize: !project.c4 && hasModules,
                        disabled: !hasModules,
                        onClick: () =>
                            project.c4
                                ? router.visit(`/projects/${project.id}/c4`)
                                : hasModules && router.post(`/projects/${project.id}/c4/generate`),
                    },
                    {
                        key: 'erd',
                        icon: DatabaseIcon,
                        label: 'Database Design',
                        active: currentPage === 'erd',
                        muted: !sections?.data_modeling,
                        disabled: !hasModules,
                        onClick: () => router.visit(`/projects/${project.id}/erd`),
                    },
                ],
            },
        );
    }

    return [...groups, ...extraGroups];
}
