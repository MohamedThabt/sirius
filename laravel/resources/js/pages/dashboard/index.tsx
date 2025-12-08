import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
    UsersIcon, 
    FolderIcon, 
    ShieldIcon, 
    ZapIcon, 
    GitBranchIcon, 
    MailIcon,
    ArrowRightIcon,
    TrendingUpIcon,
    CheckCircleIcon,
    ClockIcon,
    AlertCircleIcon,
    FileTextIcon,
    DatabaseIcon,
    BoxIcon,
    ExternalLinkIcon,
    ServerIcon,
    CpuIcon,
    HardDriveIcon,
    ActivityIcon,
    WifiOffIcon,
    ScrollTextIcon,
    TelescopeIcon,
} from 'lucide-react';

// FastAPI Health Status Interface
interface FastApiHealth {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
    timestamp: string;
    service?: string;
    version?: string;
    error?: string;
    system?: {
        cpu_percent: number;
        memory_percent: number;
        memory_used_gb: number;
        memory_total_gb: number;
        disk_percent: number;
        disk_used_gb: number;
        disk_total_gb: number;
    };
    checks?: {
        api: boolean;
        cpu_ok: boolean;
        memory_ok: boolean;
        disk_ok: boolean;
    };
}

interface Stats {
    // User metrics
    total_users: number;
    users_with_projects: number;
    users_this_month: number;
    users_this_week: number;

    // Project metrics
    total_projects: number;
    projects_by_status: Record<string, number>;
    projects_this_month: number;
    projects_with_prd: number;
    projects_with_erd: number;
    projects_with_c4: number;

    // Module metrics
    total_modules: number;
    modules_by_status: Record<string, number>;
    modules_with_erd: number;
    modules_with_synced_erd: number;
    modules_this_month: number;

    // Feature metrics
    total_features: number;
    features_by_status: Record<string, number>;
    features_by_priority: Record<string, number>;

    // Admin metrics
    total_admins: number;
    super_admins: number;
    regular_admins: number;

    // Beta metrics
    beta_pending: number;
    beta_approved: number;
    beta_denied: number;
    beta_total: number;

    // GitHub integration
    users_with_github: number;
    projects_with_repo: number;

    // FastAPI Health Status
    fastapi_health: FastApiHealth;

    // Recent activity
    recent_users: Array<{
        id: number;
        name: string;
        email: string;
        avatar?: string;
        created_at: string;
    }>;
    recent_projects: Array<{
        id: number;
        name: string;
        user_id: number;
        status: string;
        created_at: string;
        updated_at: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
    recent_admins: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        created_by?: number;
        created_at: string;
        creator?: {
            id: number;
            name: string;
        };
    }>;
    recent_beta_invitations: Array<{
        id: number;
        name: string;
        email: string;
        status: string;
        invited_by?: number;
        created_at: string;
        invited_by_admin?: {
            id: number;
            name: string;
        };
    }>;
}

interface Props {
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
];

