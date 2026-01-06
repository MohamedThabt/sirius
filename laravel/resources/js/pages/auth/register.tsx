// CLOSED BETA: Registration disabled
// import { RegisterForm } from '@/components/register-form';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function Register() {
    return (
        <>
            <Head title="Registration Closed" />

            <AuthLayout
                title="Registration Currently Closed"
                description="We're in closed beta"
                visualVariant="register"
            >
                <div className="flex w-full flex-col gap-6">
                    <div className="rounded-lg border border-[hsl(var(--subtle-border))] bg-[hsl(var(--bg-secondary))] px-6 py-8 text-center">
                        <div className="mb-4 text-4xl">🔒</div>
                        <h3 className="mb-2 text-lg font-semibold text-[hsl(var(--text-primary))]">Closed Beta</h3>
                        <p className="mb-6 text-sm text-[hsl(var(--text-secondary))]">
                            Access to Sirius is currently limited to invited users only.
                            <br />
                            Please contact the Sirius team for an invitation.
                        </p>
                        <Link href={login()}>
                            <Button 
                                variant="outline" 
                                className="w-full border-[hsl(var(--subtle-border))] bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-primary))]"
                            >
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                    
                    <div className="text-center text-sm text-[hsl(var(--text-tertiary))]">
                        Interested in joining? Visit our{' '}
                        <a href="/beta" className="text-[hsl(var(--text-primary))] hover:underline">
                            waitlist page
                        </a>
                    </div>
                </div>
            </AuthLayout>
        </>
    );
}
