import InputError from '@/components/input-error';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Lock, KeyRound, Shield, Eye, EyeOff, CheckCircle2, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/layout';

function Password() {
    useFlashToasts();
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { data, setData, put, processing, recentlySuccessful, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/settings/password', {
            preserveScroll: true,
            onError: (errors) => {
                if (errors.password) {
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    currentPasswordInput.current?.focus();
                }
            },
            onSuccess: () => {
                reset('password', 'password_confirmation', 'current_password');
            },
        });
    };

    return (
        <>
            <Head title="Password Settings" />

            <header className="mb-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                        <Lock className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Password Settings</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Keep your account secure with a strong password</p>
                    </div>
                </div>
            </header>

            <div className="space-y-6">
                {/* Security Tips */}
                                                                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
                    <div className="flex items-start gap-3">
                        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Password Security Tips</p>
                            <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Use at least 8 characters
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Include uppercase and lowercase letters
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Add numbers and special characters
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border bg-muted/30 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <KeyRound className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-foreground">Update Password</h2>
                                <p className="text-xs text-muted-foreground">Change your account password</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="current_password" className="text-sm font-medium">
                                    Current Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={data.current_password}
                                        onChange={(e) => setData('current_password', e.target.value)}
                                        className="pl-10 pr-10"
                                        autoComplete="current-password"
                                        placeholder="Enter your current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={errors.current_password} />
                            </div>

                            <div className="h-px bg-border" />

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="pl-10 pr-10"
                                            autoComplete="new-password"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-sm font-medium">
                                        Confirm New Password
                                    </Label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="pl-10 pr-10"
                                            autoComplete="new-password"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

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
                                        Password updated successfully
                                    </span>
                                </Transition>
                                <Button type="submit" disabled={processing} className="min-w-[140px]">
                                    {processing ? 'Updating...' : 'Update Password'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

Password.layout = (page: React.ReactNode) => <SettingsLayout>{page}</SettingsLayout>;

export default Password;
