import { RegisterForm } from '@/components/register-form';
import AuthLayout from '@/layouts/auth-layout';
import { Head } from '@inertiajs/react';

export default function Register() {
    return (
        <>
            <Head title="Register" />

            <AuthLayout
                title="Create an account"
                description="Enter your details below to create your account"
                visualVariant="register"
            >
                <RegisterForm />
            </AuthLayout>
        </>
    );
}
