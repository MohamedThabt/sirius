import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { AlertCircle, CreditCard, Eye, Pencil, UsersIcon, SearchIcon, XIcon, TrendingUpIcon, CoinsIcon, SparklesIcon } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FuturisticBackground, EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, PageHeader, GlowingBadge } from '@/components/ui/futuristic';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddPlanModal } from "./components/AddPlanModal";
import { EditPlanModal } from "./components/EditPlanModal";
import { PaginationControls } from '@/components/PaginationControls';

interface Plan {
  id: number;
  name: string;
  slug: string;
  price: string;
  credits_per_cycle: number;
  billing_cycle: string;
  is_active: boolean;
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

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
      
      <FuturisticBackground className="min-h-full" showDots={true}>
        <div className="flex h-full flex-1 flex-col gap-6 p-6">
          {/* Page Header */}
          <PageHeader
            title="Subscription Plans"
            greeting="Revenue Management"
            icon={CreditCard}
            iconClassName="text-emerald-500"
            showDate={false}
            quickStats={[
              { label: 'Plans', value: summary.total },
              { label: 'Subscribers', value: summary.users_with_plans },
              { label: 'Total Users', value: summary.total_users },
            ]}
            actions={<AddPlanModal />}
          />

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <EnhancedCard variant="gradient" glowColor="purple">
              <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Total Plans</EnhancedCardTitle>
                <div className="rounded-xl bg-purple-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-500/20">
                  <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-bold tabular-nums tracking-tight">{summary.total}</div>
                <p className="mt-1 text-xs text-muted-foreground/60">Active offerings</p>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="gradient" glowColor="blue">
              <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Total Users</EnhancedCardTitle>
                <div className="rounded-xl bg-blue-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/20">
                  <UsersIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-bold tabular-nums tracking-tight">{summary.total_users.toLocaleString()}</div>
                <p className="mt-1 text-xs text-muted-foreground/60">Platform users</p>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="gradient" glowColor="emerald">
              <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">With Plans</EnhancedCardTitle>
                <div className="rounded-xl bg-emerald-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20">
                  <TrendingUpIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">{summary.users_with_plans.toLocaleString()}</div>
                <p className="mt-1 text-xs text-muted-foreground/60">Paying subscribers</p>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="gradient" glowColor="amber">
              <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Without Plans</EnhancedCardTitle>
                <div className="rounded-xl bg-amber-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500/20">
                  <CoinsIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-bold tabular-nums tracking-tight">{summary.users_without_plans.toLocaleString()}</div>
                <p className="mt-1 text-xs text-muted-foreground/60">Free tier users</p>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative max-w-md flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                type="text"
                placeholder="Search by plan name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-border/40 bg-card/50 pl-10 backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-card/80"
              />
            </div>
            <Button type="submit" variant="secondary" className="border-border/40 bg-card/50 backdrop-blur-sm">
              Search
            </Button>
            {search && (
              <Button
                type="button"
                variant="outline"
                className="border-border/40 bg-card/50 backdrop-blur-sm"
                onClick={() => {
                  setSearch('');
                  router.get('/admin/plans');
                }}
              >
                <XIcon className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </form>

          {/* Plans Table */}
          <EnhancedCard variant="glass" hoverEffect={false} className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-muted-foreground/70">Name</TableHead>
                  <TableHead className="text-muted-foreground/70">Price</TableHead>
                  <TableHead className="text-muted-foreground/70">Credits/Cycle</TableHead>
                  <TableHead className="text-muted-foreground/70">Billing Cycle</TableHead>
                  <TableHead className="text-muted-foreground/70">Status</TableHead>
                  <TableHead className="text-muted-foreground/70">Users</TableHead>
                  <TableHead className="text-muted-foreground/70">Created At</TableHead>
                  <TableHead className="text-muted-foreground/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.data.map((plan) => (
                  <TableRow key={plan.id} className="group border-border/30 transition-all duration-200 hover:bg-primary/[0.03]">
                    <TableCell className="font-medium text-foreground/90">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                          <SparklesIcon className="h-4 w-4 text-primary/70" />
                        </div>
                        {plan.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-lg font-semibold text-foreground/90">{formatPrice(plan.price)}</span>
                    </TableCell>
                    <TableCell>
                      <GlowingBadge variant="purple" size="sm">
                        {plan.credits_per_cycle} credits
                      </GlowingBadge>
                    </TableCell>
                    <TableCell>
                      <GlowingBadge variant="info" size="sm" className="capitalize">
                        {plan.billing_cycle}
                      </GlowingBadge>
                    </TableCell>
                    <TableCell>
                      <GlowingBadge 
                        variant={plan.is_active ? "success" : "slate"} 
                        size="sm"
                      >
                        {plan.is_active ? "Active" : "Inactive"}
                      </GlowingBadge>
                    </TableCell>
                    <TableCell>
                      <GlowingBadge variant="cyan" size="sm">
                        {plan.users_count} users
                      </GlowingBadge>
                    </TableCell>
                    <TableCell className="text-muted-foreground/60 tabular-nums">
                      {new Date(plan.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedPlan(plan);
                            setEditModalOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="gap-2 border-border/40 bg-card/30 transition-all hover:bg-card/60"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => router.visit(`/admin/plans/${plan.id}`)}
                          variant="outline"
                          size="sm"
                          className="gap-2 border-border/40 bg-card/30 transition-all hover:bg-card/60"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </EnhancedCard>

          {plans.data.length === 0 && (
            <EnhancedCard variant="glass" className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-muted/30 p-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">No plans found</p>
                {search && <p className="mt-1 text-sm text-muted-foreground/60">Try adjusting your search criteria</p>}
              </div>
            </EnhancedCard>
          )}

          {/* Pagination */}
          <PaginationControls 
            data={plans} 
            baseUrl="/admin/plans"
            preserveFilters={{
              search: search || undefined,
            }}
          />
        </div>
      </FuturisticBackground>

      {/* Edit Plan Modal */}
      {selectedPlan && (
        <EditPlanModal
          plan={selectedPlan}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
        />
      )}
    </AppLayout>
  );
};

export default PlansIndex;
