import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Mail, Trash2, User } from 'lucide-react';

import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { PlanBadge } from '@/components/plan-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/layout';

function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    useFlashToasts();
    const { auth } = usePage<SharedData>().props;
    const { data, setData, patch, processing, recentlySuccessful, errors } = useForm({
        name: auth.user.name,
    });

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <Head title="Profile Settings" />

            <header className="mb-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile Settings</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and account settings</p>
                    </div>
                </div>
            </header>

            <div className="space-y-6">
                {/* Profile Card with Avatar */}
                <div className="rounded-xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border bg-muted/30 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <User className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-foreground">Profile Information</h2>
                                <p className="text-xs text-muted-foreground">Update your personal information</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        {/* Avatar Section */}
                        <div className="mb-8 flex items-center gap-6 rounded-lg border border-dashed border-border bg-muted/20 p-4">
                            <Avatar className="h-20 w-20 shadow-lg ring-4 ring-background">
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-xl font-semibold text-primary-foreground">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-medium text-foreground">{auth.user.name}</h3>
                                    {auth.user.plan && <PlanBadge plan={auth.user.plan} />}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-3.5 w-3.5" />
                                    {auth.user.email}
                                </div>
                                {auth.user.email_verified_at ? (
                                    <Badge
                                        variant="secondary"
                                        className="mt-2 gap-1 bg-emerald-100 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    >
                                        <CheckCircle2 className="h-3 w-3" />
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="secondary"
                                        className="mt-2 gap-1 bg-amber-100 text-amber-600 hover:bg-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
                                    >
                                        <AlertCircle className="h-3 w-3" />
                                        Unverified
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                patch('/settings/profile', {
                                    preserveScroll: true,
                                });
                            }}
                            className="space-y-6"
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium">
                                        Full Name
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            className="pl-10"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            autoComplete="name"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <InputError className="mt-1" message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            className="bg-muted/50 pl-10"
                                            value={auth.user.email}
                                            disabled
                                            autoComplete="username"
                                            placeholder="Email address"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                                </div>
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                                        <div>
                                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Email verification required</p>
                                            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                                                Your email address is unverified.{' '}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        router.post('/email/verification-notification');
                                                    }}
                                                    className="font-medium underline underline-offset-4 transition-colors hover:text-amber-900 dark:hover:text-amber-100"
                                                >
                                                    Click here to resend the verification email.
                                                </button>
                                            </p>
                                            {status === 'verification-link-sent' && (
                                                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle2 className="h-4 w-4" />A new verification link has been sent to your email address.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-4 border-t border-border pt-6">
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out duration-300"
                                    enterFrom="opacity-0 translate-x-2"
                                    enterTo="opacity-100 translate-x-0"
                                    leave="transition ease-in-out duration-300"
                                    leaveFrom="opacity-100 translate-x-0"
                                    leaveTo="opacity-0 translate-x-2"
                                >
                                    <span className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Changes saved successfully
                                    </span>
                                </Transition>
                                <Button type="submit" disabled={processing} className="min-w-[120px]">
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Danger Zone - Delete Account */}
                <div className="rounded-xl border border-destructive/30 bg-card shadow-sm">
                    <div className="border-b border-destructive/20 bg-destructive/5 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-destructive">Danger Zone</h2>
                                <p className="text-xs text-muted-foreground">Irreversible and destructive actions</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="font-medium text-foreground">Delete Account</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Permanently delete your account and all associated data. This action cannot be undone.
                                    </p>
                                </div>
                                <DeleteUser />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Profile.layout = (page: React.ReactNode) => <SettingsLayout>{page}</SettingsLayout>;

export default Profile;
