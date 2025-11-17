import { ConfirmPasswordForm } from '@/components/confirm-password-form';
import AuthLayout from '@/layouts/auth-layout';
import { Head } from '@inertiajs/react';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirm password" />

            <AuthLayout
                title="Confirm your password"
                description="This is a secure area of the application. Please confirm your password before continuing."
            >
                <ConfirmPasswordForm />
            </AuthLayout>
        </>
    );
}
