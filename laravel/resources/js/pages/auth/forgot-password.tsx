// Components
import { ForgotPasswordForm } from '@/components/forgot-password-form';
import AuthLayout from '@/layouts/auth-layout';
import { Head } from '@inertiajs/react';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />

            <AuthLayout title="Forgot password" description="Enter your email to receive a password reset link">
                <ForgotPasswordForm status={status} />
            </AuthLayout>
        </>
    );
}
