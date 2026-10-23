import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { ArrowUpRight, GitBranch, Lightbulb, Users as UsersIcon, Zap } from 'lucide-react';

interface Health {
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    color: string;
}

interface TeamMember {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface ProjectMetricsPanelProps {
    projectId: number;
    completionPercentage: number;
    completedStepsCount: number;
    totalStepsCount: number;
    health: Health;
    teamMembers?: TeamMember[];
    teamMembersCount?: number;
    modulesCount?: number;
    className?: string;
}

export default function ProjectMetricsPanel({
    projectId,
    completionPercentage,
    completedStepsCount,
    totalStepsCount,
    health,
    teamMembers = [],
    teamMembersCount = 0,
    modulesCount = 0,
    className,
}: ProjectMetricsPanelProps) {
    const { repository } = usePage<SharedData>().props;
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={cn('h-full overflow-y-auto bg-background', className)}>
            <div className="px-6 py-5">
                {/* Quick Actions - Horizontal Cards */}
                <div className="flex flex-wrap gap-3">
                    {/* Brainstorming Card */}
                    <button
                        onClick={() => router.visit(`/projects/${projectId}/brainstorming`)}
                        className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-sm"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                            <Lightbulb className="h-4.5 w-4.5 text-foreground" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-medium text-foreground">Brainstorming</div>
                            <div className="text-xs text-muted-foreground">Explore ideas</div>
                        </div>
                        <ArrowUpRight className="ml-2 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                    </button>

                    {/* Modules Card */}
                    {modulesCount > 0 && (
                        <button
                            onClick={() => router.visit(`/projects/${projectId}/modules`)}
                            className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-sm"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                                <Zap className="h-4.5 w-4.5 text-foreground" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-medium text-foreground">Modules</div>
                                <div className="text-xs text-muted-foreground">{modulesCount} modules</div>
                            </div>
                            <ArrowUpRight className="ml-2 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                        </button>
                    )}

                    {/* Team Card */}
                    {teamMembers.length > 0 && (
                        <button
                            onClick={() => router.visit(`/projects/${projectId}/team`)}
                            className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-sm"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                                <UsersIcon className="h-4.5 w-4.5 text-foreground" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-medium text-foreground">Team</div>
                                <div className="text-xs text-muted-foreground">{teamMembersCount} members</div>
                            </div>
                            {/* Mini avatars */}
                            <div className="ml-1 flex -space-x-2">
                                {teamMembers.slice(0, 3).map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-secondary text-[10px] font-medium text-foreground"
                                    >
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} className="h-full w-full rounded-full object-cover" />
                                        ) : (
                                            getInitials(member.name)
                                        )}
                                    </div>
                                ))}
                                {teamMembersCount > 3 && (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-secondary text-[10px] font-medium text-foreground">
                                        +{teamMembersCount - 3}
                                    </div>
                                )}
                            </div>
                            <ArrowUpRight className="ml-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                        </button>
                    )}

                    {/* Repository Card */}
                    {repository && (
                        <button
                            onClick={() => window.open(repository.html_url, '_blank')}
                            className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-sm"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                                <GitBranch className="h-4.5 w-4.5 text-foreground" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-medium text-foreground">{repository.name}</div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="capitalize">{repository.provider}</span>
                                    <span>•</span>
                                    <span className="capitalize">{repository.visibility}</span>
                                </div>
                            </div>
                            <ArrowUpRight className="ml-2 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
