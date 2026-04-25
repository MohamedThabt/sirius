import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Head, router } from '@inertiajs/react';
import { AlertCircleIcon, HomeIcon } from 'lucide-react';

interface Props {
    message: string;
}

export default function InvitationInvalid({ message }: Props) {
    useFlashToasts();
    const handleGoHome = () => {
        router.get('/projects');
    };

    return (
        <>
            <Head title="Invalid Invitation" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
                <div className="w-full max-w-md">
                    {/* Logo/Brand */}
                    <div className="mb-8 text-center">
                        <a href="/" className="inline-flex items-center text-2xl font-bold text-foreground transition-opacity hover:opacity-80">
                            <AppLogo />
                        </a>
                    </div>

                    {/* Error Card */}
                    <Card className="p-8 shadow-lg">
                        <div className="text-center">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                                <AlertCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h1 className="mb-2 text-2xl font-bold text-foreground">Invalid Invitation</h1>
                            <p className="mb-6 text-muted-foreground">{message}</p>

                            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                                <p className="text-sm text-amber-800 dark:text-amber-400">
                                    This invitation link may have expired or been cancelled. Please contact the project owner if you believe this is
                                    an error.
                                </p>
                            </div>

                            <Button onClick={handleGoHome} className="w-full" size="lg">
                                <HomeIcon className="mr-2 h-4 w-4" />
                                Go to Projects
                            </Button>
                        </div>
                    </Card>

                    {/* Help Text */}
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Need help? Contact support or the project owner who sent you the invitation.
                    </p>
                </div>
            </div>
        </>
    );
}
