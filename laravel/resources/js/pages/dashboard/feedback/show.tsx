import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    ClockIcon,
    ExternalLinkIcon,
    LightbulbIcon,
    LockIcon,
    MessageSquareIcon,
    TrashIcon,
    UserIcon,
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Feedback {
    id: number;
    type: string;
    message: string;
    status: string;
    page_url?: string;
    internal_notes?: string;
    created_at: string;
    user: User;
}

interface StatusOption {
    value: string;
    label: string;
}

interface Props {
    feedback: Feedback;
    statuses: StatusOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Feedback',
        href: '/admin/feedback',
    },
    {
        title: 'Feedback Details',
        href: '#',
    },
];

export default function FeedbackShow({ feedback, statuses }: Props) {
    useFlashToasts();

    const statusForm = useForm({
        status: feedback.status,
    });

    const notesForm = useForm({
        internal_notes: feedback.internal_notes || '',
    });

    const handleStatusUpdate = () => {
        statusForm.put(`/admin/feedback/${feedback.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                statusForm.reset();
            },
        });
    };

    const handleNotesUpdate = () => {
        notesForm.put(`/admin/feedback/${feedback.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                notesForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
            router.delete(`/admin/feedback/${feedback.id}`, {
                onSuccess: () => {
                    router.visit('/admin/feedback');
                },
            });
        }
    };

    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'suggestion':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'ux':
                return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
            case 'confusion':
                return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
            default:
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'done':
                return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
            case 'planned':
                return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
            case 'reviewed':
                return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
            case 'new':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            default:
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Feedback: ${feedback.type}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/feedback">
                            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted/50">
                                <ArrowLeftIcon className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
                                    Feedback Details
                                </h1>
                                <Badge variant="outline" className={`${getTypeColor(feedback.type)} px-2.5 py-0.5 text-xs font-medium`}>
                                    {feedback.type}
                                </Badge>
                                <Badge variant="outline" className={`${getStatusColor(feedback.status)} px-2.5 py-0.5 text-xs font-medium`}>
                                    {feedback.status}
                                </Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground/80">
                                Submitted by <span className="font-medium text-foreground/90">{feedback.user.name}</span> on{' '}
                                {new Date(feedback.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                            <TrashIcon className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Update Status */}
                <Card className="group border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                            <div className="rounded-lg bg-primary/10 p-1.5">
                                <CheckCircleIcon className="h-4 w-4 text-primary" />
                            </div>
                            Update Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="min-w-[200px] flex-1">
                                <Label htmlFor="status" className="text-sm font-medium">
                                    Status
                                </Label>
                                <Select value={statusForm.data.status} onValueChange={(value) => statusForm.setData('status', value)}>
                                    <SelectTrigger id="status" className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleStatusUpdate} disabled={statusForm.processing} className="gap-2">
                                    {statusForm.processing ? (
                                        <>
                                            <ClockIcon className="h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="h-4 w-4" />
                                            Update Status
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Feedback Message */}
                        <Card className="group border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                    <div className="rounded-lg bg-blue-500/10 p-1.5">
                                        <MessageSquareIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    Feedback Message
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg bg-muted/30 p-4">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{feedback.message}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Page URL */}
                        {feedback.page_url && (
                            <Card className="group border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                        <div className="rounded-lg bg-purple-500/10 p-1.5">
                                            <ExternalLinkIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        Page URL
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <a
                                        href={feedback.page_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group/link inline-flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm break-all text-primary transition-all hover:bg-muted hover:text-primary/90"
                                    >
                                        <span className="max-w-md truncate">{feedback.page_url}</span>
                                        <ExternalLinkIcon className="h-3.5 w-3.5 flex-shrink-0 opacity-60 transition-opacity group-hover/link:opacity-100" />
                                    </a>
                                </CardContent>
                            </Card>
                        )}

                        {/* Internal Notes */}
                        <Card className="group border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                    <div className="rounded-lg bg-amber-500/10 p-1.5">
                                        <LockIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    Internal Notes
                                </CardTitle>
                                <CardDescription className="mt-1 text-xs">Only visible to admins</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    placeholder="Add internal notes about this feedback..."
                                    value={notesForm.data.internal_notes}
                                    onChange={(e) => notesForm.setData('internal_notes', e.target.value)}
                                    rows={6}
                                    className="resize-none"
                                />
                                {notesForm.errors.internal_notes && <p className="text-xs text-destructive">{notesForm.errors.internal_notes}</p>}
                                <Button onClick={handleNotesUpdate} disabled={notesForm.processing} size="sm" className="gap-2">
                                    {notesForm.processing ? (
                                        <>
                                            <ClockIcon className="h-3.5 w-3.5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="h-3.5 w-3.5" />
                                            Save Notes
                                        </>
                                    )}
                                </Button>
                                {feedback.internal_notes && (
                                    <>
                                        <Separator />
                                        <div className="rounded-lg bg-muted/30 p-4">
                                            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Current notes</p>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{feedback.internal_notes}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* User Info */}
                        <Card className="group border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                    <div className="rounded-lg bg-emerald-500/10 p-1.5">
                                        <UserIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    Submitted By
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                                        <UserIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">{feedback.user.name}</p>
                                        <p className="truncate text-xs text-muted-foreground">{feedback.user.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feedback Stats */}
                        <Card className="group border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                    <div className="rounded-lg bg-indigo-500/10 p-1.5">
                                        <LightbulbIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    Feedback Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                                    <span className="text-sm font-medium text-muted-foreground">Type</span>
                                    <Badge variant="outline" className={`${getTypeColor(feedback.type)} font-medium`}>
                                        {feedback.type}
                                    </Badge>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                                    <Badge variant="outline" className={`${getStatusColor(feedback.status)} font-medium`}>
                                        {feedback.status}
                                    </Badge>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                                    <span className="text-sm font-medium text-muted-foreground">Created</span>
                                    <span className="text-sm font-semibold text-foreground">
                                        {new Date(feedback.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
