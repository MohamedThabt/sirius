import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, PageHeader, GlowingBadge } from '@/components/ui/futuristic';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, CreditCard, UsersIcon, CalendarIcon, CoinsIcon, TrendingUpIcon, UserIcon, GitBranchIcon, FolderIcon, ExternalLinkIcon } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  slug: string;
  price: string;
  credits_per_cycle: number;
  billing_cycle: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  created_at: string;
  projects_count: number;
}

interface PlanStats {
  total_users: number;
  users_this_month: number;
  users_this_week: number;
  users_with_projects: number;
  users_with_github: number;
}

interface Props {
  plan: Plan;
  subscribers: {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  planStats: PlanStats;
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    title: 'Plans',
    href: '/admin/plans',
  },
  {
    title: 'Plan Details',
    href: '#',
  },
];

export default function PlanShow({ plan, subscribers, planStats }: Props) {
  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numPrice);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Plan Details - ${plan.name}`} />

        <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link href="/admin/plans">
              <Button variant="ghost" size="icon" className="h-9 w-9 border border-border/40 bg-card/30 backdrop-blur-sm transition-all hover:bg-card/60">
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
            </Link>
            <PageHeader
              title={plan.name}
              greeting="Subscription Plan"
              icon={CreditCard}
              iconClassName="text-emerald-500"
              showDate={false}
              quickStats={[
                { label: 'Users', value: planStats.total_users },
                { label: 'Price', value: formatPrice(plan.price) },
                { label: 'Credits', value: plan.credits_per_cycle },
              ]}
              className="flex-1"
            />
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <EnhancedCard variant="gradient" glowColor="blue">
              <EnhancedCardHeader className="pb-2">
                <EnhancedCardTitle className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                  Total Users
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-semibold tabular-nums">{planStats.total_users}</div>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="gradient" glowColor="emerald">
              <EnhancedCardHeader className="pb-2">
                <EnhancedCardTitle className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                  This Month
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">+{planStats.users_this_month}</div>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="gradient" glowColor="cyan">
              <EnhancedCardHeader className="pb-2">
                <EnhancedCardTitle className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                  This Week
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-semibold tabular-nums text-cyan-600 dark:text-cyan-400">+{planStats.users_this_week}</div>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="gradient" glowColor="purple">
              <EnhancedCardHeader className="pb-2">
                <EnhancedCardTitle className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                  With Projects
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-semibold tabular-nums">{planStats.users_with_projects}</div>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="gradient" glowColor="cyan">
              <EnhancedCardHeader className="pb-2">
                <EnhancedCardTitle className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                  With GitHub
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-semibold tabular-nums">{planStats.users_with_github}</div>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Plan Information */}
            <EnhancedCard variant="glass">
              <EnhancedCardHeader className="pb-3">
                <EnhancedCardTitle className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4 text-emerald-500" />
                  Plan Information
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground/60">Subscription Plan</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <CoinsIcon className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">Price</span>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      {formatPrice(plan.price)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Credits per Cycle</span>
                    </div>
                    <GlowingBadge variant="purple" size="lg">
                      {plan.credits_per_cycle} credits
                    </GlowingBadge>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Billing Cycle</span>
                    </div>
                    <GlowingBadge variant="info" className="capitalize">
                      {plan.billing_cycle}
                    </GlowingBadge>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Status</span>
                    </div>
                    <GlowingBadge variant={plan.is_active ? "success" : "slate"}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </GlowingBadge>
                  </div>

                  <div className="flex items-center gap-2 p-2 text-muted-foreground/60">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="text-sm">Created {new Date(plan.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Plan Statistics */}
            <EnhancedCard variant="glass">
              <EnhancedCardHeader className="pb-3">
                <EnhancedCardTitle className="flex items-center gap-2 text-sm font-medium">
                  <UsersIcon className="h-4 w-4 text-blue-500" />
                  User Statistics
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <span className="text-sm">Total Users</span>
                    <span className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{planStats.total_users}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-sm">Users This Month</span>
                    <span className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">+{planStats.users_this_month}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                    <span className="text-sm">Users This Week</span>
                    <span className="text-2xl font-semibold text-cyan-600 dark:text-cyan-400">+{planStats.users_this_week}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                    <span className="text-sm">Users With Projects</span>
                    <span className="text-2xl font-semibold text-purple-600 dark:text-purple-400">{planStats.users_with_projects}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-500/5 border border-slate-500/10">
                    <div className="flex items-center gap-2">
                      <GitBranchIcon className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">Users With GitHub</span>
                    </div>
                    <span className="text-2xl font-semibold">{planStats.users_with_github}</span>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          {/* Users Table */}
          <EnhancedCard variant="glass" hoverEffect={false}>
            <EnhancedCardHeader className="pb-3">
              <EnhancedCardTitle className="flex items-center justify-between text-sm font-medium">
                <span className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-blue-500" />
                  Users on This Plan
                </span>
                <GlowingBadge variant="info">{subscribers?.total || 0} total</GlowingBadge>
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="rounded-xl border border-border/30 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="text-muted-foreground/70">Name</TableHead>
                      <TableHead className="text-muted-foreground/70">Email</TableHead>
                      <TableHead className="text-muted-foreground/70">Projects</TableHead>
                      <TableHead className="text-muted-foreground/70">Joined</TableHead>
                      <TableHead className="text-muted-foreground/70">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers?.data?.map((user) => (
                      <TableRow key={user.id} className="group border-border/30 transition-all duration-200 hover:bg-primary/[0.03]">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover ring-2 ring-border/40" />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            {user.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground/70">{user.email}</TableCell>
                        <TableCell>
                          <GlowingBadge variant="purple" size="sm">
                            <FolderIcon className="h-3 w-3 mr-1" />
                            {user.projects_count}
                          </GlowingBadge>
                        </TableCell>
                        <TableCell className="text-muted-foreground/60 tabular-nums">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => router.visit(`/admin/users/${user.id}`)}
                            variant="outline"
                            size="sm"
                            className="gap-2 border-border/40 bg-card/30 transition-all hover:bg-card/60"
                          >
                            <ExternalLinkIcon className="h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          {(!subscribers?.data || subscribers.data.length === 0) && (
            <EnhancedCard variant="glass" className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-muted/30 p-4">
                  <UsersIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">No users on this plan</p>
              </div>
            </EnhancedCard>
          )}

          {/* Pagination info */}
          {subscribers?.total && subscribers.total > 0 && (
            <div className="flex justify-center">
              <p className="rounded-lg border border-border/30 bg-card/30 px-4 py-2 text-sm text-muted-foreground/60 backdrop-blur-sm">
                Showing <span className="font-medium text-foreground/80">{subscribers.from || 0}</span> to <span className="font-medium text-foreground/80">{subscribers.to || 0}</span> of <span className="font-medium text-foreground/80">{subscribers.total}</span> users
              </p>
            </div>
          )}
        </div>
    </AppLayout>
  );
}
