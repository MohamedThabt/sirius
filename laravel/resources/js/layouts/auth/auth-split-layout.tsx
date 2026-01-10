import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { GridPattern } from '@/components/ui/shadcn-io/grid-pattern';
import AppLogoIcon from '@/components/app-logo-icon';

// Move QueryClient outside component to prevent recreation
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
});

interface AuthSplitLayoutProps {
    name?: string;
    title?: string;
    description?: string;
    visualVariant?: 'login' | 'register';
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthSplitLayoutProps>) {
    useFlashToasts();

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Grid Pattern Background */}
            <GridPattern
                width={40}
                height={40}
                x={-1}
                y={-1}
                className="absolute inset-0 h-full w-full fill-primary/[0.02] stroke-border/40 [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]"
                squares={[
                    [2, 3], [5, 1], [8, 4], [12, 2], [15, 5],
                    [3, 8], [7, 6], [10, 9], [14, 7], [18, 3],
                    [1, 12], [6, 10], [11, 13], [16, 11], [20, 8],
                ]}
            />

            {/* Subtle radial accent */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl z-0" />

            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
                        {/* Single Centered Section */}
                        <div className="w-full max-w-md space-y-8">
                            {/* Logo */}
                            <Link 
                                href="/" 
                                className="flex items-center justify-center transition-all duration-300 hover:opacity-80 hover:scale-105"
                            >
                                <AppLogoIcon className="h-10 w-auto" />
                            </Link>

                            <Card className="border-border bg-card/80 backdrop-blur-sm shadow-xl">
                                <CardHeader className="text-center space-y-3 pb-6">
                                    <CardTitle className="text-2xl font-bold text-foreground">{title}</CardTitle>
                                    <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                                        {description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">{children}</CardContent>
                            </Card>
                        </div>
                    </div>
                </TooltipProvider>
            </QueryClientProvider>
        </div>
    );
}