// Stat Card Component
function StatCard({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend,
    className,
    iconClassName,
    iconBgClassName
}: { 
    title: string; 
    value: number | string; 
    subtitle?: string;
    icon: React.ElementType;
    trend?: { value: number; label: string };
    className?: string;
    iconClassName?: string;
    iconBgClassName?: string;
}) {
    return (
        <Card className={cn(
            "group relative overflow-hidden border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md hover:shadow-primary/5",
            className
        )}>
            {/* Subtle gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground/80">{title}</CardTitle>
                <div className={cn("rounded-xl p-2.5 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md", iconBgClassName || "bg-muted/50 group-hover:bg-muted/80")}>
                    <Icon className={cn("h-4 w-4", iconClassName || "text-muted-foreground")} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
                {trend && (
                    <p className="mt-1 flex items-center gap-1 text-xs">
                        <span className="inline-flex items-center gap-0.5 text-emerald-600/80 dark:text-emerald-400/80">
                            <TrendingUpIcon className="h-3 w-3" />
                            +{trend.value}
                        </span>
                        <span className="text-muted-foreground/70">{trend.label}</span>
                    </p>
                )}
                {subtitle && !trend && (
                    <p className="mt-1 text-xs text-muted-foreground/70">{subtitle}</p>
                )}
            </CardContent>
        </Card>
    );
}

// Quick Link Button Component
function QuickLink({ 
    href, 
    icon: Icon, 
    label, 
    badge,
    iconClassName
}: { 
    href: string; 
    icon: React.ElementType; 
    label: string; 
    badge?: number;
    iconClassName?: string;
}) {
    return (
        <Link href={href}>
            <Button 
                variant="outline" 
                size="sm" 
                className="group relative overflow-hidden border-border/40 bg-gradient-to-r from-card/60 to-card/30 text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:bg-card/80 hover:text-foreground hover:shadow-md"
            >
                <Icon className={cn("mr-2 h-4 w-4 transition-all duration-300 group-hover:scale-110", iconClassName || "opacity-70 group-hover:opacity-100")} />
                {label}
                {badge !== undefined && badge > 0 && (
                    <Badge 
                        variant="secondary" 
                        className="ml-2 h-5 min-w-5 animate-pulse bg-destructive/15 px-1.5 text-xs font-semibold text-destructive"
                    >
                        {badge}
                    </Badge>
                )}
            </Button>
        </Link>
    );
}

export default function AdminDashboard({ stats }: Props) {
    useFlashToasts();

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            completed: 'bg-emerald-500/5 text-emerald-600/70 dark:text-emerald-400/70 border-emerald-500/10',
            in_progress: 'bg-blue-500/5 text-blue-600/70 dark:text-blue-400/70 border-blue-500/10',
            draft: 'bg-zinc-500/5 text-zinc-600/70 dark:text-zinc-400/70 border-zinc-500/10',
            pending: 'bg-amber-500/5 text-amber-600/70 dark:text-amber-400/70 border-amber-500/10',
            approved: 'bg-emerald-500/5 text-emerald-600/70 dark:text-emerald-400/70 border-emerald-500/10',
            denied: 'bg-red-500/5 text-red-600/70 dark:text-red-400/70 border-red-500/10',
        };
        return colors[status.toLowerCase()] || colors.draft;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="scrollbar-styled flex h-full flex-1 flex-col gap-8 overflow-y-auto p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-1">
                    <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-2xl font-bold tracking-tight text-transparent">Dashboard</h1>
                    <p className="text-sm text-muted-foreground/60">
                        Overview of your platform's key metrics and recent activity
                    </p>
                </div>

                {/* Quick Links */}
                <div className="flex flex-wrap gap-2">
                    <QuickLink href="/admin/users" icon={UsersIcon} label="Users" iconClassName="text-blue-500" />
                    <QuickLink href="/admin/projects" icon={FolderIcon} label="Projects" iconClassName="text-amber-500" />
                    <QuickLink href="/admin/modules" icon={BoxIcon} label="Modules" iconClassName="text-cyan-500" />
                    <QuickLink href="/admin/admins" icon={ShieldIcon} label="Admins" iconClassName="text-violet-500" />
                    <QuickLink 
                        href="/admin/beta" 
                        icon={MailIcon} 
                        label="Beta Invitations" 
                        badge={stats.beta_pending}
                        iconClassName="text-pink-500"
                    />
                    <QuickLink href="/admin/logs" icon={ScrollTextIcon} label="FastAPI Logs" iconClassName="text-slate-500" />
                    <QuickLink href="/telescope" icon={TelescopeIcon} label="Telescope" iconClassName="text-indigo-500" />
                </div>

                {/* FastAPI Health Status */}
                <Card className={cn(
                    "border bg-card/50 transition-all duration-300",
                    stats.fastapi_health?.status === 'healthy' && "border-emerald-500/30 bg-emerald-500/5",
                    stats.fastapi_health?.status === 'degraded' && "border-amber-500/30 bg-amber-500/5",
                    stats.fastapi_health?.status === 'unhealthy' && "border-red-500/30 bg-red-500/5",
                    stats.fastapi_health?.status === 'offline' && "border-zinc-500/30 bg-zinc-500/5",
                )}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                <ServerIcon className="h-4 w-4 text-muted-foreground/70" />
                                FastAPI Service Status
                            </CardTitle>
                            <Badge 
                                variant="outline"
                                className={cn(
                                    "border px-2.5 py-0.5 text-xs font-medium",
                                    stats.fastapi_health?.status === 'healthy' && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                                    stats.fastapi_health?.status === 'degraded' && "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                                    stats.fastapi_health?.status === 'unhealthy' && "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
                                    stats.fastapi_health?.status === 'offline' && "border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
                                )}
                            >
                                {stats.fastapi_health?.status === 'healthy' && <CheckCircleIcon className="mr-1 h-3 w-3" />}
                                {stats.fastapi_health?.status === 'degraded' && <AlertCircleIcon className="mr-1 h-3 w-3" />}
                                {stats.fastapi_health?.status === 'unhealthy' && <AlertCircleIcon className="mr-1 h-3 w-3" />}
                                {stats.fastapi_health?.status === 'offline' && <WifiOffIcon className="mr-1 h-3 w-3" />}
                                {stats.fastapi_health?.status ? stats.fastapi_health.status.charAt(0).toUpperCase() + stats.fastapi_health.status.slice(1) : 'Unknown'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {stats.fastapi_health?.status === 'offline' ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <WifiOffIcon className="h-4 w-4" />
                                <span>{stats.fastapi_health?.error || 'Unable to connect to FastAPI service'}</span>
                            </div>
                        ) : stats.fastapi_health?.system ? (
                            <div className="grid gap-4 sm:grid-cols-3">
                                {/* CPU Usage */}
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "rounded-lg p-2",
                                        stats.fastapi_health?.checks?.cpu_ok ? "bg-emerald-500/10" : "bg-red-500/10"
                                    )}>
                                        <CpuIcon className={cn(
                                            "h-4 w-4",
                                            stats.fastapi_health?.checks?.cpu_ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                                        )} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground/70">CPU Usage</p>
                                        <p className="text-lg font-semibold tabular-nums text-foreground/90">
                                            {stats.fastapi_health.system.cpu_percent}%
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Memory Usage */}
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "rounded-lg p-2",
                                        stats.fastapi_health?.checks?.memory_ok ? "bg-emerald-500/10" : "bg-red-500/10"
                                    )}>
                                        <ActivityIcon className={cn(
                                            "h-4 w-4",
                                            stats.fastapi_health?.checks?.memory_ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                                        )} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground/70">Memory</p>
                                        <p className="text-lg font-semibold tabular-nums text-foreground/90">
                                            {stats.fastapi_health.system.memory_percent}%
                                        </p>
                                        <p className="text-xs text-muted-foreground/50">
                                            {stats.fastapi_health.system.memory_used_gb} / {stats.fastapi_health.system.memory_total_gb} GB
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Disk Usage */}
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "rounded-lg p-2",
                                        stats.fastapi_health?.checks?.disk_ok ? "bg-emerald-500/10" : "bg-red-500/10"
                                    )}>
                                        <HardDriveIcon className={cn(
                                            "h-4 w-4",
                                            stats.fastapi_health?.checks?.disk_ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                                        )} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground/70">Disk</p>
                                        <p className="text-lg font-semibold tabular-nums text-foreground/90">
                                            {stats.fastapi_health.system.disk_percent}%
                                        </p>
                                        <p className="text-xs text-muted-foreground/50">
                                            {stats.fastapi_health.system.disk_used_gb} / {stats.fastapi_health.system.disk_total_gb} GB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <AlertCircleIcon className="h-4 w-4" />
                                <span>{stats.fastapi_health?.error || 'Service status unavailable'}</span>
                            </div>
                        )}
                        
                        {stats.fastapi_health?.service && stats.fastapi_health?.version && (
                            <div className="mt-3 flex items-center gap-4 border-t border-border/30 pt-3 text-xs text-muted-foreground/60">
                                <span>{stats.fastapi_health.service}</span>
                                <span>v{stats.fastapi_health.version}</span>
                                <span>Last checked: {new Date(stats.fastapi_health.timestamp).toLocaleTimeString()}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Primary Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Total Users"
                        value={stats.total_users}
                        icon={UsersIcon}
                        iconClassName="text-blue-600 dark:text-blue-400"
                        iconBgClassName="bg-blue-500/10 group-hover:bg-blue-500/20"
                        trend={{ value: stats.users_this_month, label: "this month" }}
                    />
                    <StatCard
                        title="Total Projects"
                        value={stats.total_projects}
                        icon={FolderIcon}
                        iconClassName="text-amber-600 dark:text-amber-400"
                        iconBgClassName="bg-amber-500/10 group-hover:bg-amber-500/20"
                        trend={{ value: stats.projects_this_month, label: "this month" }}
                    />
                    <StatCard
                        title="Total Modules"
                        value={stats.total_modules}
                        icon={BoxIcon}
                        iconClassName="text-cyan-600 dark:text-cyan-400"
                        iconBgClassName="bg-cyan-500/10 group-hover:bg-cyan-500/20"
                        trend={{ value: stats.modules_this_month, label: "this month" }}
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

                {/* Secondary Stats */}
                <div className="grid gap-4 md:grid-cols-3">
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
                                { label: 'With PRD', value: stats.projects_with_prd, icon: FileTextIcon, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
                                { label: 'With ERD', value: stats.projects_with_erd, icon: DatabaseIcon, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                                { label: 'With C4', value: stats.projects_with_c4, icon: BoxIcon, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
                                { label: 'With Repository', value: stats.projects_with_repo, icon: GitBranchIcon, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/30">
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className={cn("rounded-md p-1", item.bg)}>
                                            <item.icon className={cn("h-3.5 w-3.5", item.color)} />
                                        </div>
                                        {item.label}
                                    </span>
                                    <span className="font-semibold tabular-nums text-foreground">{item.value}</span>
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
                                { label: 'Pending', value: stats.beta_pending, icon: ClockIcon, highlight: stats.beta_pending > 0, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
                                { label: 'Approved', value: stats.beta_approved, icon: CheckCircleIcon, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                                { label: 'Denied', value: stats.beta_denied, icon: AlertCircleIcon, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/30">
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className={cn("rounded-md p-1", item.bg)}>
                                            <item.icon className={cn("h-3.5 w-3.5", item.color)} />
                                        </div>
                                        {item.label}
                                    </span>
                                    <Badge 
                                        variant="secondary"
                                        className={cn(
                                            "tabular-nums bg-muted/50 text-muted-foreground/80",
                                            item.highlight && "bg-destructive/10 text-destructive/70"
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
                                        <span className="text-sm capitalize text-muted-foreground/70">{priority}</span>
                                        <Badge variant="outline" className="tabular-nums border-border/30 text-muted-foreground/80">{count}</Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground/60">No features yet</p>
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
                                    <Badge 
                                        key={status} 
                                        variant="outline"
                                        className={cn("border px-3 py-1", getStatusColor(status))}
                                    >
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
                    <Card className="border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground/80">
                                <div className="rounded-lg bg-blue-500/10 p-1.5">
                                    <UsersIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                Recent Users
                            </CardTitle>
                            <Link href="/admin/users">
                                <Button variant="ghost" size="sm" className="group h-8 text-xs text-muted-foreground/70 hover:text-foreground/80">
                                    View All
                                    <ArrowRightIcon className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="scrollbar-thin max-h-[280px] space-y-1 overflow-y-auto">
                            {stats.recent_users.map((user) => (
                                <Link key={user.id} href={`/admin/users/${user.id}`} className="block">
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
                                                <p className="text-sm font-medium leading-none text-foreground/80">{user.name}</p>
                                                <p className="mt-1 text-xs text-muted-foreground/60">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs tabular-nums text-muted-foreground/50">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </span>
                                            <ExternalLinkIcon className="h-3 w-3 text-muted-foreground/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Projects */}
                    <Card className="border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground/80">
                                <div className="rounded-lg bg-amber-500/10 p-1.5">
                                    <FolderIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                Recent Projects
                            </CardTitle>
                            <Link href="/admin/projects">
                                <Button variant="ghost" size="sm" className="group h-8 text-xs text-muted-foreground/70 hover:text-foreground/80">
                                    View All
                                    <ArrowRightIcon className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="scrollbar-thin max-h-[280px] space-y-1 overflow-y-auto">
                            {stats.recent_projects.map((project) => (
                                <Link key={project.id} href={`/admin/projects/${project.id}`} className="block">
                                    <div className="group flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/30">
                                        <div>
                                            <p className="text-sm font-medium leading-none text-foreground/80">{project.name}</p>
                                            <p className="mt-1 text-xs text-muted-foreground/60">by {project.user.name}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge 
                                                variant="outline"
                                                className={cn("border text-xs", getStatusColor(project.status))}
                                            >
                                                {project.status.replace('_', ' ')}
                                            </Badge>
                                            <ExternalLinkIcon className="h-3 w-3 text-muted-foreground/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Admins */}
                    <Card className="border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground/80">
                                <div className="rounded-lg bg-violet-500/10 p-1.5">
                                    <ShieldIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                Recent Admins
                            </CardTitle>
                            <Link href="/admin/admins">
                                <Button variant="ghost" size="sm" className="group h-8 text-xs text-muted-foreground/70 hover:text-foreground/80">
                                    View All
                                    <ArrowRightIcon className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="scrollbar-thin max-h-[280px] space-y-1 overflow-y-auto">
                            {stats.recent_admins.map((admin) => (
                                <div key={admin.id} className="flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-sm font-medium text-violet-600/70 dark:text-violet-400/70">
                                            {admin.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none text-foreground/80">{admin.name}</p>
                                            <p className="mt-1 text-xs text-muted-foreground/60">{admin.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge 
                                            variant="secondary"
                                            className={cn(
                                                "text-xs",
                                                admin.role === 'super_admin' 
                                                    ? "bg-primary/10 text-primary/70" 
                                                    : "bg-muted/50 text-muted-foreground/70"
                                            )}
                                        >
                                            {admin.role === 'super_admin' ? 'Super' : 'Admin'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Beta Invitations */}
                    <Card className="border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground/80">
                                <div className="rounded-lg bg-pink-500/10 p-1.5">
                                    <MailIcon className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                                </div>
                                Recent Beta Invitations
                            </CardTitle>
                            <Link href="/admin/beta">
                                <Button variant="ghost" size="sm" className="group h-8 text-xs text-muted-foreground/70 hover:text-foreground/80">
                                    View All
                                    <ArrowRightIcon className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="scrollbar-thin max-h-[280px] space-y-1 overflow-y-auto">
                            {stats.recent_beta_invitations.map((invitation) => (
                                <div key={invitation.id} className="flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-sm font-medium text-amber-600/70 dark:text-amber-400/70">
                                            {invitation.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none text-foreground/80">{invitation.name}</p>
                                            <p className="mt-1 text-xs text-muted-foreground/60">{invitation.email}</p>
                                        </div>
                                    </div>
                                    <Badge 
                                        variant="outline"
                                        className={cn("border text-xs", getStatusColor(invitation.status))}
                                    >
                                        {invitation.status}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
