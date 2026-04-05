import { PaginationControls } from '@/components/PaginationControls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, PageHeader, GlowingBadge } from '@/components/ui/futuristic';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { MailIcon, SendIcon, UsersIcon, SearchIcon, XIcon, CheckIcon, CheckCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Send Email',
        href: '/admin/emails',
    },
];

export default function EmailIndex({ users, filters }: Props) {
    const { toast } = useToast();
    useFlashToasts();
    const [search, setSearch] = useState(filters.search || '');
    const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        user_ids: [] as number[],
        subject: '',
        message: '',
    });

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/admin/emails', search ? { search } : {}, { preserveState: true });
        }
    };

    const clearSearch = () => {
        setSearch('');
        router.get('/admin/emails');
    };

    const toggleUserSelection = (userId: number) => {
        const newSelection = new Set(selectedUserIds);
        if (newSelection.has(userId)) {
            newSelection.delete(userId);
        } else {
            newSelection.add(userId);
        }
        setSelectedUserIds(newSelection);
        setSelectAll(false);
    };

    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedUserIds(new Set());
            setSelectAll(false);
        } else {
            const allIds = new Set(users.data.map(u => u.id));
            setSelectedUserIds(allIds);
            setSelectAll(true);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedUserIds.size === 0) {
            toast({
                title: 'No recipients selected',
                description: 'Please select at least one user to send the email to.',
                variant: 'destructive',
            });
            return;
        }

        const userIdsArray = Array.from(selectedUserIds);
        setData('user_ids', userIdsArray);
        
        post('/admin/emails/send', {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedUserIds(new Set());
                setSelectAll(false);
                reset();
                toast({
                    title: 'Email sent successfully',
                    description: `Email queued for ${userIdsArray.length} recipient${userIdsArray.length > 1 ? 's' : ''}.`,
                });
            },
            onError: (errors) => {
                toast({
                    title: 'Failed to send email',
                    description: errors.user_ids || errors.subject || errors.message || 'Something went wrong. Please try again.',
                    variant: 'destructive',
                });
            },
        });
    };

    const selectedUsers = Array.from(selectedUserIds)
        .map(id => users.data.find(u => u.id === id))
        .filter(Boolean) as User[];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Send Email" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Page Header */}
                <PageHeader
                    title="Send Email"
                    greeting="Email Management"
                    icon={MailIcon}
                    iconClassName="text-pink-500"
                    showDate={false}
                    quickStats={[
                        { label: 'Total Users', value: users.total },
                        { label: 'Selected', value: selectedUserIds.size, highlight: selectedUserIds.size > 0 },
                    ]}
                />

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <EnhancedCard variant="gradient" glowColor="blue">
                        <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                            <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Total Users</EnhancedCardTitle>
                            <div className="rounded-xl bg-blue-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/20">
                                <UsersIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </EnhancedCardHeader>
                        <EnhancedCardContent>
                            <div className="text-3xl font-bold tabular-nums tracking-tight">{users.total.toLocaleString()}</div>
                            <p className="mt-1 text-xs text-muted-foreground/60">Available recipients</p>
                        </EnhancedCardContent>
                    </EnhancedCard>

                    <EnhancedCard variant="gradient" glowColor="emerald">
                        <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                            <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">Selected</EnhancedCardTitle>
                            <div className="rounded-xl bg-emerald-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20">
                                <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </EnhancedCardHeader>
                        <EnhancedCardContent>
                            <div className="text-3xl font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">{selectedUserIds.size}</div>
                            <p className="mt-1 text-xs text-muted-foreground/60">Recipients chosen</p>
                        </EnhancedCardContent>
                    </EnhancedCard>

                    <EnhancedCard variant="gradient" glowColor="amber">
                        <EnhancedCardHeader className="flex flex-row items-center justify-between pb-2">
                            <EnhancedCardTitle className="text-sm font-medium text-muted-foreground/80">On This Page</EnhancedCardTitle>
                            <div className="rounded-xl bg-amber-500/10 p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500/20">
                                <MailIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                        </EnhancedCardHeader>
                        <EnhancedCardContent>
                            <div className="text-3xl font-bold tabular-nums tracking-tight">{users.data.length}</div>
                            <p className="mt-1 text-xs text-muted-foreground/60">Showing on current page</p>
                        </EnhancedCardContent>
                    </EnhancedCard>
                </div>

                {/* Selected Recipients */}
                {selectedUsers.length > 0 && (
                    <EnhancedCard variant="gradient" glowColor="emerald">
                        <EnhancedCardHeader className="pb-3">
                            <EnhancedCardTitle className="flex items-center gap-2 text-sm font-medium">
                                <div className="rounded-lg bg-emerald-500/10 p-1.5">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                                </div>
                                Selected Recipients ({selectedUsers.length})
                            </EnhancedCardTitle>
                        </EnhancedCardHeader>
                        <EnhancedCardContent>
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map(user => (
                                    <GlowingBadge
                                        key={user.id}
                                        variant="info"
                                        className="group flex items-center gap-1.5 pr-1"
                                    >
                                        <span>{user.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleUserSelection(user.id)}
                                            className="rounded-full p-0.5 transition-colors hover:bg-white/20"
                                        >
                                            <XIcon className="h-3 w-3" />
                                        </button>
                                    </GlowingBadge>
                                ))}
                            </div>
                        </EnhancedCardContent>
                    </EnhancedCard>
                )}

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
                                <TableHead className="w-12">
                                    <button
                                        type="button"
                                        onClick={toggleSelectAll}
                                        className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                                            selectAll
                                                ? 'border-primary bg-primary'
                                                : 'border-border hover:border-primary/50 hover:bg-primary/10'
                                        }`}
                                    >
                                        {selectAll && <CheckIcon className="h-4 w-4 text-white" />}
                                    </button>
                                </TableHead>
                                <TableHead className="text-muted-foreground/70">User</TableHead>
                                <TableHead className="text-muted-foreground/70">Email</TableHead>
                                <TableHead className="w-24 text-muted-foreground/70">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.map((user) => (
                                <TableRow 
                                    key={user.id}
                                    className="group cursor-pointer border-border/30 transition-all duration-200 hover:bg-primary/[0.03]"
                                    onClick={() => toggleUserSelection(user.id)}
                                >
                                    <TableCell>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleUserSelection(user.id);
                                            }}
                                            className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                                                selectedUserIds.has(user.id)
                                                    ? 'border-primary bg-primary'
                                                    : 'border-border hover:border-primary/50 hover:bg-primary/10'
                                            }`}
                                        >
                                            {selectedUserIds.has(user.id) && (
                                                <CheckIcon className="h-4 w-4 text-white" />
                                            )}
                                        </button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-medium text-primary/70 ring-2 ring-border/20 transition-all duration-300 group-hover:ring-primary/30">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-foreground/90 transition-colors duration-200 group-hover:text-foreground">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground/70">{user.email}</TableCell>
                                    <TableCell>
                                        <GlowingBadge
                                            variant={selectedUserIds.has(user.id) ? "success" : "slate"}
                                            size="sm"
                                        >
                                            {selectedUserIds.has(user.id) ? "Selected" : "—"}
                                        </GlowingBadge>
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
                    data={users}
                    baseUrl="/admin/emails"
                    preserveFilters={{
                        search: search || undefined,
                    }}
                />

                {/* Compose Email */}
                <EnhancedCard variant="gradient" glowColor="pink" hoverEffect={false}>
                    <EnhancedCardHeader>
                        <EnhancedCardTitle className="flex items-center gap-2">
                            <div className="rounded-lg bg-pink-500/10 p-1.5">
                                <SendIcon className="h-4 w-4 text-pink-500" />
                            </div>
                            Compose Email
                        </EnhancedCardTitle>
                    </EnhancedCardHeader>
                    <EnhancedCardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Subject */}
                            <div className="space-y-2">
                                <Label htmlFor="subject" className="text-sm font-medium">
                                    Subject <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="subject"
                                    type="text"
                                    placeholder="Enter email subject..."
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    className="border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-card/80"
                                    required
                                />
                                {errors.subject && (
                                    <p className="text-sm text-destructive">{errors.subject}</p>
                                )}
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-sm font-medium">
                                    Message <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="message"
                                    placeholder="Enter your message..."
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={8}
                                    className="resize-none border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-card/80"
                                    required
                                />
                                {errors.message && (
                                    <p className="text-sm text-destructive">{errors.message}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {data.message.length} / 10,000 characters
                                </p>
                            </div>

                            {/* Submit */}
                            <div className="flex items-center justify-between border-t border-border/40 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedUserIds(new Set());
                                        setSelectAll(false);
                                        reset();
                                    }}
                                    disabled={processing}
                                    className="border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card/80"
                                >
                                    Clear All
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || selectedUserIds.size === 0}
                                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                                >
                                    {processing ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <SendIcon className="h-4 w-4" />
                                            Send to {selectedUserIds.size} User{selectedUserIds.size !== 1 ? 's' : ''}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </EnhancedCardContent>
                </EnhancedCard>
            </div>
        </AppLayout>
    );
}
