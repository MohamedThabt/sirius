import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren, useEffect } from 'react';
import '../../pages/landing.css';
import AuthVisual from '@/components/auth/AuthVisual';

const queryClient = new QueryClient();

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
    visualVariant = 'login',
}: PropsWithChildren<AuthSplitLayoutProps>) {
    useFlashToasts();

    // Force dark mode for auth pages
    useEffect(() => {
        document.documentElement.classList.add('dark');
        return () => {
            // Optional: remove dark class when leaving auth pages
            // document.documentElement.classList.remove('dark');
        };
    }, []);

    return (
        <div className="linear-landing dark min-h-screen bg-background text-foreground">
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <div className="flex min-h-screen">
                        {/* Form Section */}
                        <div className="flex w-full flex-col items-center justify-center p-4 sm:p-6 lg:w-1/2 lg:border-r lg:border-[hsl(var(--subtle-border))]">
                            <div className="w-full max-w-md space-y-6">
                                {/* Logo */}
                                <Link href="/" className="flex items-center justify-center transition-opacity hover:opacity-80">
                                    <span className="text-2xl font-bold text-foreground">Sirius</span>
                                </Link>

                                <Card className="border-[hsl(var(--subtle-border))] bg-[hsl(var(--bg-secondary))] shadow-lg">
                                    <CardHeader className="text-center space-y-2">
                                        <CardTitle className="text-xl text-[hsl(var(--text-primary))]">{title}</CardTitle>
                                        <CardDescription className="text-sm text-[hsl(var(--text-tertiary))]">
                                            {description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">{children}</CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Visual Section */}
                        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-8 bg-[hsl(var(--bg-primary))] relative overflow-hidden">
                            <div className="w-full max-w-2xl z-10">
                                <div className="mb-8 text-center">
                                    <h2 className="mb-3 text-3xl font-bold text-[hsl(var(--text-primary))]">
                                        {visualVariant === 'login' ? 'Welcome back!' : 'Start your journey'}
                                    </h2>
                                    <p className="text-lg text-[hsl(var(--text-tertiary))]">
                                        {visualVariant === 'login'
                                            ? 'Continue your complete journey from idea to production'
                                            : 'Start your journey and transform ideas into reality'}
                                    </p>
                                </div>
                                <div className="relative">
                                    <AuthVisual variant={visualVariant} />
                                </div>
                            </div>
                            {/* Background gradient effect */}
                            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[120%] h-64 bg-gradient-to-t from-[hsl(var(--primary))]/5 to-transparent blur-3xl"></div>
                        </div>
                    </div>
                </TooltipProvider>
            </QueryClientProvider>
        </div>
    );
}
