import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { FuturisticBackground, EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, PageHeader, GlowingBadge } from '@/components/ui/futuristic';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ClientDateTime } from '@/components/ClientDateTime';
import { ArrowLeftIcon, CalendarIcon, MailIcon, UserIcon, FolderIcon, UsersIcon, ZapIcon, GitBranchIcon, ClockIcon, CoinsIcon, CpuIcon, ActivityIcon, CreditCardIcon, MessageSquareIcon, BugIcon, StarIcon, PlusIcon, ExternalLinkIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';

interface Project {
    id: number;
    name: string;
    brief: string;
    status: string;
    created_at: string;
    features_count?: number;
}

interface TeamProject {
    id: number;
    name: string;
    status: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
    pivot: {
        role: string;
        joined_at?: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    created_at: string;
    email_verified_at?: string;
    provider?: string;
    projects: Project[];
    team_projects?: TeamProject[];
    github_token?: any;
}

interface UserStats {
    total_owned_projects: number;
    total_team_projects: number;
    total_features_created: number;
    projects_by_status: Record<string, number>;
    has_github: boolean;
    pending_invitations: number;
}

interface UsageStats {
    total_logs: number;
    total_credits: number;
    total_tokens: number;
    total_cost: string;
    this_month_credits: number;
    top_actions: { action_type: string; count: number; credits: number }[];
}

interface UsageLog {
    id: number;
    action_type: string;
    model: string | null;
    credits_used: number;
    input_tokens: number;
    output_tokens: number;
    created_at: string;
}

interface Props {
    user: User;
    userStats: UserStats;
    usageStats: UsageStats;
    recentUsageLogs: UsageLog[];
    creditsInfo: {
        credits_balance: number;
        total_this_month: number;
        billing_cycle_start: string | null;
        last_reset_at: string | null;
    };
    subscriptionInfo: {
        id: number;
        status: string;
        plan_name: string | null;
        plan_slug: string | null;
        started_at: string;
        ends_at: string | null;
    } | null;
    engagementStats: {
        feedbacks_count: number;
        issues_count: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Users',
        href: '/admin/users',
    },
    {
        title: 'User Details',
        href: '#',
    },
];

export default function UserShow({ user, userStats, usageStats, recentUsageLogs, creditsInfo, subscriptionInfo, engagementStats }: Props) {
    const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false);
    
    const addCreditsForm = useForm({
        amount: '',
        reason: '',
    });

    const handleAddCredits = (e: React.FormEvent) => {
        e.preventDefault();
        addCreditsForm.post(`/admin/users/${user.id}/add-credits`, {
            onSuccess: () => {
                setIsAddCreditsOpen(false);
                addCreditsForm.reset();
            },
        });
    };

    const getStatusVariant = (status: string): "success" | "info" | "slate" | "warning" | "danger" => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'in_progress':
                return 'info';
            case 'draft':
                return 'slate';
            default:
                return 'slate';
        }
    };

    const getRoleVariant = (role: string): "purple" | "info" | "success" | "slate" => {
        switch (role.toLowerCase()) {
            case 'owner':
                return 'purple';
            case 'admin':
                return 'info';
            case 'developer':
                return 'success';
            case 'viewer':
                return 'slate';
            default:
                return 'slate';
        }
    };

    const getSubscriptionStatusVariant = (status: string): "success" | "warning" | "danger" | "slate" => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'success';
            case 'cancelled':
                return 'warning';
            case 'expired':
                return 'danger';
            default:
                return 'slate';
        }
    };

    const getPlanVariant = (slug: string | null): "purple" | "warning" | "slate" => {
        switch (slug?.toLowerCase()) {
            case 'pro':
                return 'purple';
            case 'enterprise':
                return 'warning';
            default:
                return 'slate';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User Details - ${user.name}`} />

            <FuturisticBackground className="min-h-full" showDots={true}>
                <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <Link href="/admin/users">
                            <Button variant="ghost" size="icon" className="h-9 w-9 border border-border/40 bg-card/30 backdrop-blur-sm transition-all hover:bg-card/60">
                                <ArrowLeftIcon className="h-4 w-4" />
                            </Button>
                        </Link>
                        <PageHeader
                            title={user.name}
                            greeting="User Profile"
                            icon={UserIcon}
                            iconClassName="text-blue-500"
                            showDate={false}
                            quickStats={[
                                { label: 'Projects', value: userStats.total_owned_projects },
                                { label: 'Credits', value: creditsInfo.credits_balance },
                            ]}
                            className="flex-1"
                        />
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                        <EnhancedCard variant="gradient" glowColor="blue">
                            <EnhancedCardHeader className="pb-2">
                                <EnhancedCardTitle className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                                    Owned Projects
                                </EnhancedCardTitle>
                            </EnhancedCardHeader>
                            <EnhancedCardContent>
                                <div className="text-3xl font-semibold tabular-nums">{userStats.total_owned_projects}</div>
                            </EnhancedCardContent>
                        </EnhancedCard>

                        <EnhancedCard variant="gradient" glowColor="purple">
                            <EnhancedCardHeader className="pb-2">
                                <EnhancedCardTitle className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                                    Team Projects
                                </EnhancedCardTitle>
                            </EnhancedCardHeader>
                            <EnhancedCardContent>
                                <div className="text-3xl font-semibold tabular-nums">{userStats.total_team_projects}</div>
                            </EnhancedCardContent>
                        </EnhancedCard>

                        <EnhancedCard variant="gradient" glowColor="emerald">
                            <EnhancedCardHeader className="pb-2">
                                <EnhancedCardTitle className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                                    Features Created
                                </EnhancedCardTitle>
                            </EnhancedCardHeader>
                            <EnhancedCardContent>
                                <div className="text-3xl font-semibold tabular-nums">{userStats.total_features_created}</div>
                            </EnhancedCardContent>
                        </EnhancedCard>

                        <EnhancedCard variant="gradient" glowColor="cyan">
                            <EnhancedCardHeader className="pb-2">
                                <EnhancedCardTitle className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                                    GitHub
                                </EnhancedCardTitle>
                            </EnhancedCardHeader>
                            <EnhancedCardContent>
                                <GlowingBadge 
                                    variant={userStats.has_github ? 'success' : 'slate'} 
                                    icon={userStats.has_github ? <CheckCircleIcon className="h-3 w-3" /> : <XCircleIcon className="h-3 w-3" />}
                                >
                                    {userStats.has_github ? 'Connected' : 'Not Connected'}
                                </GlowingBadge>
                            </EnhancedCardContent>
                        </EnhancedCard>

                        <EnhancedCard variant="gradient" glowColor="amber">
                            <EnhancedCardHeader className="pb-2">
                                <EnhancedCardTitle className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                                    Pending Invites
                                </EnhancedCardTitle>
                            </EnhancedCardHeader>
                            <EnhancedCardContent>
                                <div className="text-3xl font-semibold tabular-nums">{userStats.pending_invitations}</div>
                            </EnhancedCardContent>
                        </EnhancedCard>
                    </div>

                    {/* Subscription, Credits & Engagement Row */}
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Subscription & Plan */}
                        <EnhancedCard variant="glass">
                            <EnhancedCardHeader className="pb-3">
                                <EnhancedCardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <CreditCardIcon className="h-4 w-4 text-purple-500" />
                                    Subscription & Plan
                                </EnhancedCardTitle>
                            </EnhancedCardHeader>
                            <EnhancedCardContent className="space-y-4">
                                {subscriptionInfo ? (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground/70">Plan</span>
                                            <GlowingBadge variant={getPlanVariant(subscriptionInfo.plan_slug)}>
                                                {subscriptionInfo.plan_name || 'Unknown'}
                                            </GlowingBadge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground/70">Status</span>
                                            <GlowingBadge variant={getSubscriptionStatusVariant(subscriptionInfo.status)}>
                                                {subscriptionInfo.status}
                                            </GlowingBadge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground/70">Started</span>
                                            <span className="text-sm"><ClientDateTime value={subscriptionInfo.started_at} dateStyle="short" /></span>
                                        </div>
                                        {subscriptionInfo.ends_at && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground/70">Ends</span>
                                                <span className="text-sm"><ClientDateTime value={subscriptionInfo.ends_at} dateStyle="short" /></span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-4 text-center">
                                        <CreditCardIcon className="h-8 w-8 text-muted-foreground/20 mb-2" />
                                        <p className="text-sm text-muted-foreground/60">No active subscription</p>
                                    </div>
                                )}
                            </EnhancedCardContent>
                        </EnhancedCard>

                        {/* Credits Balance */}
                        <EnhancedCard variant="glass">
                            <EnhancedCardHeader className="pb-3">
                                <EnhancedCardTitle className="flex items-center justify-between text-sm font-medium">
                                    <span className="flex items-center gap-2">
                                        <CoinsIcon className="h-4 w-4 text-amber-500" />
                                        Credits Balance
                                    </span>
                                    <Dialog open={isAddCreditsOpen} onOpenChange={setIsAddCreditsOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-7 border-border/40 bg-card/30 px-2 text-xs backdrop-blur-sm">
                                                <PlusIcon className="h-3 w-3 mr-1" />
                                                Add Credits
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="border-border/40 bg-card/95 backdrop-blur-xl">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <CoinsIcon className="h-5 w-5 text-amber-500" />
                                                    Add Credits to {user.name}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Add credits to this user's account. This action will be logged.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleAddCredits} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="amount">Amount *</Label>
                                                    <Input
                                                        id="amount"
                                                        type="number"
                                                        min="1"
                                                        max="100000"
                                                        placeholder="Enter credits amount"
                                                        value={addCreditsForm.data.amount}
                                                        onChange={(e) => addCreditsForm.setData('amount', e.target.value)}
                                                        className={`border-border/40 bg-card/50 ${addCreditsForm.errors.amount ? 'border-red-500' : ''}`}
                                                    />
                                                    {addCreditsForm.errors.amount && (
                                                        <p className="text-xs text-red-500">{addCreditsForm.errors.amount}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="reason">Reason (optional)</Label>
                                                    <Textarea
                                                        id="reason"
                                                        placeholder="e.g., Promotional bonus, Customer support credit"
                                                        value={addCreditsForm.data.reason}
                                                        onChange={(e) => addCreditsForm.setData('reason', e.target.value)}
                                                        rows={3}
                                                        className="border-border/40 bg-card/50"
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button type="button" variant="outline" className="border-border/40" onClick={() => setIsAddCreditsOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" disabled={addCreditsForm.processing || !addCreditsForm.data.amount} className="bg-gradient-to-r from-primary to-primary/80">
                                                        {addCreditsForm.processing ? 'Adding...' : 'Add Credits'}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </EnhancedCardTitle>
                            </EnhancedCardHeader>
                            <EnhancedCardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{creditsInfo.credits_balance.toLocaleString()}</div>
                                    <div className="text-sm text-muted-foreground/60">of {creditsInfo.total_this_month.toLocaleString()} this month</div>
                                </div>
                                {creditsInfo.total_this_month > 0 && (
                                    <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full h-2 transition-all duration-500" 
                                            style={{ width: `${Math.min(100, (creditsInfo.credits_balance / creditsInfo.total_this_month) * 100)}%` }}
                                        />
                                    </div>
                                )}
                                {creditsInfo.billing_cycle_start && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground/60">Cycle Start</span>
                                        <span><ClientDateTime value={creditsInfo.billing_cycle_start} dateStyle="short" /></span>
                                    </div>
                                )}
                                {creditsInfo.last_reset_at && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground/60">Last Reset</span>
                                        <span><ClientDateTime value={creditsInfo.last_reset_at} dateStyle="short" /></span>
                                    </div>
                                )}
                            </EnhancedCardContent>
                        </EnhancedCard>

                        {/* Engagement Stats */}
                        <EnhancedCard variant="glass">
                            <EnhancedCardHeader className="pb-3">
                                <EnhancedCardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <StarIcon className="h-4 w-4 text-pink-500" />
                                    Engagement
                                </EnhancedCardTitle>
                            </EnhancedCardHeader>
                            <EnhancedCardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                    <div className="flex items-center gap-2">
                                        <MessageSquareIcon className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm">Feedbacks</span>
                                    </div>
                                    <span className="text-2xl font-semibold">{engagementStats.feedbacks_count}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                    <div className="flex items-center gap-2">
                                        <BugIcon className="h-4 w-4 text-amber-500" />
                                        <span className="text-sm">Issue Reports</span>
                                    </div>
                                    <span className="text-2xl font-semibold">{engagementStats.issues_count}</span>
                                </div>
                            </EnhancedCardContent>
                        </EnhancedCard>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* User Information */}
                        <EnhancedCard variant="glass">
                            <EnhancedCardHeader className="pb-3">
                                <EnhancedCardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <UserIcon className="h-4 w-4 text-blue-500" />
                                    User Information
                                </EnhancedCardTitle>
                            </EnhancedCardHeader>
                            <EnhancedCardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-border/40 transition-all hover:ring-primary/50" />
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-xl font-medium ring-2 ring-border/40">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-medium">{user.name}</h3>
                                        <p className="text-sm text-muted-foreground/70">{user.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MailIcon className="h-4 w-4 text-muted-foreground/50" />
                                            <span className="text-sm">Email Status</span>
                                        </div>
                                        <GlowingBadge variant={user.email_verified_at ? 'success' : 'slate'}>
                                            {user.email_verified_at ? 'Verified' : 'Unverified'}
                                        </GlowingBadge>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground/50" />
                                        <span className="text-sm">Joined <ClientDateTime value={user.created_at} dateStyle="short" /></span>
                                    </div>

                                    {user.provider && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Login method</span>
                                            <GlowingBadge variant="info" className="capitalize">
                                                {user.provider}
                                            </GlowingBadge>
                                        </div>
                                    )}
                                </div>
                            </EnhancedCardContent>
                        </EnhancedCard>

                        {/* Projects by Status */}
                        <EnhancedCard variant="glass">
                            <EnhancedCardHeader className="pb-3">
                                <EnhancedCardTitle className="text-sm font-medium">Projects by Status</EnhancedCardTitle>
                            </EnhancedCardHeader>
                            <EnhancedCardContent>
                                <div className="space-y-3">
                                    {Object.entries(userStats.projects_by_status).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                                            <GlowingBadge variant={getStatusVariant(status)}>{status.replace('_', ' ')}</GlowingBadge>
                                            <span className="text-2xl font-semibold">{count}</span>
                                        </div>
                                    ))}
                                    {Object.keys(userStats.projects_by_status).length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <FolderIcon className="h-8 w-8 text-muted-foreground/20 mb-2" />
                                            <p className="text-sm text-muted-foreground/60">No projects yet</p>
                                        </div>
                                    )}
                                </div>
                            </EnhancedCardContent>
                        </EnhancedCard>
                    </div>

                    {/* Usage Stats */}
                    {usageStats && (
                        <EnhancedCard variant="glass">
                            <EnhancedCardHeader className="pb-3">
                                <EnhancedCardTitle className="flex items-center justify-between text-sm font-medium">
                                    <span className="flex items-center gap-2">
                                        <ActivityIcon className="h-4 w-4 text-emerald-500" />
                                        Usage Statistics
                                    </span>
                                    <Link href={`/admin/usage-logs?user_id=${user.id}`}>
                                        <Button variant="outline" size="sm" className="border-border/40 bg-card/30 backdrop-blur-sm">View All Logs</Button>
                                    </Link>
                                </EnhancedCardTitle>
                            </EnhancedCardHeader>
                            <EnhancedCardContent>
                                <div className="grid gap-4 grid-cols-2 md:grid-cols-5 mb-6">
                                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/10">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{usageStats.total_logs.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground/60">Total Logs</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/10">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{usageStats.total_credits.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground/60">Total Credits</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/10">
                                        <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{usageStats.total_tokens.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground/60">Total Tokens</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/10">
                                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">${usageStats.total_cost}</div>
                                        <div className="text-xs text-muted-foreground/60">Total Cost</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10">
                                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{usageStats.this_month_credits.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground/60">This Month</div>
                                    </div>
                                </div>

                                {/* Top Actions */}
                                {usageStats.top_actions && usageStats.top_actions.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium mb-3">Top Actions by Credits</h4>
                                        <div className="space-y-2">
                                            {usageStats.top_actions.map((action, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20">
                                                    <span className="text-sm">{action.action_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs text-muted-foreground/60">{action.count} times</span>
                                                        <GlowingBadge variant="purple" size="sm">{action.credits.toLocaleString()} credits</GlowingBadge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Usage Logs */}
                                {recentUsageLogs && recentUsageLogs.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-3">Recent Usage</h4>
                                        <div className="rounded-xl border border-border/30 overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-border/40 hover:bg-transparent">
                                                        <TableHead className="text-muted-foreground/70">Action</TableHead>
                                                        <TableHead className="text-muted-foreground/70">Model</TableHead>
                                                        <TableHead className="text-right text-muted-foreground/70">Tokens</TableHead>
                                                        <TableHead className="text-right text-muted-foreground/70">Credits</TableHead>
                                                        <TableHead className="text-muted-foreground/70">Date</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {recentUsageLogs.map((log) => (
                                                        <TableRow key={log.id} className="border-border/30 transition-all duration-200 hover:bg-primary/[0.03]">
                                                            <TableCell className="font-medium">
                                                                {log.action_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                            </TableCell>
                                                            <TableCell>
                                                                {log.model ? (
                                                                    <GlowingBadge variant="info" size="sm">{log.model}</GlowingBadge>
                                                                ) : (
                                                                    <span className="text-muted-foreground/40">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right font-mono tabular-nums">
                                                                {(log.input_tokens + log.output_tokens).toLocaleString()}
                                                            </TableCell>
                                                            <TableCell className="text-right font-mono tabular-nums">
                                                                {log.credits_used.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-muted-foreground/60">
                                                                <ClientDateTime value={log.created_at} dateStyle="short" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}

                                {usageStats.total_logs === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <ActivityIcon className="h-8 w-8 text-muted-foreground/20 mb-2" />
                                        <p className="text-sm text-muted-foreground/60">No usage logs yet</p>
                                    </div>
                                )}
                            </EnhancedCardContent>
                        </EnhancedCard>
                    )}

                    {/* Owned Projects */}
                    <EnhancedCard variant="glass">
                        <EnhancedCardHeader className="pb-3">
                            <EnhancedCardTitle className="flex items-center gap-2 text-sm font-medium">
                                <FolderIcon className="h-4 w-4 text-blue-500" />
                                Owned Projects
                            </EnhancedCardTitle>
                        </EnhancedCardHeader>
                        <EnhancedCardContent>
                            {user.projects.length > 0 ? (
                                <div className="rounded-xl border border-border/30 overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-border/40 hover:bg-transparent">
                                                <TableHead className="text-muted-foreground/70">Project Name</TableHead>
                                                <TableHead className="text-muted-foreground/70">Brief</TableHead>
                                                <TableHead className="text-muted-foreground/70">Features</TableHead>
                                                <TableHead className="text-muted-foreground/70">Status</TableHead>
                                                <TableHead className="text-muted-foreground/70">Created</TableHead>
                                                <TableHead className="w-10"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {user.projects.map((project) => (
                                                <TableRow 
                                                    key={project.id}
                                                    className="group cursor-pointer border-border/30 transition-all duration-200 hover:bg-primary/[0.03]"
                                                    onClick={() => window.location.href = `/admin/projects/${project.id}`}
                                                >
                                                    <TableCell className="font-medium text-foreground/90">{project.name}</TableCell>
                                                    <TableCell className="max-w-md truncate text-sm text-muted-foreground/60">{project.brief}</TableCell>
                                                    <TableCell>
                                                        <GlowingBadge variant="purple" size="sm">{project.features_count || 0}</GlowingBadge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <GlowingBadge variant={getStatusVariant(project.status)}>{project.status.replace('_', ' ')}</GlowingBadge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground/60 tabular-nums"><ClientDateTime value={project.created_at} dateStyle="short" /></TableCell>
                                                    <TableCell>
                                                        <ExternalLinkIcon className="h-4 w-4 text-muted-foreground/30 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <FolderIcon className="h-10 w-10 text-muted-foreground/20 mb-3" />
                                    <p className="text-sm font-medium text-muted-foreground">No owned projects</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">This user hasn't created any projects</p>
                                </div>
                            )}
                        </EnhancedCardContent>
                    </EnhancedCard>

                    {/* Team Projects */}
                    {user.team_projects && user.team_projects.length > 0 && (
                        <EnhancedCard variant="glass">
                            <EnhancedCardHeader className="pb-3">
                                <EnhancedCardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <UsersIcon className="h-4 w-4 text-purple-500" />
                                    Team Projects
                                </EnhancedCardTitle>
                            </EnhancedCardHeader>
                            <EnhancedCardContent>
                                <div className="rounded-xl border border-border/30 overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-border/40 hover:bg-transparent">
                                                <TableHead className="text-muted-foreground/70">Project Name</TableHead>
                                                <TableHead className="text-muted-foreground/70">Owner</TableHead>
                                                <TableHead className="text-muted-foreground/70">Role</TableHead>
                                                <TableHead className="text-muted-foreground/70">Status</TableHead>
                                                <TableHead className="text-muted-foreground/70">Joined</TableHead>
                                                <TableHead className="w-10"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {user.team_projects.map((project) => (
                                                <TableRow 
                                                    key={project.id}
                                                    className="group cursor-pointer border-border/30 transition-all duration-200 hover:bg-primary/[0.03]"
                                                    onClick={() => window.location.href = `/admin/projects/${project.id}`}
                                                >
                                                    <TableCell className="font-medium text-foreground/90">{project.name}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground/60">{project.user.name}</TableCell>
                                                    <TableCell>
                                                        <GlowingBadge variant={getRoleVariant(project.pivot.role)}>{project.pivot.role}</GlowingBadge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <GlowingBadge variant={getStatusVariant(project.status)}>{project.status.replace('_', ' ')}</GlowingBadge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground/60 tabular-nums">
                                                        {project.pivot.joined_at 
                                                            ? <ClientDateTime value={project.pivot.joined_at} dateStyle="short" />
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <ExternalLinkIcon className="h-4 w-4 text-muted-foreground/30 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </EnhancedCardContent>
                        </EnhancedCard>
                    )}
                </div>
            </FuturisticBackground>
        </AppLayout>
    );
}
