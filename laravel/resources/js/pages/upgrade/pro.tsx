import { BentoPricing } from '@/components/bento-pricing';
import { Breadcrumbs } from '@/components/breadcrumbs';
import ProjectsIndexSidebar from '@/components/Projects/ProjectsIndexSidebar';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { QRCode } from '@/components/ui/qr-code';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircleIcon, CopyIcon, ExternalLinkIcon, MailIcon, ShieldCheckIcon, UploadCloudIcon } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';

interface ProPlan {
    name: string;
    price: number | string;
    credits_per_cycle: number;
}

interface SidebarProject {
    id: number;
    name: string;
    status?: string;
}

interface PageProps {
    proPlan: ProPlan | null;
    instapayLink: string;
    instapayUser: string;
    /** Amount user must send via InstaPay (EGP); must match server payment record. */
    upgradeAmountEgp: number;
    supportEmail: string;
    sidebarProjects: SidebarProject[];
    pendingInvitationsCount: number;
}

export default function UpgradePro({
    proPlan,
    instapayLink,
    instapayUser,
    upgradeAmountEgp,
    supportEmail,
    sidebarProjects = [],
    pendingInvitationsCount = 0,
}: PageProps) {
    useFlashToasts();
    const { auth } = usePage<SharedData>().props;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        transfer_image: File | null;
    }>({ transfer_image: null });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('transfer_image', file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/upgrade/pro', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const copyToClipboard = async (text: string, key: string) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
        } catch {
            return;
        }

        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const amountEgp = upgradeAmountEgp;
    const credits = proPlan?.credits_per_cycle ?? 2000;

    return (
        <>
            <Head title="Upgrade to Pro" />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectsIndexSidebar
                        auth={auth}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        onCreateProject={() => router.visit('/projects')}
                        projectCount={sidebarProjects.length}
                        invitationsCount={pendingInvitationsCount}
                        projects={sidebarProjects}
                        currentPage="upgrade"
                    />

                    <main className="min-w-0 flex-1">
                        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                            <div className="mb-6 flex items-center gap-3">
                                <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                                <Breadcrumbs breadcrumbs={[{ title: 'Upgrade to Pro', href: '/upgrade/pro' }]} />
                            </div>

                            <PageHeader
                                title="Upgrade to Pro"
                                description="Pay with InstaPay, upload your transfer screenshot, and we will activate your Pro plan after review."
                                size="large"
                                animated
                                action={
                                    <Badge variant="outline" className="hidden border-primary/40 px-3 py-1 text-primary sm:inline-flex">
                                        Manual review within 24 hours
                                    </Badge>
                                }
                            />

                            <div className="space-y-8">
                                <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-3 shadow-sm backdrop-blur sm:p-5">
                                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-foreground">Choose your plan</h2>
                                            <p className="text-sm text-muted-foreground">Pro includes all Free features plus more AI credits.</p>
                                        </div>
                                        <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/10">
                                            {credits.toLocaleString()} AI credits/month
                                        </Badge>
                                    </div>
                                    <BentoPricing />
                                </section>

                                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                                    <div className="space-y-6 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-foreground">How to Pay</h2>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Scan the QR code, transfer the amount, then upload the proof below.
                                            </p>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-3">
                                            {[
                                                { step: '1', title: 'Scan QR', desc: 'Open the InstaPay payment link from the QR code or button.' },
                                                {
                                                    step: '2',
                                                    title: `Transfer ${amountEgp} EGP`,
                                                    desc: `Send exactly ${amountEgp} EGP to the InstaPay account.`,
                                                },
                                                { step: '3', title: 'Upload proof', desc: 'Attach the completed transfer screenshot for review.' },
                                            ].map((s) => (
                                                <div key={s.step} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                                            {s.step}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-foreground">{s.title}</p>
                                                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{s.desc}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
                                            <a
                                                href={instapayLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group rounded-2xl border border-border/70 bg-background p-4 text-center shadow-sm transition hover:border-primary/40 hover:shadow-md"
                                            >
                                                <div className="mx-auto flex w-fit rounded-2xl bg-white p-3 shadow-sm">
                                                    <QRCode
                                                        value={instapayLink}
                                                        size={220}
                                                        fgColor="#111827"
                                                        bgColor="#ffffff"
                                                        errorCorrectionLevel="H"
                                                        className="h-auto w-[180px] max-w-full sm:w-[220px]"
                                                    />
                                                </div>
                                                <p className="mt-3 text-sm font-semibold text-foreground">Scan to pay with InstaPay</p>
                                                <p className="mt-1 text-xs text-muted-foreground">Tap the QR card to open the payment link.</p>
                                            </a>

                                            <div className="min-w-0 space-y-3">
                                                <CopyField
                                                    label="InstaPay Link"
                                                    value={instapayLink}
                                                    copied={copied === 'link'}
                                                    onCopy={() => copyToClipboard(instapayLink, 'link')}
                                                    action={
                                                        <a href={instapayLink} target="_blank" rel="noopener noreferrer">
                                                            <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5">
                                                                <ExternalLinkIcon className="h-3.5 w-3.5" />
                                                                Open
                                                            </Button>
                                                        </a>
                                                    }
                                                />

                                                <CopyField
                                                    label="InstaPay Username"
                                                    value={instapayUser}
                                                    copied={copied === 'user'}
                                                    onCopy={() => copyToClipboard(instapayUser, 'user')}
                                                />

                                                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                                                    <p className="text-xs font-semibold tracking-wide text-primary uppercase">Amount to transfer</p>
                                                    <p className="mt-1 text-3xl font-bold text-foreground">
                                                        {amountEgp.toLocaleString()}{' '}
                                                        <span className="text-base font-medium text-muted-foreground">EGP / month</span>
                                                    </p>
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        Please transfer this exact amount so we can match your payment quickly.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <form
                                            onSubmit={handleSubmit}
                                            className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5"
                                        >
                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <h3 className="text-base font-semibold text-foreground">Upload transfer screenshot</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        JPEG, PNG, WebP or HEIC. Maximum file size is 5 MB.
                                                    </p>
                                                </div>
                                                <Badge variant="secondary" className="w-fit">
                                                    Required
                                                </Badge>
                                            </div>

                                            <div
                                                className="relative cursor-pointer rounded-2xl border-2 border-dashed border-border bg-background p-5 text-center transition hover:border-primary/50 hover:bg-primary/5 sm:p-8"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />

                                                {preview ? (
                                                    <div className="space-y-3">
                                                        <img
                                                            src={preview}
                                                            alt="Transfer screenshot preview"
                                                            className="mx-auto max-h-72 rounded-xl object-contain shadow-sm"
                                                        />
                                                        <p className="text-sm text-muted-foreground">Click to change image</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                                            <UploadCloudIcon className="h-7 w-7 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-foreground">Click to upload screenshot</p>
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                A clear screenshot helps us approve faster.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {errors.transfer_image && <p className="text-sm text-destructive">{errors.transfer_image}</p>}

                                            <Button type="submit" disabled={processing || !data.transfer_image} className="h-11 w-full">
                                                {processing ? 'Submitting proof...' : 'Submit payment proof'}
                                            </Button>
                                        </form>
                                    </div>

                                    <aside className="space-y-4">
                                        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                                    <ShieldCheckIcon className="h-5 w-5 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">What happens next?</h3>
                                                    <p className="text-xs text-muted-foreground">We review your proof manually.</p>
                                                </div>
                                            </div>
                                            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                                                <p>1. Your transfer proof is sent to our team.</p>
                                                <p>2. We verify the payment details.</p>
                                                <p>3. Your Pro plan and credits are activated.</p>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                                            <div className="flex items-start gap-3">
                                                <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-foreground">Need help?</p>
                                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                        Contact us at{' '}
                                                        <a
                                                            href={`mailto:${supportEmail}`}
                                                            className="break-all text-primary underline underline-offset-2"
                                                        >
                                                            {supportEmail}
                                                        </a>{' '}
                                                        for payment or upgrade questions.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </aside>
                                </section>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

function CopyField({
    label,
    value,
    copied,
    onCopy,
    action,
}: {
    label: string;
    value: string;
    copied: boolean;
    onCopy: () => void;
    action?: ReactNode;
}) {
    return (
        <div className="rounded-xl border border-border/60 bg-background p-4">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
            <div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                <code className="min-w-0 flex-1 overflow-hidden rounded-lg bg-muted/40 px-3 py-2 text-sm font-medium text-ellipsis whitespace-nowrap text-foreground">
                    {value}
                </code>
                <div className="flex shrink-0 gap-2">
                    <Button type="button" variant="secondary" size="sm" className="h-9 gap-1.5" onClick={onCopy}>
                        {copied ? <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" /> : <CopyIcon className="h-3.5 w-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                    </Button>
                    {action}
                </div>
            </div>
        </div>
    );
}
