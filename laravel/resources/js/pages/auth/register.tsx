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
                    <div className="rounded-lg border border-border bg-muted/50 px-6 py-8 text-center">
                        <div className="mb-4 text-4xl">🔒</div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">Closed Beta</h3>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Access to Sirius is currently limited to invited users only.
                            <br />
                            Please contact the Sirius team for an invitation.
                        </p>
                        <Link href={login()}>
                            <Button 
                                variant="outline" 
                                className="w-full"
                            >
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                    
                    <div className="text-center text-sm text-muted-foreground">
                        Interested in joining? Visit our{' '}
                        <a href="/beta" className="text-primary hover:text-primary/80 hover:underline">
                            waitlist page
                        </a>
                    </div>
                </div>
            </AuthLayout>
        </>
    );
}
