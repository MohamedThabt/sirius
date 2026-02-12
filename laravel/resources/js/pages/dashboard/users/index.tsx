import { PaginationControls } from '@/components/PaginationControls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, PageHeader, GlowingBadge } from '@/components/ui/futuristic';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ClientDateTime } from '@/components/ClientDateTime';
import { UsersIcon, FolderIcon, GitBranchIcon, TrendingUpIcon, SearchIcon, XIcon, ExternalLinkIcon, Trash2Icon, AlertTriangleIcon } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    projects_count: number;
    avatar?: string;
}

interface Summary {
    total: number;
    with_projects: number;
    this_month: number;
    with_github: number;
}

interface Props {
    users: {
        data: User[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
    };
    summary: Summary;
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
];

export default function UsersIndex({ users, filters, summary }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { toast } = useToast();

    const handleDeleteClick = (user: User, e: React.MouseEvent) => {
        e.stopPropagation();
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!userToDelete) return;

        router.delete(`/admin/users/${userToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setUserToDelete(null);
                toast({
                    title: "User deleted",
                    description: `${userToDelete.name} has been successfully deleted.`,
                    variant: "default",
                });
            },
            onError: () => {
                setIsDeleteDialogOpen(false);
                toast({
                    title: "Error",
                    description: "Failed to delete user. Please try again.",
                    variant: "destructive",
                });
            }
        });
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/admin/users', search ? { search } : {}, { preserveState: true });
        }
    };

    const clearSearch = () => {
        setSearch('');
        router.get('/admin/users');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    {/* Page Header */}
                    <PageHeader
                        title="User Management"
                        greeting="Platform Users"
                        icon={UsersIcon}
                        iconClassName="text-blue-500"
                        showDate={false}
                        quickStats={[
                            { label: 'Total', value: summary.total },
                            { label: 'Active', value: summary.with_projects },
                            { label: 'This Month', value: summary.this_month, highlight: true },
                        ]}
                    />

                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <EnhancedCard variant="gradient" glowColor="blue">
                            <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Total Users</EnhancedCardTitle>
                                <div className="rounded-xl bg-blue-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/20">
                                    <UsersIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                            </EnhancedCardHeader>
                            <EnhancedCardContent>
                                <div className="text-3xl font-bold tabular-nums tracking-tight">{summary.total.toLocaleString()}</div>
                                <p className="mt-1 text-xs text-muted-foreground/60">Registered accounts</p>
                            </EnhancedCardContent>
                        </EnhancedCard>

                        <EnhancedCard variant="gradient" glowColor="amber">
                            <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">With Projects</EnhancedCardTitle>
                                <div className="rounded-xl bg-amber-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500/20">
                                    <FolderIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                            </EnhancedCardHeader>
                            <EnhancedCardContent>
                                <div className="text-3xl font-bold tabular-nums tracking-tight">{summary.with_projects.toLocaleString()}</div>
                                <p className="mt-1 text-xs text-muted-foreground/60">Active creators</p>
                            </EnhancedCardContent>
                        </EnhancedCard>

                        <EnhancedCard variant="gradient" glowColor="emerald">
                            <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">This Month</EnhancedCardTitle>
                                <div className="rounded-xl bg-emerald-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20">
                                    <TrendingUpIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </EnhancedCardHeader>
                            <EnhancedCardContent>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">+{summary.this_month.toLocaleString()}</span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground/60">New signups</p>
                            </EnhancedCardContent>
                        </EnhancedCard>

                        <EnhancedCard variant="gradient" glowColor="purple">
                            <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                                <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">With GitHub</EnhancedCardTitle>
                                <div className="rounded-xl bg-purple-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-500/20">
                                    <GitBranchIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                            </EnhancedCardHeader>
                            <EnhancedCardContent>
                                <div className="text-3xl font-bold tabular-nums tracking-tight">{summary.with_github.toLocaleString()}</div>
                                <p className="mt-1 text-xs text-muted-foreground/60">Connected accounts</p>
                            </EnhancedCardContent>
                        </EnhancedCard>
                    </div>

                    {/* Search Bar */}
                    <div className="flex gap-3">
                        <div className="relative max-w-md flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                            <Input
                                type="text"
                                placeholder="Search users by name or email... (Press Enter)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="border-border/40 bg-card/50 pl-10 backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-card/80"
                            />
                        </div>
                        {search && (
                            <Button 
                                variant="outline" 
                                onClick={clearSearch}
                                className="border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card/80"
                            >
                                <XIcon className="mr-2 h-4 w-4" />
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* Users Table */}
                    <EnhancedCard variant="glass" hoverEffect={false} className="overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/40 hover:bg-transparent">
                                    <TableHead className="text-muted-foreground/70">User</TableHead>
                                    <TableHead className="text-muted-foreground/70">Email</TableHead>
                                    <TableHead className="text-muted-foreground/70">Projects</TableHead>
                                    <TableHead className="text-muted-foreground/70">Joined</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.map((user) => (
                                    <TableRow 
                                        key={user.id}
                                        className="group cursor-pointer border-border/30 transition-all duration-200 hover:bg-primary/[0.03]"
                                        onClick={() => router.visit(`/admin/users/${user.id}`)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <img 
                                                        src={user.avatar} 
                                                        alt={user.name} 
                                                        className="h-9 w-9 rounded-full ring-2 ring-border/20 transition-all duration-300 group-hover:ring-primary/30" 
                                                    />
                                                ) : (
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-medium text-primary/70 ring-2 ring-border/20 transition-all duration-300 group-hover:ring-primary/30">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="font-medium text-foreground/90 transition-colors duration-200 group-hover:text-foreground">{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground/70">{user.email}</TableCell>
                                        <TableCell>
                                            <GlowingBadge 
                                                variant={user.projects_count > 0 ? "info" : "slate"} 
                                                size="sm"
                                            >
                                                {user.projects_count} projects
                                            </GlowingBadge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground/60 tabular-nums">
                                            <ClientDateTime value={user.created_at} dateStyle="short" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive/70 opacity-0 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                                                    onClick={(e) => handleDeleteClick(user, e)}
                                                >
                                                    <Trash2Icon className="h-4 w-4" />
                                                </Button>
                                                <ExternalLinkIcon className="h-4 w-4 text-muted-foreground/30 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </EnhancedCard>

                    {users.data.length === 0 && (
                        <EnhancedCard variant="glass" className="py-16">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="mb-4 rounded-full bg-muted/30 p-4">
                                    <UsersIcon className="h-8 w-8 text-muted-foreground/30" />
                                </div>
                                <p className="text-lg font-medium text-muted-foreground">No users found</p>
                                {search && <p className="mt-1 text-sm text-muted-foreground/60">Try adjusting your search criteria</p>}
                            </div>
                        </EnhancedCard>
                    )}

                    {/* Pagination */}
                    <PaginationControls
                        data={{
                            current_page: users.meta?.current_page || 1,
                            last_page: users.meta?.last_page || 1,
                            from: users.meta?.from,
                            to: users.meta?.to,
                            total: users.meta?.total || 0,
                        }}
                        baseUrl="/admin/users"
                        preserveFilters={{
                            search: search || undefined,
                        }}
                    />
                </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="border-destructive/20 bg-background/95 backdrop-blur-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangleIcon className="h-5 w-5" />
                            Delete User
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete <span className="font-medium text-foreground">{userToDelete?.name}</span>? 
                            This action cannot be undone and will permanently remove their account, projects, and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-border/50 bg-transparent hover:bg-muted/50">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
