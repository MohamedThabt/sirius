import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    GitBranch,
    Lightbulb,
    Users as UsersIcon,
    Zap,
} from 'lucide-react';

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
        <div className={cn('h-full overflow-y-auto bg-gradient-to-b from-background to-muted/10', className)}>
            <div className="px-6 py-5">
                {/* Quick Actions - Horizontal Cards */}
                <div className="flex flex-wrap gap-3">
                    {/* Brainstorming Card */}
                    <button
                        onClick={() => router.visit(`/projects/${projectId}/brainstorming`)}
                        className="group flex items-center gap-3 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 transition-all hover:border-amber-300 hover:shadow-md dark:border-amber-500/20 dark:from-amber-500/10 dark:to-orange-500/10 dark:hover:border-amber-500/40"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                            <Lightbulb className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-medium text-amber-900 dark:text-amber-100">Brainstorming</div>
                            <div className="text-xs text-amber-700/70 dark:text-amber-300/60">Explore ideas</div>
                        </div>
                        <ArrowUpRight className="ml-2 h-4 w-4 text-amber-500/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>

                    {/* Modules Card */}
                    {modulesCount > 0 && (
                        <button
                            onClick={() => router.visit(`/projects/${projectId}/modules`)}
                            className="group flex items-center gap-3 rounded-xl border border-violet-200/50 bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-3 transition-all hover:border-violet-300 hover:shadow-md dark:border-violet-500/20 dark:from-violet-500/10 dark:to-purple-500/10 dark:hover:border-violet-500/40"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                                <Zap className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-medium text-violet-900 dark:text-violet-100">Modules</div>
                                <div className="text-xs text-violet-700/70 dark:text-violet-300/60">{modulesCount} modules</div>
                            </div>
                            <ArrowUpRight className="ml-2 h-4 w-4 text-violet-500/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                    )}

                    {/* Team Card */}
                    {teamMembers.length > 0 && (
                        <button
                            onClick={() => router.visit(`/projects/${projectId}/team`)}
                            className="group flex items-center gap-3 rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 transition-all hover:border-blue-300 hover:shadow-md dark:border-blue-500/20 dark:from-blue-500/10 dark:to-cyan-500/10 dark:hover:border-blue-500/40"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                                <UsersIcon className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Team</div>
                                <div className="text-xs text-blue-700/70 dark:text-blue-300/60">{teamMembersCount} members</div>
                            </div>
                            {/* Mini avatars */}
                            <div className="ml-1 flex -space-x-2">
                                {teamMembers.slice(0, 3).map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-50 bg-blue-100 text-[10px] font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-800 dark:text-blue-200"
                                    >
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} className="h-full w-full rounded-full object-cover" />
                                        ) : (
                                            getInitials(member.name)
                                        )}
                                    </div>
                                ))}
                                {teamMembersCount > 3 && (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-50 bg-blue-200 text-[10px] font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-700 dark:text-blue-100">
                                        +{teamMembersCount - 3}
                                    </div>
                                )}
                            </div>
                            <ArrowUpRight className="ml-1 h-4 w-4 text-blue-500/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                    )}

                    {/* Repository Card */}
                    {repository && (
                        <button
                            onClick={() => window.open(repository.html_url, '_blank')}
                            className="group flex items-center gap-3 rounded-xl border border-slate-200/50 bg-gradient-to-r from-slate-50 to-gray-50 px-4 py-3 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-500/20 dark:from-slate-500/10 dark:to-gray-500/10 dark:hover:border-slate-500/40"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-500/20">
                                <GitBranch className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{repository.name}</div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-600/70 dark:text-slate-400/60">
                                    <span className="capitalize">{repository.provider}</span>
                                    <span>•</span>
                                    <span className="capitalize">{repository.visibility}</span>
                                </div>
                            </div>
                            <ArrowUpRight className="ml-2 h-4 w-4 text-slate-500/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
