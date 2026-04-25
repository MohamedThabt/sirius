import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Head, Link } from '@inertiajs/react';
import { Home } from 'lucide-react';

interface ErrorProps {
    status: number;
}

const ERROR_MESSAGES: Record<number, { title: string; description: string }> = {
    503: {
        title: 'Service Unavailable',
        description: 'Sorry, we are doing some maintenance. Please check back soon.',
    },
    500: {
        title: 'Server Error',
        description: 'Whoops, something went wrong on our servers.',
    },
    404: {
        title: 'Page Not Found',
        description: "The page you're looking for might have been moved or doesn't exist.",
    },
    403: {
        title: 'Forbidden',
        description: 'Sorry, you are forbidden from accessing this page.',
    },
};

export default function Error({ status, message }: ErrorProps & { message?: string }) {
    const defaultError = {
        title: 'Error',
        description: message || 'An unexpected error occurred.',
    };

    const { title, description } = ERROR_MESSAGES[status] || defaultError;

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground">
            <Head title={`${status}: ${title}`} />

            {/* Vertical lines running top to bottom */}
            <div className="pointer-events-none absolute inset-0 mx-auto max-w-5xl border-x border-border" />

            <div className="relative z-10 w-full">
                {/* Top line full width */}
                <div className="h-px w-full bg-border" />

                <div className="mx-auto flex max-w-5xl items-center justify-center bg-background/50 py-16 backdrop-blur-[2px]">
                    <Empty>
                        <EmptyHeader>
                            <EmptyTitle className="font-mono text-8xl font-black text-primary">{status}</EmptyTitle>
                            <EmptyTitle className="mt-2 text-2xl">{title}</EmptyTitle>
                            <EmptyDescription className="mt-4 max-w-md text-center text-lg text-balance">{description}</EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <div className="flex gap-2">
                                <Button asChild>
                                    <Link href="/">
                                        <Home className="mr-2 h-4 w-4" /> Go Home
                                    </Link>
                                </Button>
                            </div>
                        </EmptyContent>
                    </Empty>
                </div>

                {/* Bottom line full width */}
                <div className="h-px w-full bg-border" />
            </div>
        </div>
    );
}
