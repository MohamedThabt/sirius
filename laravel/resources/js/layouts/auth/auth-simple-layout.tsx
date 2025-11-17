import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import '../../pages/landing.css';

const queryClient = new QueryClient();

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    // Handle flash messages and convert them to toasts
    useFlashToasts();

    return (
        <div className="linear-landing dark min-h-screen bg-background text-foreground">
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader className="text-center">
                                <Link href="/" className="mb-6 flex items-center justify-center transition-opacity hover:opacity-80">
                                    <span className="text-2xl font-bold text-foreground">Sirius</span>
                                </Link>
                                <CardTitle>{title}</CardTitle>
                                <CardDescription>{description}</CardDescription>
                            </CardHeader>
                            <CardContent>{children}</CardContent>
                        </Card>
                    </div>
                </TooltipProvider>
            </QueryClientProvider>
        </div>
    );
}
