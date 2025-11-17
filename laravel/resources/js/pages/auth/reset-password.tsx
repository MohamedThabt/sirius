import { ResetPasswordForm } from '@/components/reset-password-form';
import AuthLayout from '@/layouts/auth-layout';
import { Head } from '@inertiajs/react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    return (
        <>
            <Head title="Reset password" />

            <AuthLayout title="Reset password" description="Please enter your new password below">
                <ResetPasswordForm token={token} email={email} />
            </AuthLayout>
        </>
    );
}
