import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CheckCircleIcon,
    DatabaseIcon,
    FileIcon,
    Layers as LayersIcon,
    LightbulbIcon,
    PlayIcon,
    SettingsIcon,
    ZapIcon,
    Github as GithubIcon,
    Users as UsersIcon,
    FileText as FileTextIcon,
    FolderIcon,
} from 'lucide-react';

interface Project {
    id: number;
    name: string;
    status: string;
    c4: string | null;
}

interface Sections {
    overview: string | null;
    prd: string | null;
    data_modeling: string | null;
    wireframes: string | null;
    technical_details: string | null;
    user_stories: string | null;
    non_functional_requirements: string | null;
}

interface Repository {
    id: number;
    provider: string;
    name: string;
    full_name: string;
    html_url: string;
    visibility: string;
}

type Props = {
    activeTab: string;
    onChange: (tab: 'overview' | 'features' | 'technical') => void;
    project: Project;
    sections: Sections;
    featuresCount: number;
    brainstormingCompleted: boolean;
    repository?: Repository | null;
    onOpenGithubConnect: () => void;
    onOpenRepoManage: () => void;
    onInvite: () => void;
};

const itemBase =
    'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted/60 cursor-pointer';
const itemActive = 'bg-muted text-foreground border border-border';
const itemInactive = 'text-muted-foreground';

export default function ProjectSidebar({
    activeTab,
    onChange,
    project,
    sections,
    featuresCount,
    brainstormingCompleted,
    repository,
    onOpenGithubConnect,
    onOpenRepoManage,
    onInvite,
}: Props) {
    return (
        <aside className="sticky top-0 h-[100dvh] border-r bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full flex-col">
                {/* Header / Brand */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="min-w-0 flex-1 truncate">
                        <div className="text-xs text-muted-foreground">Project</div>
                        <div className="truncate font-semibold text-foreground">{project.name}</div>
                    </div>
                    <Badge variant="outline" className="ml-2 text-xs capitalize">
                        {project.status.replace('_', ' ')}
                    </Badge>
                </div>

                {/* Primary nav */}
                <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
                    <div>
                        <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">Planning</div>
                        <button
                            className={`${itemBase} ${activeTab === 'overview' ? itemActive : itemInactive}`}
                            onClick={() => onChange('overview')}
                        >
                            <FileTextIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1 text-left">Overview</span>
                            {sections.overview && <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-emerald-500" />}
                        </button>
                        <button
                            className={`${itemBase} ${activeTab === 'features' ? itemActive : itemInactive}`}
                            onClick={() => onChange('features')}
                        >
                            <ZapIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1 text-left">Features</span>
                            {featuresCount > 0 && (
                                <Badge variant="secondary" className="ml-auto h-5 min-w-[1.25rem] px-1 text-xs">
                                    {featuresCount}
                                </Badge>
                            )}
                        </button>
                    </div>

                    <div>
                        <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">Technical</div>
                        <button
                            className={`${itemBase} ${activeTab === 'technical' ? itemActive : itemInactive}`}
                            onClick={() => onChange('technical')}
                        >
                            <SettingsIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1 text-left">Technical</span>
                        </button>
                        <div className="mt-1 space-y-0.5 pl-6">
                            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                                <DatabaseIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>Database</span>
                                {sections.data_modeling && (
                                    <CheckCircleIcon className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                                <LayersIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>Architecture</span>
                                {project.c4 && <CheckCircleIcon className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />}
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                                <LightbulbIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>Brainstorming</span>
                                {brainstormingCompleted && (
                                    <CheckCircleIcon className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                                <FolderIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>UI/UX Design</span>
                                {sections.wireframes && (
                                    <CheckCircleIcon className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-2">
                        <div className="h-px bg-border" />
                    </div>

                    {/* Integrations / Team */}
                    <div className="space-y-1">
                        <button
                            className={`${itemBase} ${repository ? 'text-foreground' : 'text-muted-foreground'}`}
                            onClick={() => (repository ? onOpenRepoManage() : onOpenGithubConnect())}
                        >
                            <GithubIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1 text-left">GitHub</span>
                            {repository ? (
                                <Badge className="bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950">Connected</Badge>
                            ) : (
                                <Badge variant="outline">Connect</Badge>
                            )}
                        </button>
                        <button className={itemBase + ' ' + itemInactive} onClick={onInvite}>
                            <UsersIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1 text-left">Team</span>
                            <Badge variant="outline">Invite</Badge>
                        </button>
                    </div>
                </nav>

                {/* Footer quick action */}
                <div className="border-t p-3">
                    <Button className="w-full gap-2" size="sm">
                        <PlayIcon className="h-4 w-4" />
                        Continue
                    </Button>
                </div>
            </div>
        </aside>
    );
}
