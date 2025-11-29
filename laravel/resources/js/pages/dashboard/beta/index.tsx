import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import { Check, X, AlertCircle, UserPlus } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get("/admin/beta", {
      search: search || undefined,
      status: statusFilter || undefined,
    }, { preserveState: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30 dark:text-yellow-400";
      case "approved":
        return "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400";
      case "denied":
        return "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400";
      default:
        return "bg-muted/10 text-muted-foreground border-muted-foreground/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="h-3 w-3" />;
      case "denied":
        return <X className="h-3 w-3" />;
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
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Beta Invitations</h1>
          <div className="flex gap-2">
            <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Create Invitation
            </Button>
            <Badge variant="outline">{totalInvitations} Total</Badge>
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
              {totalPending} Pending
            </Badge>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
              {totalApproved} Approved
            </Badge>
            <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400">
              {totalDenied} Denied
            </Badge>
            {summary?.this_week !== undefined && (
              <Badge variant="outline" className="text-muted-foreground">
                {summary.this_week} this week
              </Badge>
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="w-[180px]">
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
          <Button type="submit">Filter</Button>
          {(search || statusFilter) && (
            <Button
              type="button"
              variant="outline"
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

        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.data.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">
                    {invitation.name}
                  </TableCell>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(invitation.status)}
                    >
                      {getStatusIcon(invitation.status)}
                      <span className={getStatusIcon(invitation.status) ? "ml-1" : ""}>
                        {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(invitation.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{invitation.invited_by?.name || "-"}</TableCell>
                  <TableCell>
                    {invitation.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(invitation.id)}
                          disabled={approveLoading === invitation.id}
                          variant="outline"
                          size="sm"
                          className="bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400"
                        >
                          <Check className="mr-1 h-4 w-4" />
                          {approveLoading === invitation.id ? "Approving..." : "Approve"}
                        </Button>
                        <Button
                          onClick={() => openDenyModal(invitation.id)}
                          disabled={denyLoading === invitation.id}
                          variant="outline"
                          size="sm"
                          className="bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400"
                        >
                          <X className="mr-1 h-4 w-4" />
                          {denyLoading === invitation.id ? "Denying..." : "Deny"}
                        </Button>
                      </div>
                    )}
                    {invitation.status === "approved" && (
                      <span className="text-sm text-green-600 dark:text-green-400">
                        ✓ Approved
                      </span>
                    )}
                    {invitation.status === "denied" && (
                      <div>
                        <span className="text-sm text-red-600 dark:text-red-400">
                          ✗ Denied
                        </span>
                        {invitation.note && (
                          <p
                            className="mt-1 text-xs text-muted-foreground cursor-help"
                            title={invitation.note}
                          >
                            {invitation.note.substring(0, 30)}...
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {invitations.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No beta invitations found</p>
            {(search || statusFilter) && <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>}
          </div>
        )}

        {/* Pagination info */}
        <div className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Showing {invitations.from || 0} to {invitations.to || 0} of {invitations.total} invitations
          </p>
        </div>
      </div>

      {/* Create Invitation Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Beta Invitation</DialogTitle>
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
                  className={errors.name ? "border-red-500" : ""}
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
                  className={errors.email ? "border-red-500" : ""}
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
                onClick={() => {
                  setCreateModalOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? "Creating..." : "Create Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deny Modal */}
      <Dialog open={denyModalOpen} onOpenChange={setDenyModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Deny Beta Invitation</DialogTitle>
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
                className="resize-none"
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
    </AppLayout>
  );
};

export default BetaIndex;
