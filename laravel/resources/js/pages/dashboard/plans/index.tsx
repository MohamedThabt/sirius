import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { AlertCircle, CreditCard, Eye } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Plan {
  id: number;
  name: string;
  monthly_price: string;
  monthly_credits: number;
  users_count: number;
  created_at: string;
}

interface PlanSummary {
  total: number;
  total_users: number;
  users_with_plans: number;
  users_without_plans: number;
}

interface UsersPerPlan {
  plan_id: number;
  plan_name: string;
  user_count: number;
  users_this_month: number;
}

interface IndexProps {
  plans: {
    data: Plan[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  filters: {
    search?: string;
  };
  summary: PlanSummary;
  usersPerPlan: UsersPerPlan[];
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
];

const PlansIndex = ({ plans, filters, summary, usersPerPlan }: IndexProps) => {
  const [search, setSearch] = useState(filters.search || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get("/admin/plans", {
      search: search || undefined,
    }, { preserveState: true });
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numPrice);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Plans" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
          <div className="flex gap-2">
            <Badge variant="outline">{summary.total} Plans</Badge>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {summary.total_users} Total Users
            </Badge>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
              {summary.users_with_plans} With Plans
            </Badge>
            {summary.users_without_plans > 0 && (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                {summary.users_without_plans} Without Plans
              </Badge>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_users}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users With Plans</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.users_with_plans}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users Without Plans</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.users_without_plans}</div>
            </CardContent>
          </Card>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search by plan name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit">Search</Button>
          {search && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch('');
                router.get('/admin/plans');
              }}
            >
              Clear
            </Button>
          )}
        </form>

        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Monthly Price</TableHead>
                <TableHead>Monthly Credits</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.data.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    {plan.name}
                  </TableCell>
                  <TableCell>{formatPrice(plan.monthly_price)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {plan.monthly_credits} credits
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {plan.users_count} users
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(plan.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => router.visit(`/admin/plans/${plan.id}`)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {plans.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No plans found</p>
            {search && <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>}
          </div>
        )}

        {/* Pagination info */}
        {plans.total > 0 && (
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Showing {plans.from || 0} to {plans.to || 0} of {plans.total} plans
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PlansIndex;
