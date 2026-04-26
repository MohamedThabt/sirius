import { ClientDateTime } from '@/components/ClientDateTime';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, GlowingBadge } from '@/components/ui/futuristic';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, CreditCardIcon, ExternalLinkIcon, ImageIcon, UserIcon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';

interface Payment {
    id: number;
    plan_slug: string;
    amount: string;
    currency: string;
    payment_method: string;
    status: 'pending' | 'accepted' | 'denied';
    admin_note?: string;
    transfer_image_path: string;
    created_at: string;
    reviewed_at?: string;
    user: { id: number; name: string; email: string };
}

interface PageProps {
    payment: Payment;
    imageUrl: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Payment Requests', href: '/admin/payments' },
    { title: 'Review', href: '#' },
];

const statusVariant = (s: string): 'warning' | 'success' | 'danger' | 'slate' =>
    s === 'pending' ? 'warning' : s === 'accepted' ? 'success' : s === 'denied' ? 'danger' : 'slate';

export default function PaymentShow({ payment, imageUrl }: PageProps) {
    useFlashToasts();

    const [acceptOpen, setAcceptOpen] = useState(false);
    const [denyOpen, setDenyOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [processing, setProcessing] = useState(false);

    const submit = (action: 'accept' | 'deny') => {
        setProcessing(true);
        router.put(
            `/admin/payments/${payment.id}`,
            { action, admin_note: adminNote },
            {
                onFinish: () => {
                    setProcessing(false);
                    setAcceptOpen(false);
                    setDenyOpen(false);
                    setAdminNote('');
                },
            },
        );
    };

    const handleDelete = () => {
        setProcessing(true);
        router.delete(`/admin/payments/${payment.id}`, {
            onFinish: () => {
                setProcessing(false);
                setDeleteOpen(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Payment #${payment.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                {/* Back nav */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link href="/admin/payments">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                            <ArrowLeftIcon className="h-4 w-4" /> Back to Payments
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        {payment.status === 'pending' && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                                    onClick={() => setAcceptOpen(true)}
                                >
                                    <CheckCircleIcon className="mr-1.5 h-4 w-4" /> Accept
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400"
                                    onClick={() => setDenyOpen(true)}
                                >
                                    <XCircleIcon className="mr-1.5 h-4 w-4" /> Deny
                                </Button>
                            </>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleteOpen(true)}
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Payment Info */}
                    <EnhancedCard variant="glass" hoverEffect={false}>
                        <EnhancedCardHeader>
                            <EnhancedCardTitle className="flex items-center gap-2">
                                <CreditCardIcon className="h-4 w-4 text-violet-500" />
                                Payment #{payment.id}
                            </EnhancedCardTitle>
                        </EnhancedCardHeader>
                        <EnhancedCardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <GlowingBadge
                                    variant={statusVariant(payment.status)}
                                    icon={
                                        payment.status === 'accepted' ? (
                                            <CheckCircleIcon className="h-3 w-3" />
                                        ) : payment.status === 'denied' ? (
                                            <XCircleIcon className="h-3 w-3" />
                                        ) : (
                                            <ClockIcon className="h-3 w-3" />
                                        )
                                    }
                                >
                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                </GlowingBadge>
                            </div>
                            <InfoRow label="Plan" value={payment.plan_slug.charAt(0).toUpperCase() + payment.plan_slug.slice(1)} />
                            <InfoRow label="Amount" value={`${Number(payment.amount).toLocaleString()} ${payment.currency}`} />
                            <InfoRow label="Method" value={payment.payment_method} />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Submitted</span>
                                <span className="text-sm font-medium tabular-nums">
                                    <ClientDateTime value={payment.created_at} dateStyle="medium" timeStyle="short" />
                                </span>
                            </div>
                            {payment.reviewed_at && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Reviewed</span>
                                    <span className="text-sm font-medium tabular-nums">
                                        <ClientDateTime value={payment.reviewed_at} dateStyle="medium" timeStyle="short" />
                                    </span>
                                </div>
                            )}
                            {payment.admin_note && (
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground">Admin Note</span>
                                    <p className="rounded-lg bg-muted/50 p-3 text-sm">{payment.admin_note}</p>
                                </div>
                            )}
                        </EnhancedCardContent>
                    </EnhancedCard>

                    {/* User Info */}
                    <EnhancedCard variant="glass" hoverEffect={false}>
                        <EnhancedCardHeader>
                            <EnhancedCardTitle className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-blue-500" />
                                User Details
                            </EnhancedCardTitle>
                        </EnhancedCardHeader>
                        <EnhancedCardContent className="space-y-4">
                            <InfoRow label="Name" value={payment.user.name} />
                            <InfoRow label="Email" value={payment.user.email} />
                            <InfoRow label="User ID" value={`#${payment.user.id}`} />
                            <Link href={`/admin/users/${payment.user.id}`}>
                                <Button variant="outline" size="sm" className="mt-2 gap-1.5 border-border/40">
                                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                                    View User Profile
                                </Button>
                            </Link>
                        </EnhancedCardContent>
                    </EnhancedCard>
                </div>

                {/* Transfer Screenshot */}
                <EnhancedCard variant="glass" hoverEffect={false}>
                    <EnhancedCardHeader>
                        <EnhancedCardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-amber-500" />
                            Transfer Screenshot
                        </EnhancedCardTitle>
                    </EnhancedCardHeader>
                    <EnhancedCardContent>
                        <div className="overflow-hidden rounded-xl border border-border/40 bg-muted/30">
                            <img
                                src={imageUrl}
                                alt="Transfer screenshot"
                                className="mx-auto max-h-[600px] object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/placeholder.png';
                                }}
                            />
                        </div>
                        <div className="mt-3 flex items-center justify-end">
                            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="gap-1.5 border-border/40">
                                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                                    Open Full Image
                                </Button>
                            </a>
                        </div>
                    </EnhancedCardContent>
                </EnhancedCard>
            </div>

            {/* Accept Dialog */}
            <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
                <DialogContent className="border-border/40 bg-card/95 backdrop-blur-xl sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <CheckCircleIcon className="h-5 w-5" /> Accept Payment
                        </DialogTitle>
                        <DialogDescription>
                            This will upgrade <strong>{payment.user.name}</strong> to the Pro plan and send them a confirmation email.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <Label htmlFor="accept-note">Admin Note (optional)</Label>
                        <Textarea
                            id="accept-note"
                            placeholder="Optional note for internal records..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={3}
                            className="resize-none border-border/40 bg-card/50"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-border/40" onClick={() => setAcceptOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => submit('accept')} disabled={processing}>
                            {processing ? 'Processing...' : 'Accept & Upgrade to Pro'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Deny Dialog */}
            <Dialog open={denyOpen} onOpenChange={setDenyOpen}>
                <DialogContent className="border-border/40 bg-card/95 backdrop-blur-xl sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <XCircleIcon className="h-5 w-5" /> Deny Payment
                        </DialogTitle>
                        <DialogDescription>This will mark the payment as denied. No email will be sent to the user.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <Label htmlFor="deny-note">Admin Note (optional)</Label>
                        <Textarea
                            id="deny-note"
                            placeholder="Reason for denial (internal only)..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={3}
                            className="resize-none border-border/40 bg-card/50"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-border/40" onClick={() => setDenyOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => submit('deny')} disabled={processing}>
                            {processing ? 'Processing...' : 'Deny Payment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="border-border/40 bg-card/95 backdrop-blur-xl sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <XCircleIcon className="h-5 w-5" /> Delete Record
                        </DialogTitle>
                        <DialogDescription>Are you sure you want to permanently delete this payment record? This cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" className="border-border/40" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                            {processing ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}
