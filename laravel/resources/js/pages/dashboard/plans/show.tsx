import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, CreditCard, UsersIcon, CalendarIcon, CoinsIcon, TrendingUpIcon, UserIcon } from 'lucide-react';

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

      <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin/plans">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Plan Details</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{planStats.total_users}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{planStats.users_this_month}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{planStats.users_this_week}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                With Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{planStats.users_with_projects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                With GitHub
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{planStats.users_with_github}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Plan Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <CreditCard className="h-4 w-4" />
                Plan Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">Subscription Plan</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CoinsIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Price</span>
                  </div>
                  <Badge variant="outline" className="text-lg font-semibold">
                    {formatPrice(plan.price)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Credits per Cycle</span>
                  </div>
                  <Badge variant="outline" className="text-lg font-semibold">
                    {plan.credits_per_cycle} credits
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Billing Cycle</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {plan.billing_cycle}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Status</span>
                  </div>
                  <Badge variant={plan.is_active ? "default" : "secondary"}>
                    {plan.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Created {new Date(plan.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Statistics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <UsersIcon className="h-4 w-4" />
                User Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Users</span>
                  <span className="text-2xl font-semibold">{planStats.total_users}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Users This Month</span>
                  <span className="text-2xl font-semibold">{planStats.users_this_month}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Users This Week</span>
                  <span className="text-2xl font-semibold">{planStats.users_this_week}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Users With Projects</span>
                  <span className="text-2xl font-semibold">{planStats.users_with_projects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Users With GitHub</span>
                  <span className="text-2xl font-semibold">{planStats.users_with_github}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Users on This Plan
              </span>
              <Badge variant="outline">{subscribers?.total || 0} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
              <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers?.data?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.projects_count} projects
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => router.visit(`/admin/users/${user.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>

        {(!subscribers?.data || subscribers.data.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UsersIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">No users on this plan</p>
            </CardContent>
          </Card>
        )}

        {/* Pagination info */}
        {subscribers?.total && subscribers.total > 0 && (
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Showing {subscribers.from || 0} to {subscribers.to || 0} of {subscribers.total} users
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
