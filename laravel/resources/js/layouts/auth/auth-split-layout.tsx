import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { Meteors } from '@/components/ui/meteors';
import AppLogoIcon from '@/components/app-logo-icon';
import '../../pages/landing.css';

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
    visualVariant = 'login',
}: PropsWithChildren<AuthSplitLayoutProps>) {
    useFlashToasts();
    const [isVisible, setIsVisible] = useState(false);

    // Force dark mode for auth pages
    useEffect(() => {
        document.documentElement.classList.add('dark');
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => {
            clearTimeout(timer);
            // Optional: remove dark class when leaving auth pages
            // document.documentElement.classList.remove('dark');
        };
    }, []);

    return (
        <div className="linear-landing dark min-h-screen bg-[hsl(var(--bg-primary))] text-foreground relative overflow-hidden">
            {/* Space-themed background effects */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                    }}
                />
                {/* Gradient orbs */}
                <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />
                <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
                {/* Subtle meteors */}
                <Meteors number={10} minDuration={3} maxDuration={8} />
            </div>

            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
                        {/* Single Centered Section */}
                        <div 
                            className="w-full max-w-md space-y-8"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                                {/* Logo */}
                                <Link 
                                    href="/" 
                                    className="flex items-center justify-center transition-all duration-300 hover:opacity-80 hover:scale-105"
                                >
                                    <AppLogoIcon className="h-10 w-auto" />
                                </Link>

                            <Card className="premium-card border-[hsl(var(--subtle-border))] bg-[hsl(var(--bg-secondary))]/80 backdrop-blur-xl shadow-2xl">
                                <CardHeader className="text-center space-y-3 pb-6">
                                    <CardTitle className="text-2xl font-bold text-[hsl(var(--text-primary))]">{title}</CardTitle>
                                    <CardDescription className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
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
