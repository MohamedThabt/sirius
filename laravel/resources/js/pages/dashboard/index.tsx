import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ClientDateTime, useIsClient } from '@/components/ClientDateTime';
import {
    AlertCircleIcon,
    ArrowUpRightIcon,
    BoxIcon,
    BugIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    CoinsIcon,
    CpuIcon,
    DatabaseIcon,
    ExternalLinkIcon,
    FileTextIcon,
    FolderIcon,
    GitBranchIcon,
    LayoutDashboardIcon,
    MailIcon,
    MessageSquareIcon,
    ScrollTextIcon,
    ShieldIcon,
    SparklesIcon,
    TrendingUpIcon,
    UsersIcon,
    ZapIcon,
} from 'lucide-react';
import { FastApiHealthCard } from './components/FastApiHealthCard';
import { QuickLink } from './components/QuickLink';
import { RecentActivityCard } from './components/RecentActivityCard';
import { StatCard } from './components/StatCard';
import { DashboardProps } from './types';
import { getStatusColor } from './utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
];

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function SectionHeader({ title, icon: Icon, description, action, iconClassName, iconBgClassName }: { title: string; icon: React.ElementType; description?: string; action?: React.ReactNode; iconClassName?: string; iconBgClassName?: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconBgClassName || "bg-primary/10")}>
                    <Icon className={cn("h-4.5 w-4.5", iconClassName || "text-primary")} />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-foreground">{title}</h2>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </div>
            </div>
            {action}
        </div>
    );
}

