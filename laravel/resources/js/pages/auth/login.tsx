import { LoginForm } from '@/components/login-form';
import AuthLayout from '@/layouts/auth-layout';
import { Head } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <>
            <Head title="Log in" />

            <AuthLayout
                title="Log in to your account"
                description="Enter your email and password below to log in"
                visualVariant="login"
            >
                <LoginForm status={status} canResetPassword={canResetPassword} />
            </AuthLayout>
        </>
    );
}
