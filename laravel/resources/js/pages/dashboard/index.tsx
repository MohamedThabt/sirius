import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircleIcon,
    BoxIcon,
    BugIcon,
    CheckCircleIcon,
    ClockIcon,
    DatabaseIcon,
    ExternalLinkIcon,
    FileTextIcon,
    FolderIcon,
    GitBranchIcon,
    MailIcon,
    MessageSquareIcon,
    ScrollTextIcon,
    ShieldIcon,
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

export default function AdminDashboard({ stats }: DashboardProps) {
    useFlashToasts();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="scrollbar-styled flex h-full flex-1 flex-col gap-8 overflow-y-auto p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-1">
                    <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground/60">Overview of your platform's key metrics and recent activity</p>
                </div>

                {/* Quick Links */}
                <div className="flex flex-wrap gap-2">
                    <QuickLink href="/admin/users" icon={UsersIcon} label="Users" iconClassName="text-blue-500" />
                    <QuickLink href="/admin/projects" icon={FolderIcon} label="Projects" iconClassName="text-amber-500" />
                    <QuickLink href="/admin/modules" icon={BoxIcon} label="Modules" iconClassName="text-cyan-500" />
                    <QuickLink href="/admin/admins" icon={ShieldIcon} label="Admins" iconClassName="text-violet-500" />
                    <QuickLink href="/admin/beta" icon={MailIcon} label="Beta Invitations" badge={stats.beta_pending} iconClassName="text-pink-500" />
                    <QuickLink href="/admin/issues" icon={BugIcon} label="Issues" iconClassName="text-red-500" />
                    <QuickLink href="/admin/feedback" icon={MessageSquareIcon} label="Feedback" iconClassName="text-green-500" />
                    <QuickLink href="/admin/logs" icon={ScrollTextIcon} label="FastAPI Logs" iconClassName="text-slate-500" />

                </div>

                {/* FastAPI Health Status */}
                <FastApiHealthCard health={stats.fastapi_health} />

                {/* Primary Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Total Users"
                        value={stats.total_users}
                        icon={UsersIcon}
                        iconClassName="text-blue-600 dark:text-blue-400"
                        iconBgClassName="bg-blue-500/10 group-hover:bg-blue-500/20"
                        trend={{ value: stats.users_this_month, label: 'this month' }}
                    />
                    <StatCard
                        title="Total Projects"
                        value={stats.total_projects}
                        icon={FolderIcon}
                        iconClassName="text-amber-600 dark:text-amber-400"
                        iconBgClassName="bg-amber-500/10 group-hover:bg-amber-500/20"
                        trend={{ value: stats.projects_this_month, label: 'this month' }}
                    />
                    <StatCard
                        title="Total Modules"
                        value={stats.total_modules}
                        icon={BoxIcon}
                        iconClassName="text-cyan-600 dark:text-cyan-400"
                        iconBgClassName="bg-cyan-500/10 group-hover:bg-cyan-500/20"
                        trend={{ value: stats.modules_this_month, label: 'this month' }}
                    />
                    <StatCard
                        title="Total Features"
                        value={stats.total_features}
                        icon={ZapIcon}
                        iconClassName="text-yellow-600 dark:text-yellow-400"
                        iconBgClassName="bg-yellow-500/10 group-hover:bg-yellow-500/20"
                        subtitle={`${Object.values(stats.features_by_status || {}).reduce((a, b) => a + b, 0)} tracked`}
                    />
                    <StatCard
                        title="Platform Admins"
                        value={stats.total_admins}
                        icon={ShieldIcon}
                        iconClassName="text-violet-600 dark:text-violet-400"
                        iconBgClassName="bg-violet-500/10 group-hover:bg-violet-500/20"
                        subtitle={`${stats.super_admins} super • ${stats.regular_admins} regular`}
                    />
                </div>

                {/* Issues & Feedback Stats */}
                <div className="grid gap-4 sm:grid-cols-2">
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
                        iconClassName="text-green-600 dark:text-green-400"
                        iconBgClassName="bg-green-500/10 group-hover:bg-green-500/20"
                        trend={{ value: stats.feedback_this_month, label: 'this month' }}
                        subtitle={stats.new_feedback > 0 ? `${stats.new_feedback} new` : undefined}
                    />
                </div>

                {/* Secondary Stats */}
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                    {/* Documentation Stats */}
                    <Card className="group border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                <div className="rounded-lg bg-indigo-500/10 p-1.5">
                                    <FileTextIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                Documentation Coverage
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                {
                                    label: 'With PRD',
                                    value: stats.projects_with_prd,
                                    icon: FileTextIcon,
                                    color: 'text-blue-600 dark:text-blue-400',
                                    bg: 'bg-blue-500/10',
                                },
                                {
                                    label: 'With ERD',
                                    value: stats.projects_with_erd,
                                    icon: DatabaseIcon,
                                    color: 'text-emerald-600 dark:text-emerald-400',
                                    bg: 'bg-emerald-500/10',
                                },
                                {
                                    label: 'With C4',
                                    value: stats.projects_with_c4,
                                    icon: BoxIcon,
                                    color: 'text-purple-600 dark:text-purple-400',
                                    bg: 'bg-purple-500/10',
                                },
                                {
                                    label: 'With Repository',
                                    value: stats.projects_with_repo,
                                    icon: GitBranchIcon,
                                    color: 'text-orange-600 dark:text-orange-400',
                                    bg: 'bg-orange-500/10',
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/30"
                                >
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className={cn('rounded-md p-1', item.bg)}>
                                            <item.icon className={cn('h-3.5 w-3.5', item.color)} />
                                        </div>
                                        {item.label}
                                    </span>
                                    <span className="font-semibold text-foreground tabular-nums">{item.value}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Beta Invitations */}
                    <Card className="group border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                <div className="rounded-lg bg-pink-500/10 p-1.5">
                                    <MailIcon className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                                </div>
                                Beta Invitations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                {
                                    label: 'Pending',
                                    value: stats.beta_pending,
                                    icon: ClockIcon,
                                    highlight: stats.beta_pending > 0,
                                    color: 'text-amber-600 dark:text-amber-400',
                                    bg: 'bg-amber-500/10',
                                },
                                {
                                    label: 'Approved',
                                    value: stats.beta_approved,
                                    icon: CheckCircleIcon,
                                    color: 'text-emerald-600 dark:text-emerald-400',
                                    bg: 'bg-emerald-500/10',
                                },
                                {
                                    label: 'Denied',
                                    value: stats.beta_denied,
                                    icon: AlertCircleIcon,
                                    color: 'text-red-600 dark:text-red-400',
                                    bg: 'bg-red-500/10',
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/30"
                                >
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className={cn('rounded-md p-1', item.bg)}>
                                            <item.icon className={cn('h-3.5 w-3.5', item.color)} />
                                        </div>
                                        {item.label}
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            'bg-muted/50 text-muted-foreground/80 tabular-nums',
                                            item.highlight && 'bg-destructive/10 text-destructive/70',
                                        )}
                                    >
                                        {item.value}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Feature Priority */}
                    <Card className="group border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                <div className="rounded-lg bg-yellow-500/10 p-1.5">
                                    <ZapIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                Feature Priority
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Object.keys(stats.features_by_priority).length > 0 ? (
                                Object.entries(stats.features_by_priority).map(([priority, count]) => (
                                    <div key={priority} className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground/70 capitalize">{priority}</span>
                                        <Badge variant="outline" className="border-border/30 text-muted-foreground/80 tabular-nums">
                                            {count}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground/60">No features yet</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Issues Status */}
                    <Card className="group border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                <div className="rounded-lg bg-red-500/10 p-1.5">
                                    <BugIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                Issues Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Object.keys(stats.issues_by_status || {}).length > 0 ? (
                                Object.entries(stats.issues_by_status).map(([status, count]) => (
                                    <div
                                        key={status}
                                        className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/30"
                                    >
                                        <span className="text-sm text-muted-foreground/70 capitalize">{status.replace('_', ' ')}</span>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'border-border/30 text-muted-foreground/80 tabular-nums',
                                                status === 'open' && 'border-destructive/20 bg-destructive/10 text-destructive/70',
                                            )}
                                        >
                                            {count}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground/60">No issues yet</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Feedback Status */}
                    <Card className="group border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                <div className="rounded-lg bg-green-500/10 p-1.5">
                                    <MessageSquareIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                Feedback Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Object.keys(stats.feedback_by_status || {}).length > 0 ? (
                                Object.entries(stats.feedback_by_status).map(([status, count]) => (
                                    <div
                                        key={status}
                                        className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/30"
                                    >
                                        <span className="text-sm text-muted-foreground/70 capitalize">{status}</span>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'border-border/30 text-muted-foreground/80 tabular-nums',
                                                status === 'new' && 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400',
                                            )}
                                        >
                                            {count}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground/60">No feedback yet</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Project Status Overview */}
                {Object.keys(stats.projects_by_status).length > 0 && (
                    <Card className="border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-foreground/80">Project Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(stats.projects_by_status).map(([status, count]) => (
                                    <Badge key={status} variant="outline" className={cn('border px-3 py-1', getStatusColor(status))}>
                                        {status.replace('_', ' ')}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Activity Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Users */}
                    <RecentActivityCard
                        title="Recent Users"
                        icon={UsersIcon}
                        iconBgClassName="bg-blue-500/10"
                        iconClassName="text-blue-600 dark:text-blue-400"
                        viewAllHref="/admin/users"
                        items={stats.recent_users}
                        renderItem={(user) => (
                            <Link href={`/admin/users/${user.id}`}>
                                <div className="group flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full opacity-90" />
                                        ) : (
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 text-sm font-medium text-muted-foreground">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm leading-none font-medium text-foreground/80">{user.name}</p>
                                            <p className="mt-1 text-xs text-muted-foreground/60">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground/50 tabular-nums">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                        <ExternalLinkIcon className="h-3 w-3 text-muted-foreground/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                    </div>
                                </div>
                            </Link>
                        )}
                    />

                    {/* Recent Projects */}
                    <RecentActivityCard
                        title="Recent Projects"
                        icon={FolderIcon}
                        iconBgClassName="bg-amber-500/10"
                        iconClassName="text-amber-600 dark:text-amber-400"
                        viewAllHref="/admin/projects"
                        items={stats.recent_projects}
                        renderItem={(project) => (
                            <Link href={`/admin/projects/${project.id}`}>
                                <div className="group flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/30">
                                    <div>
                                        <p className="text-sm leading-none font-medium text-foreground/80">{project.name}</p>
                                        <p className="mt-1 text-xs text-muted-foreground/60">by {project.user.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={cn('border text-xs', getStatusColor(project.status))}>
                                            {project.status.replace('_', ' ')}
                                        </Badge>
                                        <ExternalLinkIcon className="h-3 w-3 text-muted-foreground/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                    </div>
                                </div>
                            </Link>
                        )}
                    />

                    {/* Recent Admins */}
                    <RecentActivityCard
                        title="Recent Admins"
                        icon={ShieldIcon}
                        iconBgClassName="bg-violet-500/10"
                        iconClassName="text-violet-600 dark:text-violet-400"
                        viewAllHref="/admin/admins"
                        items={stats.recent_admins}
                        renderItem={(admin) => (
                            <div className="flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-sm font-medium text-violet-600/70 dark:text-violet-400/70">
                                        {admin.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm leading-none font-medium text-foreground/80">{admin.name}</p>
                                        <p className="mt-1 text-xs text-muted-foreground/60">{admin.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            'text-xs',
                                            admin.role === 'super_admin' ? 'bg-primary/10 text-primary/70' : 'bg-muted/50 text-muted-foreground/70',
                                        )}
                                    >
                                        {admin.role === 'super_admin' ? 'Super' : 'Admin'}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    />

                    {/* Recent Beta Invitations */}
                    <RecentActivityCard
                        title="Recent Beta Invitations"
                        icon={MailIcon}
                        iconBgClassName="bg-pink-500/10"
                        iconClassName="text-pink-600 dark:text-pink-400"
                        viewAllHref="/admin/beta"
                        items={stats.recent_beta_invitations}
                        renderItem={(invitation) => (
                            <div className="flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-sm font-medium text-amber-600/70 dark:text-amber-400/70">
                                        {invitation.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm leading-none font-medium text-foreground/80">{invitation.name}</p>
                                        <p className="mt-1 text-xs text-muted-foreground/60">{invitation.email}</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className={cn('border text-xs', getStatusColor(invitation.status))}>
                                    {invitation.status}
                                </Badge>
                            </div>
                        )}
                    />
                </div>

                {/* Issues & Feedback Activity Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Issues */}
                    <RecentActivityCard
                        title="Recent Issues"
                        icon={BugIcon}
                        iconBgClassName="bg-red-500/10"
                        iconClassName="text-red-600 dark:text-red-400"
                        viewAllHref="/admin/issues"
                        items={stats.recent_issues}
                        renderItem={(issue) => (
                            <Link href={`/admin/issues/${issue.id}`}>
                                <div className="group flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/30">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm leading-none font-medium text-foreground/80">{issue.title}</p>
                                        <p className="mt-1 text-xs text-muted-foreground/60">by {issue.user.name}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Badge variant="outline" className={cn('border text-xs', getStatusColor(issue.status))}>
                                            {issue.status.replace('_', ' ')}
                                        </Badge>
                                        <ExternalLinkIcon className="h-3 w-3 text-muted-foreground/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                    </div>
                                </div>
                            </Link>
                        )}
                    />

                    {/* Recent Feedback */}
                    <RecentActivityCard
                        title="Recent Feedback"
                        icon={MessageSquareIcon}
                        iconBgClassName="bg-green-500/10"
                        iconClassName="text-green-600 dark:text-green-400"
                        viewAllHref="/admin/feedback"
                        items={stats.recent_feedback}
                        renderItem={(feedback) => (
                            <Link href={`/admin/feedback/${feedback.id}`}>
                                <div className="group flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/30">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm leading-none font-medium text-foreground/80">
                                            {feedback.message.slice(0, 50)}
                                            {feedback.message.length > 50 ? '...' : ''}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground/60">
                                            by {feedback.user.name} • {feedback.type}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Badge variant="outline" className={cn('border text-xs', getStatusColor(feedback.status))}>
                                            {feedback.status}
                                        </Badge>
                                        <ExternalLinkIcon className="h-3 w-3 text-muted-foreground/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                    </div>
                                </div>
                            </Link>
                        )}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
