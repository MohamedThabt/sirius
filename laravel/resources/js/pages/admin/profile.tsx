import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type Admin, type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    admin: Admin;
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Admin Settings',
        href: '/admin/profile',
    },
];

export default function AdminProfile() {
    const { admin } = usePage<Props>().props;

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put('/admin/profile/password', {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                }

                if (errors.current_password) {
                    reset('current_password');
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Settings" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Profile Information and Password Update */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Profile Information */}
                    <div className="rounded-xl border border-sidebar-border/70 p-4 sm:p-6 dark:border-sidebar-border">
                        <h3 className="mb-4 text-lg font-semibold">Profile Information</h3>
                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">Name</Label>
                                    <Input value={admin.name} disabled className="bg-muted" />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">Email</Label>
                                    <Input value={admin.email} disabled className="bg-muted" />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">Role</Label>
                                    <Input value={admin.role === 'super_admin' ? 'Super Admin' : 'Admin'} disabled className="bg-muted" />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">Member Since</Label>
                                    <Input value={new Date(admin.created_at).toLocaleDateString()} disabled className="bg-muted" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Tips */}
                    <div className="rounded-xl border border-sidebar-border/70 p-4 sm:p-6 dark:border-sidebar-border">
                        <h3 className="mb-4 text-lg font-semibold">Security Tips</h3>
                        <div className="text-sm text-muted-foreground">
                            <p className="mb-3">Keep your admin account secure:</p>
                            <ul className="list-inside list-disc space-y-2">
                                <li>Use a strong, unique password</li>
                                <li>Change your password regularly</li>
                                <li>Never share your admin credentials</li>
                                <li>Log out when finished</li>
                                <li>Monitor admin activity logs</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Update Password */}
                <div className="rounded-xl border border-sidebar-border/70 p-4 sm:p-6 dark:border-sidebar-border">
                    <h3 className="mb-4 text-lg font-semibold">Update Password</h3>
                    <p className="mb-6 text-sm text-muted-foreground">Ensure your account is using a long, random password to stay secure</p>

                    <form onSubmit={updatePassword} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="current_password" className="text-sm font-medium">
                                    Current Password
                                </Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    autoComplete="current-password"
                                    placeholder="Enter current password"
                                />
                                {errors.current_password && <p className="text-sm text-destructive">{errors.current_password}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    New Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="Enter new password"
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-medium">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="Confirm new password"
                                />
                                {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation}</p>}
                            </div>
                        </div>

                        <div className="flex justify-start">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
