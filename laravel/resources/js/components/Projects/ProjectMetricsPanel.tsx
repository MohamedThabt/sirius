import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    GitBranch,
    Lightbulb,
    TrendingUp,
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
            <div className="grid gap-6 p-6 lg:grid-cols-2">
                {/* Metrics Overview */}
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Activity className="h-4 w-4" />
                        Project Metrics
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Progress</p>
                                    <p className="mt-1 text-2xl font-bold text-foreground">{completionPercentage}%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-primary/20" />
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Steps</p>
                                    <p className="mt-1 text-2xl font-bold text-foreground">
                                        {completedStepsCount}/{totalStepsCount}
                                    </p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-emerald-500/20" />
                            </div>
                            <p className="mt-3 text-xs text-muted-foreground">Completed</p>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Health Status</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <health.Icon className={cn('h-5 w-5', health.color)} />
                                        <p className="text-lg font-semibold capitalize text-foreground">{health.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {featuresCount > 0 && (
                            <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Features</p>
                                        <p className="mt-1 text-2xl font-bold text-foreground">{featuresCount}</p>
                                    </div>
                                    <Zap className="h-8 w-8 text-amber-500/20" />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.visit(`/projects/${projectId}/features`)}
                                    className="mt-2 h-auto w-full justify-start p-0 text-xs text-primary hover:underline"
                                >
                                    View all features →
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Team & Integrations */}
                <div className="space-y-4">
                    {/* Team Members */}
                    {teamMembers.length > 0 && (
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <UsersIcon className="h-4 w-4" />
                                    Team ({teamMembersCount})
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.visit(`/projects/${projectId}/team`)}
                                    className="h-auto p-0 text-xs text-primary hover:underline"
                                >
                                    View all →
                                </Button>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {teamMembers.slice(0, 4).map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
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

                    {/* Repository Integration */}
                    {repository && (
                        <div>
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <GitBranch className="h-4 w-4" />
                                Repository
                            </h3>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-foreground">{repository.name}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {repository.provider}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {repository.visibility}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(repository.html_url, '_blank')}
                                    className="mt-3 h-auto w-full justify-start p-0 text-xs text-primary hover:underline"
                                >
                                    Open repository →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Lightbulb className="h-4 w-4" />
                            Quick Actions
                        </h3>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit(`/projects/${projectId}/brainstorming`)}
                                className="justify-start"
                            >
                                <Lightbulb className="h-4 w-4" />
                                Brainstorming
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit(`/projects/${projectId}/features`)}
                                className="justify-start"
                            >
                                <Zap className="h-4 w-4" />
                                Features
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