export default function AdminDashboard({ stats }: DashboardProps) {
    useFlashToasts();
    const isClient = useIsClient();

    const today = isClient
        ? new Intl.DateTimeFormat(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          }).format(new Date())
        : '';

    const docCoveragePercent = stats.total_projects > 0
        ? Math.round(((stats.projects_with_prd + stats.projects_with_erd + stats.projects_with_c4) / (stats.total_projects * 3)) * 100)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
                <div className="scrollbar-styled flex h-full flex-1 flex-col gap-8 overflow-y-auto p-6">
                {/* Header Section */}
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="h-5 w-5 text-amber-500" />
                                <span className="text-sm font-medium text-muted-foreground">{getGreeting()}, Admin</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Dashboard Overview
                            </h1>
                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarIcon className="h-3.5 w-3.5 text-blue-500" />
                                {today}
                            </p>
                        </div>
                        <div className="hidden sm:block">
                            <div className="flex items-center gap-6 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-foreground">{stats.total_users}</div>
                                    <div className="text-xs text-muted-foreground">Users</div>
                                </div>
                                <Separator orientation="vertical" className="h-8" />
                                <div className="text-center">
                                    <div className="text-lg font-bold text-foreground">{stats.total_projects}</div>
                                    <div className="text-xs text-muted-foreground">Projects</div>
                                </div>
                                <Separator orientation="vertical" className="h-8" />
                                <div className="text-center">
                                    <div className="text-lg font-bold text-emerald-600">+{stats.users_this_month}</div>
                                    <div className="text-xs text-muted-foreground">New Users</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <LayoutDashboardIcon className="h-3.5 w-3.5 text-indigo-500" />
                        Quick Navigation
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <QuickLink href="/admin/users" icon={UsersIcon} label="Users" iconClassName="text-blue-500" />
                        <QuickLink href="/admin/projects" icon={FolderIcon} label="Projects" iconClassName="text-amber-500" />
                        <QuickLink href="/admin/modules" icon={BoxIcon} label="Modules" iconClassName="text-cyan-500" />
                        <QuickLink href="/admin/admins" icon={ShieldIcon} label="Admins" iconClassName="text-violet-500" />
                        <QuickLink href="/admin/beta" icon={MailIcon} label="Beta Invitations" badge={stats.beta_pending} iconClassName="text-pink-500" />
                        <QuickLink href="/admin/issues" icon={BugIcon} label="Issues" iconClassName="text-red-500" />
                        <QuickLink href="/admin/feedback" icon={MessageSquareIcon} label="Feedback" iconClassName="text-green-500" />
                        <QuickLink href="/admin/usage-logs" icon={CoinsIcon} label="Usage Logs" iconClassName="text-amber-500" />
                        <QuickLink href="/admin/logs" icon={ScrollTextIcon} label="FastAPI Logs" iconClassName="text-slate-500" />
                    </div>
                </div>

                {/* FastAPI Health Status */}
                <FastApiHealthCard health={stats.fastapi_health} />

                {/* Primary Stats Section */}
                <div className="space-y-4">
                    <SectionHeader
                        title="Platform Overview"
                        icon={TrendingUpIcon}
                        iconClassName="text-blue-500"
                        iconBgClassName="bg-blue-500/10"
                        description="Key metrics and growth indicators"
                    />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <StatCard
                            title="Total Users"
                            value={stats.total_users}
                            icon={UsersIcon}
                            iconClassName="text-blue-500"
                            iconBgClassName="bg-blue-500/10"
                            trend={{ value: stats.users_this_month, label: 'this month' }}
                        />
                        <StatCard
                            title="Total Projects"
                            value={stats.total_projects}
                            icon={FolderIcon}
                            iconClassName="text-amber-500"
                            iconBgClassName="bg-amber-500/10"
                            trend={{ value: stats.projects_this_month, label: 'this month' }}
                        />
                        <StatCard
                            title="Total Modules"
                            value={stats.total_modules}
                            icon={BoxIcon}
                            iconClassName="text-cyan-500"
                            iconBgClassName="bg-cyan-500/10"
                            trend={{ value: stats.modules_this_month, label: 'this month' }}
                        />
                        <StatCard
                            title="Total Features"
                            value={stats.total_features}
                            icon={ZapIcon}
                            iconClassName="text-yellow-500"
                            iconBgClassName="bg-yellow-500/10"
                            subtitle={`${Object.values(stats.features_by_status || {}).reduce((a, b) => a + b, 0)} tracked`}
                        />
                        <StatCard
                            title="Platform Admins"
                            value={stats.total_admins}
                            icon={ShieldIcon}
                            iconClassName="text-violet-500"
                            iconBgClassName="bg-violet-500/10"
                            subtitle={`${stats.super_admins} super • ${stats.regular_admins} regular`}
                        />
                    </div>
                </div>

                {/* Issues & Feedback Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Total Issues"
                        value={stats.total_issues}
                        icon={BugIcon}
                        iconClassName="text-red-600 dark:text-red-400"
                        iconBgClassName="bg-red-500/10 group-hover:bg-red-500/20"
                        trend={{ value: stats.issues_this_month, label: 'this month' }}
                        subtitle={stats.open_issues > 0 ? `${stats.open_issues} open • ${stats.blocker_issues} blockers` : undefined}
                    />
                    <StatCard
                        title="Total Feedback"
                        value={stats.total_feedback}
                        icon={MessageSquareIcon}
                            iconClassName="text-emerald-500"
                            iconBgClassName="bg-emerald-500/10"
                        trend={{ value: stats.feedback_this_month, label: 'this month' }}
                        subtitle={stats.new_feedback > 0 ? `${stats.new_feedback} new` : undefined}
                    />
                    {/* Documentation Coverage Summary */}
                    <Card className="group relative overflow-hidden border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Doc Coverage</CardTitle>
                            <div className="rounded-lg bg-indigo-500/10 p-2.5 transition-all duration-200 group-hover:scale-110">
                                <FileTextIcon className="h-4.5 w-4.5 text-indigo-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight text-foreground">{docCoveragePercent}%</div>
                            <div className="mt-2 space-y-1.5">
                                <Progress value={docCoveragePercent} className="h-1.5" />
                                <p className="text-xs text-muted-foreground">
                                    {stats.projects_with_prd} PRD • {stats.projects_with_erd} ERD • {stats.projects_with_c4} C4
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Usage Insights */}
                <div className="space-y-4">
                    <SectionHeader
                        title="Usage Analytics"
                        icon={CoinsIcon}
                        iconClassName="text-orange-500"
                        iconBgClassName="bg-orange-500/10"
                        description="AI usage patterns and credit consumption"
                        action={
                            <Link href="/admin/usage-logs">
                                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                                    View Details
                                    <ArrowUpRightIcon className="h-3 w-3" />
                                </Button>
                            </Link>
                        }
                    />
                    <Card className="border border-border bg-card shadow-sm">
                        <CardContent className="pt-6">
                            {/* Usage Stats Row */}
                            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
                                {[
                                    { value: stats.total_usage_logs?.toLocaleString() || 0, label: 'Total Logs', color: 'text-foreground' },
                                    { value: stats.total_credits_used?.toLocaleString() || 0, label: 'Total Credits', color: 'text-amber-500' },
                                    { value: stats.total_tokens_used?.toLocaleString() || 0, label: 'Total Tokens', color: 'text-blue-500' },
                                    { value: `$${typeof stats.total_cost === 'number' ? stats.total_cost.toFixed(2) : stats.total_cost || '0.00'}`, label: 'Total Cost', color: 'text-emerald-500' },
                                    { value: stats.usage_today?.toLocaleString() || 0, label: 'Today', color: 'text-orange-500' },
                                    { value: stats.usage_this_week?.toLocaleString() || 0, label: 'This Week', color: 'text-purple-500' },
                                    { value: stats.usage_this_month?.toLocaleString() || 0, label: 'This Month', color: 'text-indigo-500' },
                                ].map((stat, index) => (
                                    <div key={index} className="rounded-lg border border-border bg-muted/50 p-4 text-center transition-all duration-200 hover:shadow-sm">
                                        <div className={cn("text-2xl font-bold tabular-nums", stat.color)}>{stat.value}</div>
                                        <div className="mt-0.5 text-xs text-muted-foreground">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Top Actions & Models */}
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Top Action Types */}
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        <TrendingUpIcon className="h-3 w-3 text-amber-500" />
                                        Top Actions by Credits
                                    </h4>
                                    {stats.usage_by_action_type && stats.usage_by_action_type.length > 0 ? (
                                        <div className="space-y-2">
                                            {stats.usage_by_action_type.map((action, index) => {
                                                const maxCredits = Math.max(...stats.usage_by_action_type.map(a => a.credits || 0));
                                                const percentage = maxCredits > 0 ? ((action.credits || 0) / maxCredits) * 100 : 0;
                                                return (
                                                    <div key={index} className="group relative overflow-hidden rounded-lg border border-border bg-muted/30 p-3 transition-all duration-200 hover:bg-muted/50">
                                                        <div className="relative flex items-center justify-between">
                                                            <span className="text-sm font-medium text-foreground">
                                                                {action.action_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                            </span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs text-muted-foreground tabular-nums">{action.count}×</span>
                                                                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 tabular-nums">
                                                                    {action.credits?.toLocaleString() || 0}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
                                            <p className="text-sm text-muted-foreground">No usage data yet</p>
                                        </div>
                                    )}
                                </div>

                                {/* Top AI Models */}
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        <CpuIcon className="h-3 w-3 text-blue-500" />
                                        Top Models by Credits
                                    </h4>
                                    {stats.usage_by_model && stats.usage_by_model.length > 0 ? (
                                        <div className="space-y-2">
                                            {stats.usage_by_model.map((model, index) => {
                                                const maxCredits = Math.max(...stats.usage_by_model.map(m => m.credits || 0));
                                                const percentage = maxCredits > 0 ? ((model.credits || 0) / maxCredits) * 100 : 0;
                                                return (
                                                    <div key={index} className="rounded-lg border border-border bg-muted/30 p-3 transition-all duration-200 hover:bg-muted/50">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium font-mono text-foreground">{model.model}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs text-muted-foreground tabular-nums">{model.count}×</span>
                                                                <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 tabular-nums">
                                                                    {model.credits?.toLocaleString() || 0}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
                                            <p className="text-sm text-muted-foreground">No model data yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Stats */}
                <div className="space-y-4">
                    <SectionHeader
                        title="Detailed Breakdown"
                        icon={FileTextIcon}
                        iconClassName="text-indigo-500"
                        iconBgClassName="bg-indigo-500/10"
                        description="Documentation, invitations, and status overview"
                    />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        {/* Documentation Stats */}
                        <Card className="border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <div className="rounded-lg bg-indigo-500/10 p-1.5">
                                        <FileTextIcon className="h-4 w-4 text-indigo-500" />
                                    </div>
                                    Documentation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {[
                                    { label: 'PRD', value: stats.projects_with_prd, icon: FileTextIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                    { label: 'ERD', value: stats.projects_with_erd, icon: DatabaseIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                    { label: 'C4', value: stats.projects_with_c4, icon: BoxIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                    { label: 'Repo', value: stats.projects_with_repo, icon: GitBranchIcon, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50">
                                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className={cn('rounded-md p-1', item.bg)}>
                                                <item.icon className={cn('h-3 w-3', item.color)} />
                                            </div>
                                            {item.label}
                                        </span>
                                        <span className="font-semibold tabular-nums text-foreground">{item.value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Beta Invitations */}
                        <Card className="border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <div className="rounded-lg bg-pink-500/10 p-1.5">
                                        <MailIcon className="h-4 w-4 text-pink-500" />
                                    </div>
                                    Beta Invitations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {[
                                    { label: 'Pending', value: stats.beta_pending, icon: ClockIcon, highlight: stats.beta_pending > 0, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                    { label: 'Approved', value: stats.beta_approved, icon: CheckCircleIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                    { label: 'Denied', value: stats.beta_denied, icon: AlertCircleIcon, color: 'text-red-500', bg: 'bg-red-500/10' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50">
                                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className={cn('rounded-md p-1', item.bg)}>
                                                <item.icon className={cn('h-3 w-3', item.color)} />
                                            </div>
                                            {item.label}
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                'tabular-nums bg-muted/50 text-muted-foreground',
                                                item.highlight && 'animate-pulse bg-destructive/10 text-destructive',
                                            )}
                                        >
                                            {item.value}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Feature Priority */}
                        <Card className="border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <div className="rounded-lg bg-yellow-500/10 p-1.5">
                                        <ZapIcon className="h-4 w-4 text-yellow-500" />
                                    </div>
                                    Feature Priority
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {Object.keys(stats.features_by_priority).length > 0 ? (
                                    Object.entries(stats.features_by_priority).map(([priority, count]) => {
                                        const priorityColors: Record<string, string> = {
                                            critical: 'border-red-500/30 bg-red-500/10 text-red-600',
                                            high: 'border-orange-500/30 bg-orange-500/10 text-orange-600',
                                            medium: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600',
                                            low: 'border-green-500/30 bg-green-500/10 text-green-600',
                                        };
                                        return (
                                            <div key={priority} className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50">
                                                <span className="text-sm text-muted-foreground capitalize">{priority}</span>
                                                <Badge variant="outline" className={cn('tabular-nums', priorityColors[priority.toLowerCase()] || 'border-border text-muted-foreground')}>
                                                    {count}
                                                </Badge>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
                                        <p className="text-sm text-muted-foreground">No features yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Issues Status */}
                        <Card className="border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <div className="rounded-lg bg-red-500/10 p-1.5">
                                        <BugIcon className="h-4 w-4 text-red-500" />
                                    </div>
                                    Issues Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {Object.keys(stats.issues_by_status || {}).length > 0 ? (
                                    Object.entries(stats.issues_by_status).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50">
                                            <span className="text-sm text-muted-foreground capitalize">{status.replace('_', ' ')}</span>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'tabular-nums border-border text-muted-foreground',
                                                    status === 'open' && 'border-destructive/30 bg-destructive/10 text-destructive',
                                                    status === 'closed' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600',
                                                )}
                                            >
                                                {count}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
                                        <p className="text-sm text-muted-foreground">No issues yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Feedback Status */}
                        <Card className="border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <div className="rounded-lg bg-emerald-500/10 p-1.5">
                                        <MessageSquareIcon className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    Feedback Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {Object.keys(stats.feedback_by_status || {}).length > 0 ? (
                                    Object.entries(stats.feedback_by_status).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50">
                                            <span className="text-sm text-muted-foreground capitalize">{status}</span>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'tabular-nums border-border text-muted-foreground',
                                                    status === 'new' && 'border-blue-500/30 bg-blue-500/10 text-blue-600',
                                                    status === 'reviewed' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600',
                                                )}
                                            >
                                                {count}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
                                        <p className="text-sm text-muted-foreground">No feedback yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Project Status Overview */}
                {Object.keys(stats.projects_by_status).length > 0 && (
                    <Card className="border border-border bg-card shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <div className="rounded-lg bg-amber-500/10 p-1.5">
                                    <FolderIcon className="h-4 w-4 text-amber-500" />
                                </div>
                                Project Status Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(stats.projects_by_status).map(([status, count]) => (
                                    <Badge key={status} variant="outline" className={cn('border px-3 py-1.5 text-sm', getStatusColor(status))}>
                                        <span className="capitalize">{status.replace('_', ' ')}</span>
                                        <span className="ml-1.5 rounded-full bg-background px-1.5 py-0.5 text-xs tabular-nums">{count}</span>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Activity Grid */}
                <div className="space-y-4">
                    <SectionHeader
                        title="Recent Activity"
                        icon={ClockIcon}
                        iconClassName="text-purple-500"
                        iconBgClassName="bg-purple-500/10"
                        description="Latest users, projects, and updates"
                    />
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Recent Users */}
                        <div className="space-y-3">
                            <RecentActivityCard
                                title="Recent Users"
                                icon={UsersIcon}
                                iconBgClassName="bg-blue-500/10"
                                iconClassName="text-blue-500"
                                viewAllHref="/admin/users"
                                items={stats.recent_users}
                                renderItem={(user) => (
                                    <Link href={`/admin/users/${user.id}`}>
                                        <div className="group flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full opacity-90" />
                                                ) : (
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-sm font-medium text-blue-600">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs tabular-nums text-muted-foreground">
                                                    <ClientDateTime value={user.created_at} dateStyle="short" />
                                                </span>
                                                <ExternalLinkIcon className="h-3 w-3 text-muted-foreground/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            />
                        </div>

                        {/* Recent Projects */}
                        <div className="space-y-3">
                            <RecentActivityCard
                                title="Recent Projects"
                                icon={FolderIcon}
                                iconBgClassName="bg-amber-500/10"
                                iconClassName="text-amber-500"
                                viewAllHref="/admin/projects"
                                items={stats.recent_projects}
                                renderItem={(project) => (
                                    <Link href={`/admin/projects/${project.id}`}>
                                        <div className="group flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/50">
                                            <div>
                                                <p className="text-sm font-medium leading-none text-foreground">{project.name}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">by {project.user.name}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={cn('border text-xs', getStatusColor(project.status))}>
                                                    {project.status.replace('_', ' ')}
                                                </Badge>
                                                <ExternalLinkIcon className="h-3 w-3 text-muted-foreground/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            />
                        </div>

                        {/* Recent Admins */}
                        <div className="space-y-3">
                            <RecentActivityCard
                                title="Recent Admins"
                                icon={ShieldIcon}
                                iconBgClassName="bg-violet-500/10"
                                iconClassName="text-violet-500"
                                viewAllHref="/admin/admins"
                                items={stats.recent_admins}
                                renderItem={(admin) => (
                                    <div className="flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-sm font-medium text-violet-600">
                                                {admin.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-none text-foreground">{admin.name}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">{admin.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    'text-xs',
                                                    admin.role === 'super_admin' ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground',
                                                )}
                                            >
                                                {admin.role === 'super_admin' ? 'Super' : 'Admin'}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>

                        {/* Recent Beta Invitations */}
                        <div className="space-y-3">
                            <RecentActivityCard
                                title="Recent Beta Invitations"
                                icon={MailIcon}
                                iconBgClassName="bg-pink-500/10"
                                iconClassName="text-pink-500"
                                viewAllHref="/admin/beta"
                                items={stats.recent_beta_invitations}
                                renderItem={(invitation) => (
                                    <div className="flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-sm font-medium text-amber-600">
                                                {invitation.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-none text-foreground">{invitation.name}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">{invitation.email}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={cn('border text-xs', getStatusColor(invitation.status))}>
                                            {invitation.status}
                                        </Badge>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Issues & Feedback Activity Grid */}
                <div className="space-y-4">
                    <SectionHeader
                        title="Issues & Feedback"
                        icon={BugIcon}
                        iconClassName="text-red-500"
                        iconBgClassName="bg-red-500/10"
                        description="Recent reports and user feedback"
                    />
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Recent Issues */}
                        <div className="space-y-3">
                            <RecentActivityCard
                                title="Recent Issues"
                                icon={BugIcon}
                                iconBgClassName="bg-red-500/10"
                                iconClassName="text-red-500"
                                viewAllHref="/admin/issues"
                                items={stats.recent_issues}
                                renderItem={(issue) => (
                                    <Link href={`/admin/issues/${issue.id}`}>
                                        <div className="group flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/50">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium leading-none text-foreground">{issue.title}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">by {issue.user.name}</p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <Badge variant="outline" className={cn('border text-xs', getStatusColor(issue.status))}>
                                                    {issue.status.replace('_', ' ')}
                                                </Badge>
                                                <ExternalLinkIcon className="h-3 w-3 text-muted-foreground/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            />
                        </div>

                        {/* Recent Feedback */}
                        <div className="space-y-3">
                            <RecentActivityCard
                                title="Recent Feedback"
                                icon={MessageSquareIcon}
                                iconBgClassName="bg-green-500/10"
                                iconClassName="text-emerald-500"
                                viewAllHref="/admin/feedback"
                                items={stats.recent_feedback}
                                renderItem={(feedback) => (
                                    <Link href={`/admin/feedback/${feedback.id}`}>
                                        <div className="group flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/50">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium leading-none text-foreground">
                                                    {feedback.message.slice(0, 50)}
                                                    {feedback.message.length > 50 ? '...' : ''}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    by {feedback.user.name} • {feedback.type}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <Badge variant="outline" className={cn('border text-xs', getStatusColor(feedback.status))}>
                                                    {feedback.status}
                                                </Badge>
                                                <ExternalLinkIcon className="h-3 w-3 text-muted-foreground/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            />
                        </div>
                    </div>
                </div>
                </div>
        </AppLayout>
    );
}
