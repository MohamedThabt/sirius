import { type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useFlashToasts } from '@/hooks/use-flash-toasts';

// @ts-ignore - route helper is available globally via Ziggy
declare function route(name: string, params?: any): string;

import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
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

    return (
        <>
            <Head title="Profile Settings" />

            <header className="mb-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile Settings</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Manage your profile and account settings</p>
                </div>
            </header>

            <div className="space-y-6">
                {/* Profile Information */}
                <div className="rounded border p-6">
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-foreground">Profile Information</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Update your personal information</p>
                    </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                patch(route('profile.update'), {
                                    preserveScroll: true,
                                });
                            }}
                            className="space-y-6"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={auth.user.email}
                                    disabled
                                    autoComplete="username"
                                    placeholder="Email address"
                                />
                                <p className="text-sm text-muted-foreground">Email address cannot be changed</p>
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div>
                                    <p className="-mt-4 text-sm text-muted-foreground">
                                        Your email address is unverified.{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                router.post(route('verification.send'));
                                            }}
                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                        >
                                            Click here to resend the verification email.
                                        </button>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            A new verification link has been sent to your email address.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>Save</Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-muted-foreground">Saved</p>
                                </Transition>
                            </div>
                        </form>
                </div>

                {/* Delete Account */}
                <div className="rounded border p-6">
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-foreground">Delete Account</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Permanently delete your account and all associated data</p>
                    </div>
                    <DeleteUser />
                </div>
            </div>
        </>
    );
}

Profile.layout = (page: React.ReactNode) => <SettingsLayout>{page}</SettingsLayout>;

export default Profile;
