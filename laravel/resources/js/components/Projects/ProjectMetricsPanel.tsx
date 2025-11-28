import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import {
    Activity,
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

interface Repository {
    id: number;
    provider: string;
    name: string;
    html_url: string;
    visibility: string;
}

interface ProjectMetricsPanelProps {
    projectId: number;
    completionPercentage: number;
    completedStepsCount: number;
    totalStepsCount: number;
    health: Health;
    teamMembers?: TeamMember[];
    teamMembersCount?: number;
    repository?: Repository | null;
    featuresCount?: number;
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
    repository,
    featuresCount = 0,
    className,
}: ProjectMetricsPanelProps) {
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
            <div className="space-y-8 p-8">
                {/* Ultra-Minimal Project Status */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium tracking-wide text-muted-foreground">PROJECT STATUS</h3>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                            <span className="text-4xl font-light tracking-tight text-foreground">{completionPercentage}%</span>
                            <span className="text-sm text-muted-foreground">
                                {completedStepsCount} of {totalStepsCount} steps
                            </span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-muted/50">
                            <div
                                className="h-full bg-foreground transition-all duration-700 ease-out"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Metrics Grid - Ultra Minimal */}
                    <div className="grid gap-6 pt-2 sm:grid-cols-3">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground/70">Health</p>
                            <div className="flex items-center gap-2">
                                <health.Icon className={cn('h-5 w-5', health.color)} />
                                <p className="text-lg font-medium capitalize text-foreground">{health.label}</p>
                            </div>
                        </div>

                        {featuresCount > 0 && (
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground/70">Features</p>
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-amber-500" />
                                    <p className="text-lg font-medium text-foreground">{featuresCount}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground/70">Team</p>
                            <div className="flex items-center gap-2">
                                <UsersIcon className="h-5 w-5 text-muted-foreground" />
                                <p className="text-lg font-medium text-foreground">{teamMembersCount || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border/30" />

                {/* Quick Actions Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Brainstorming Card */}
                    <button
                        onClick={() => router.visit(`/projects/${projectId}/brainstorming`)}
                        className="group relative overflow-hidden rounded-lg border border-border/50 bg-card p-6 text-left transition-all hover:border-primary/50 hover:shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-amber-500" />
                                    <h4 className="text-base font-medium text-foreground">Brainstorming</h4>
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Explore ideas and refine your project vision
                                </p>
                            </div>
                            <svg
                                className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    {/* Features Card */}
                    {featuresCount > 0 && (
                        <button
                            onClick={() => router.visit(`/projects/${projectId}/features`)}
                            className="group relative overflow-hidden rounded-lg border border-border/50 bg-card p-6 text-left transition-all hover:border-primary/50 hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-amber-500" />
                                        <h4 className="text-base font-medium text-foreground">Features</h4>
                                    </div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        View and manage {featuresCount} project features
                                    </p>
                                </div>
                                <svg
                                    className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    )}
                </div>

                {/* Team & Repository - Only if they exist */}
                {(teamMembers.length > 0 || repository) && (
                    <>
                        <div className="border-t border-border/30" />

                        <div className="grid gap-8 lg:grid-cols-2">
                            {/* Team Members - Minimal */}
                            {teamMembers.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <UsersIcon className="h-4 w-4 text-muted-foreground" />
                                            <h4 className="text-sm font-medium tracking-wide text-muted-foreground">TEAM</h4>
                                        </div>
                                        {teamMembersCount > 4 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.visit(`/projects/${projectId}/team`)}
                                                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                View all →
                                            </Button>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        {teamMembers.slice(0, 3).map((member) => (
                                            <div key={member.id} className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                                    {member.avatar ? (
                                                        <img
                                                            src={member.avatar}
                                                            alt={member.name}
                                                            className="h-full w-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        getInitials(member.name)
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-medium text-foreground">{member.name}</div>
                                                    <div className="truncate text-xs text-muted-foreground">{member.email}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Repository - Minimal */}
                            {repository && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                                        <h4 className="text-sm font-medium tracking-wide text-muted-foreground">REPOSITORY</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="truncate text-sm font-medium text-foreground">{repository.name}</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {repository.provider}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {repository.visibility}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(repository.html_url, '_blank')}
                                            className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Open repository →
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
