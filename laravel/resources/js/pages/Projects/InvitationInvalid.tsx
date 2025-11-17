import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircleIcon, HomeIcon } from 'lucide-react';
import { Head, router } from '@inertiajs/react';

interface Props {
    message: string;
}

export default function InvitationInvalid({ message }: Props) {
    const handleGoHome = () => {
        router.get('/projects');
    };

    return (
        <>
            <Head title="Invalid Invitation" />

            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
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
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 mb-4">
                                <AlertCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground mb-2">
                                Invalid Invitation
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                {message}
                            </p>

                            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-4 mb-6">
                                <p className="text-sm text-amber-800 dark:text-amber-400">
                                    This invitation link may have expired or been cancelled. 
                                    Please contact the project owner if you believe this is an error.
                                </p>
                            </div>

                            <Button
                                onClick={handleGoHome}
                                className="w-full"
                                size="lg"
                            >
                                <HomeIcon className="h-4 w-4 mr-2" />
                                Go to Projects
                            </Button>
                        </div>
                    </Card>

                    {/* Help Text */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Need help? Contact support or the project owner who sent you the invitation.
                    </p>
                </div>
            </div>
        </>
    );
}
