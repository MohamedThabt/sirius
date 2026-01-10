import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import { Home } from "lucide-react";

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
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
            <Head title={`${status}: ${title}`} />
            
            {/* Vertical lines running top to bottom */}
            <div className="absolute inset-0 mx-auto max-w-5xl border-x border-border pointer-events-none" />

            <div className="w-full relative z-10">
                {/* Top line full width */}
                <div className="h-px w-full bg-border" />

                <div className="mx-auto flex max-w-5xl items-center justify-center py-16 bg-background/50 backdrop-blur-[2px]">
                     <Empty>
                        <EmptyHeader>
                            <EmptyTitle className="font-black font-mono text-8xl text-primary">
                                {status}
                            </EmptyTitle>
                            <EmptyTitle className="text-2xl mt-2">
                                {title}
                            </EmptyTitle>
                            <EmptyDescription className="text-center max-w-md mt-4 text-balance text-lg">
                                {description}
                            </EmptyDescription>
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
