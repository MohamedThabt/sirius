import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, ImageIcon, Maximize2Icon, MessageSquareIcon, TrashIcon, UserIcon } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Admin {
    id: number;
    name: string;
}

interface Comment {
    id: number;
    comment: string;
    created_at: string;
    admin: Admin;
}

interface Issue {
    id: number;
    title: string;
    description: string;
    steps?: string;
    expected?: string;
    actual?: string;
    severity: string;
    status: string;
    page_url?: string;
    screenshot_path?: string;
    screenshot_url?: string;
    meta?: Record<string, unknown>;
    created_at: string;
    user: User;
    comments: Comment[];
}

interface SeverityOption {
    value: string;
    label: string;
}

interface StatusOption {
    value: string;
    label: string;
}

interface Props {
    issue: Issue;
    severities: SeverityOption[];
    statuses: StatusOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Issues',
        href: '/admin/issues',
    },
    {
        title: 'Issue Details',
        href: '#',
    },
];

export default function IssueShow({ issue, severities, statuses }: Props) {
    useFlashToasts();
    const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);

    const statusForm = useForm({
        status: issue.status,
        severity: issue.severity,
    });

    const commentForm = useForm({
        comment: '',
    });

    const handleStatusUpdate = () => {
        statusForm.put(`/admin/issues/${issue.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                statusForm.reset();
            },
        });
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        commentForm.post(`/admin/issues/${issue.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => {
                commentForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
            router.delete(`/admin/issues/${issue.id}`, {
                onSuccess: () => {
                    router.visit('/admin/issues');
                },
            });
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'blocker':
                return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
            case 'high':
                return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
            case 'medium':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'low':
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'fixed':
                return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
            case 'investigating':
                return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
            case 'open':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'wont_fix':
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
        }
    };

    // All comments are visible to admins
    const allComments = issue.comments;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Issue: ${issue.title}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/issues">
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <ArrowLeftIcon className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{issue.title}</h1>
                                <Badge variant="outline" className={`${getSeverityColor(issue.severity)} text-xs font-medium`}>
                                    {issue.severity}
                                </Badge>
                                <Badge variant="outline" className={`${getStatusColor(issue.status)} text-xs font-medium`}>
                                    {issue.status.replace('_', ' ')}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Reported by {issue.user.name} on {new Date(issue.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Update Status/Severity */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Update Issue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="min-w-[200px] flex-1">
                                <Label htmlFor="status">Status</Label>
                                <Select value={statusForm.data.status} onValueChange={(value) => statusForm.setData('status', value)}>
                                    <SelectTrigger id="status" className="mt-1">
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
                            <div className="min-w-[200px] flex-1">
                                <Label htmlFor="severity">Severity</Label>
                                <Select value={statusForm.data.severity} onValueChange={(value) => statusForm.setData('severity', value)}>
                                    <SelectTrigger id="severity" className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {severities.map((severity) => (
                                            <SelectItem key={severity.value} value={severity.value}>
                                                {severity.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleStatusUpdate} disabled={statusForm.processing}>
                                    Update
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Description */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap text-foreground">{issue.description}</p>
                            </CardContent>
                        </Card>

                        {/* Steps to Reproduce */}
                        {issue.steps && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Steps to Reproduce</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap text-foreground">{issue.steps}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Expected vs Actual */}
                        {(issue.expected || issue.actual) && (
                            <div className="grid gap-4 md:grid-cols-2">
                                {issue.expected && (
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium">Expected Behavior</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm whitespace-pre-wrap text-foreground">{issue.expected}</p>
                                        </CardContent>
                                    </Card>
                                )}
                                {issue.actual && (
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium">Actual Behavior</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm whitespace-pre-wrap text-foreground">{issue.actual}</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Screenshot */}
                        {issue.screenshot_url && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                        <ImageIcon className="h-4 w-4" />
                                        Screenshot
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="group relative">
                                        <img
                                            src={issue.screenshot_url}
                                            alt="Issue screenshot"
                                            className="h-auto max-w-full cursor-pointer rounded-lg border transition-opacity hover:opacity-90"
                                            onClick={() => setIsScreenshotModalOpen(true)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                                            onClick={() => setIsScreenshotModalOpen(true)}
                                        >
                                            <Maximize2Icon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Page URL */}
                        {issue.page_url && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Page URL</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <a
                                        href={issue.page_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm break-all text-primary hover:underline"
                                    >
                                        {issue.page_url}
                                    </a>
                                </CardContent>
                            </Card>
                        )}

                        {/* Comments */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <MessageSquareIcon className="h-4 w-4" />
                                    Comments ({allComments.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {allComments.length > 0 ? (
                                    allComments.map((comment) => (
                                        <div key={comment.id} className="space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{comment.admin.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(comment.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="pl-10 text-sm whitespace-pre-wrap text-foreground">{comment.comment}</p>
                                            {comment.id !== allComments[allComments.length - 1].id && <Separator className="mt-4" />}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No comments yet</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Reporter Info */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Reporter</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{issue.user.name}</p>
                                        <p className="text-xs text-muted-foreground">{issue.user.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Add Comment Form */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Add Comment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCommentSubmit} className="space-y-4">
                                    <div>
                                        <Textarea
                                            placeholder="Write a comment..."
                                            value={commentForm.data.comment}
                                            onChange={(e) => commentForm.setData('comment', e.target.value)}
                                            rows={4}
                                            required
                                        />
                                        {commentForm.errors.comment && <p className="mt-1 text-xs text-destructive">{commentForm.errors.comment}</p>}
                                    </div>
                                    <Button type="submit" disabled={commentForm.processing}>
                                        {commentForm.processing ? 'Adding...' : 'Add Comment'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Screenshot Modal */}
                {issue.screenshot_url && (
                    <Dialog open={isScreenshotModalOpen} onOpenChange={setIsScreenshotModalOpen}>
                        <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden">
                            <DialogHeader>
                                <DialogTitle>Issue Screenshot</DialogTitle>
                                <DialogDescription>Screenshot captured when the issue was reported</DialogDescription>
                            </DialogHeader>
                            <div className="flex max-h-[calc(90vh-8rem)] items-center justify-center overflow-auto">
                                <img src={issue.screenshot_url} alt="Issue screenshot" className="h-auto max-w-full rounded-lg" />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}
