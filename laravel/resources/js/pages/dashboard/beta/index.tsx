import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import { ClientDateTime } from '@/components/ClientDateTime';
import { Check, X, AlertCircle, UserPlus, SearchIcon, FilterIcon, SparklesIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FuturisticBackground, EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, PageHeader, GlowingBadge } from '@/components/ui/futuristic';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BetaInvitation {
  id: number;
  name: string;
  email: string;
  status: "pending" | "approved" | "denied";
  note?: string;
  invited_by?: {
    id: number;
    name: string;
  };
  approved_at?: string;
  created_at: string;
}

interface BetaSummary {
  total: number;
  pending: number;
  approved: number;
  denied: number;
  this_week: number;
  this_month: number;
}

interface IndexProps {
  invitations: {
    data: BetaInvitation[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  filters: {
    search?: string;
    status?: string;
  };
  statuses: Array<{ value: string; label: string }>;
  summary?: BetaSummary;
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    title: 'Beta Invitations',
    href: '/admin/beta',
  },
];

const BetaIndex = ({ invitations, filters, statuses, summary }: IndexProps) => {
  const [search, setSearch] = useState(filters.search || "");
  const [statusFilter, setStatusFilter] = useState(filters.status || "");
  const [approveLoading, setApproveLoading] = useState<number | null>(null);
  const [denyLoading, setDenyLoading] = useState<number | null>(null);
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<number | null>(null);
  const [denyNote, setDenyNote] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
  });

  const handleCreateInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    post("/admin/beta/create", {
      onSuccess: () => {
        setCreateModalOpen(false);
        reset();
      },
    });
  };

  const handleApprove = (invitationId: number) => {
    setApproveLoading(invitationId);
    router.post(
      `/admin/beta/${invitationId}/approve`,
      {},
      {
        onFinish: () => setApproveLoading(null),
      }
    );
  };

  const openDenyModal = (invitationId: number) => {
    setSelectedInvitation(invitationId);
    setDenyNote("");
    setDenyModalOpen(true);
  };

  const openDeleteModal = (invitationId: number) => {
    setSelectedInvitation(invitationId);
    setDeleteModalOpen(true);
  };

  const handleDeny = () => {
    if (selectedInvitation === null) return;
    
    setDenyLoading(selectedInvitation);
    router.post(
      `/admin/beta/${selectedInvitation}/deny`,
      { note: denyNote || "" },
      {
        onFinish: () => {
          setDenyLoading(null);
          setDenyModalOpen(false);
          setSelectedInvitation(null);
          setDenyNote("");
        },
      }
    );
  };

  const handleDelete = () => {
    if (selectedInvitation === null) return;

    setDeleteLoading(selectedInvitation);
    router.delete(
      `/admin/beta/${selectedInvitation}`,
      {
        onFinish: () => {
          setDeleteLoading(null);
          setDeleteModalOpen(false);
          setSelectedInvitation(null);
        },
      }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get("/admin/beta", {
      search: search || undefined,
      status: statusFilter || undefined,
    }, { preserveState: true });
  };

  const getStatusVariant = (status: string): "warning" | "success" | "danger" | "slate" => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "denied":
        return "danger";
      default:
        return "slate";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon className="h-3 w-3" />;
      case "denied":
        return <XCircleIcon className="h-3 w-3" />;
      case "pending":
        return <ClockIcon className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Use summary from controller if available, otherwise calculate locally
  const totalPending = summary?.pending ?? invitations.data.filter((i) => i.status === "pending").length;
  const totalApproved = summary?.approved ?? invitations.data.filter((i) => i.status === "approved").length;
  const totalDenied = summary?.denied ?? invitations.data.filter((i) => i.status === "denied").length;
  const totalInvitations = summary?.total ?? invitations.total;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Beta Invitations" />
      
      <FuturisticBackground className="min-h-full" showDots={true}>
        <div className="flex h-full flex-1 flex-col gap-6 p-6">
          {/* Page Header */}
          <PageHeader
            title="Beta Invitations"
            greeting="Access Management"
            icon={SparklesIcon}
            iconClassName="text-purple-500"
            showDate={false}
            quickStats={[
              { label: 'Total', value: totalInvitations },
              { label: 'Pending', value: totalPending },
              { label: 'This Week', value: summary?.this_week || 0, highlight: true },
            ]}
            actions={
              <Button 
                onClick={() => setCreateModalOpen(true)} 
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                <UserPlus className="h-4 w-4" />
                Create Invitation
              </Button>
            }
          />

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <EnhancedCard variant="gradient" glowColor="blue">
              <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Total Invitations</EnhancedCardTitle>
                <div className="rounded-xl bg-blue-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/20">
                  <SparklesIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-bold tabular-nums tracking-tight">{totalInvitations.toLocaleString()}</div>
                <p className="mt-1 text-xs text-muted-foreground/60">All time requests</p>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="gradient" glowColor="amber">
              <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Pending</EnhancedCardTitle>
                <div className="rounded-xl bg-amber-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500/20">
                  <ClockIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-bold tabular-nums tracking-tight text-amber-600 dark:text-amber-400">{totalPending.toLocaleString()}</div>
                <p className="mt-1 text-xs text-muted-foreground/60">Awaiting review</p>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="gradient" glowColor="emerald">
              <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Approved</EnhancedCardTitle>
                <div className="rounded-xl bg-emerald-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">{totalApproved.toLocaleString()}</div>
                <p className="mt-1 text-xs text-muted-foreground/60">Granted access</p>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="gradient" glowColor="pink">
              <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Denied</EnhancedCardTitle>
                <div className="rounded-xl bg-red-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-red-500/20">
                  <XCircleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-bold tabular-nums tracking-tight text-red-600 dark:text-red-400">{totalDenied.toLocaleString()}</div>
                <p className="mt-1 text-xs text-muted-foreground/60">Declined requests</p>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          {/* Search and Filter */}
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
            <div className="relative max-w-md flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-border/40 bg-card/50 pl-10 backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-card/80"
              />
            </div>
            <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[180px] border-border/40 bg-card/50 backdrop-blur-sm">
                <FilterIcon className="mr-2 h-4 w-4 text-muted-foreground/50" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary" className="border-border/40 bg-card/50 backdrop-blur-sm">
              Filter
            </Button>
            {(search || statusFilter) && (
              <Button
                type="button"
                variant="outline"
                className="border-border/40 bg-card/50 backdrop-blur-sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  router.get('/admin/beta');
                }}
              >
                Clear
              </Button>
            )}
          </form>

          {/* Invitations Table */}
          <EnhancedCard variant="glass" hoverEffect={false} className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-muted-foreground/70">Name</TableHead>
                  <TableHead className="text-muted-foreground/70">Email</TableHead>
                  <TableHead className="text-muted-foreground/70">Status</TableHead>
                  <TableHead className="text-muted-foreground/70">Applied</TableHead>
                  <TableHead className="text-muted-foreground/70">Approved By</TableHead>
                  <TableHead className="text-muted-foreground/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.data.map((invitation) => (
                  <TableRow key={invitation.id} className="group border-border/30 transition-all duration-200 hover:bg-primary/[0.03]">
                    <TableCell className="font-medium text-foreground/90">
                      {invitation.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground/70">{invitation.email}</TableCell>
                    <TableCell>
                      <GlowingBadge
                        variant={getStatusVariant(invitation.status)}
                        icon={getStatusIcon(invitation.status)}
                      >
                        {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                      </GlowingBadge>
                    </TableCell>
                    <TableCell className="text-muted-foreground/60 tabular-nums">
                      <ClientDateTime value={invitation.created_at} dateStyle="short" />
                    </TableCell>
                    <TableCell className="text-muted-foreground/60">{invitation.invited_by?.name || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {invitation.status === "pending" && (
                          <>
                            <Button
                              onClick={() => handleApprove(invitation.id)}
                              disabled={approveLoading === invitation.id}
                              variant="outline"
                              size="sm"
                              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/20 dark:text-emerald-400"
                            >
                              <Check className="mr-1 h-4 w-4" />
                              {approveLoading === invitation.id ? "..." : "Approve"}
                            </Button>
                            <Button
                              onClick={() => openDenyModal(invitation.id)}
                              disabled={denyLoading === invitation.id}
                              variant="outline"
                              size="sm"
                              className="border-red-500/30 bg-red-500/10 text-red-600 transition-all hover:border-red-500/50 hover:bg-red-500/20 dark:text-red-400"
                            >
                              <X className="mr-1 h-4 w-4" />
                              {denyLoading === invitation.id ? "..." : "Deny"}
                            </Button>
                          </>
                        )}
                        {/* Always show delete button */}
                        <Button
                          onClick={() => openDeleteModal(invitation.id)}
                          disabled={deleteLoading === invitation.id}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete Invitation"
                        >
                          <svg
                             xmlns="http://www.w3.org/2000/svg"
                             width="24"
                             height="24"
                             viewBox="0 0 24 24"
                             fill="none"
                             stroke="currentColor"
                             strokeWidth="2"
                             strokeLinecap="round"
                             strokeLinejoin="round"
                             className="h-4 w-4"
                           >
                             <path d="M3 6h18" />
                             <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                             <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                             <line x1="10" x2="10" y1="11" y2="17" />
                             <line x1="14" x2="14" y1="11" y2="17" />
                           </svg>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </EnhancedCard>

          {invitations.data.length === 0 && (
            <EnhancedCard variant="glass" className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-muted/30 p-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">No beta invitations found</p>
                {(search || statusFilter) && <p className="mt-1 text-sm text-muted-foreground/60">Try adjusting your search criteria</p>}
              </div>
            </EnhancedCard>
          )}

          {/* Pagination info */}
          <div className="flex justify-center">
            <p className="rounded-lg border border-border/30 bg-card/30 px-4 py-2 text-sm text-muted-foreground/60 backdrop-blur-sm">
              Showing <span className="font-medium text-foreground/80">{invitations.from || 0}</span> to <span className="font-medium text-foreground/80">{invitations.to || 0}</span> of <span className="font-medium text-foreground/80">{invitations.total}</span> invitations
            </p>
          </div>
        </div>
      </FuturisticBackground>

      {/* Create Invitation Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="border-border/40 bg-card/95 backdrop-blur-xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Create Beta Invitation
            </DialogTitle>
            <DialogDescription>
              Manually create a new beta invitation request. The user will be added to the pending list.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInvitation}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className={`border-border/40 bg-card/50 ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                  className={`border-border/40 bg-card/50 ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-border/40"
                onClick={() => {
                  setCreateModalOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={processing} className="bg-gradient-to-r from-primary to-primary/80">
                {processing ? "Creating..." : "Create Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deny Modal */}
      <Dialog open={denyModalOpen} onOpenChange={setDenyModalOpen}>
        <DialogContent className="border-border/40 bg-card/95 backdrop-blur-xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircleIcon className="h-5 w-5" />
              Deny Beta Invitation
            </DialogTitle>
            <DialogDescription>
              You are about to deny this beta invitation request. You can optionally add a note explaining the reason.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="note" className="text-sm font-medium">
                Note (Optional)
              </label>
              <Textarea
                id="note"
                placeholder="Add a note explaining why this request was denied..."
                value={denyNote}
                onChange={(e) => setDenyNote(e.target.value)}
                rows={4}
                className="resize-none border-border/40 bg-card/50"
              />
              <p className="text-xs text-muted-foreground">
                This note will be saved for internal reference.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border/40"
              onClick={() => {
                setDenyModalOpen(false);
                setDenyNote("");
                setSelectedInvitation(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeny}
              disabled={denyLoading === selectedInvitation}
            >
              {denyLoading === selectedInvitation ? "Denying..." : "Deny Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="border-border/40 bg-card/95 backdrop-blur-xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <svg
                 xmlns="http://www.w3.org/2000/svg"
                 width="24"
                 height="24"
                 viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor"
                 strokeWidth="2"
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 className="h-5 w-5"
               >
                 <path d="M3 6h18" />
                 <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                 <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                 <line x1="10" x2="10" y1="11" y2="17" />
                 <line x1="14" x2="14" y1="11" y2="17" />
               </svg>
              Delete Invitation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this beta invitation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border/40"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedInvitation(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading === selectedInvitation}
            >
              {deleteLoading === selectedInvitation ? "Deleting..." : "Delete Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default BetaIndex;
