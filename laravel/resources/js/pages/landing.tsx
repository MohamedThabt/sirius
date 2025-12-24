import { lazy, Suspense } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForceTheme } from '@/hooks/use-force-theme';
import './landing.css';

// Critical above-the-fold components - load immediately
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';

// Lazy load below-the-fold components for better initial load performance
const Features = lazy(() => import('@/components/landing/Features'));
const ComparisonSection = lazy(() => import('@/components/landing/ComparisonSection'));
const ActionSlidesSection = lazy(() => import('@/components/landing/ActionSlidesSection'));
const FaqSection = lazy(() => import('@/components/landing/FaqSection'));
const FinalCTA = lazy(() => import('@/components/landing/FinalCTA'));
const Footer = lazy(() => import('@/components/landing/Footer'));

// Move QueryClient outside component to prevent recreation on every render
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
        },
    },
});

// Loading fallback component
const SectionLoader = () => (
    <div className="flex items-center justify-center py-24">
        <div className="h-2 w-32 animate-pulse rounded-full bg-white/10" />
    </div>
);

export default function Landing() {
    useFlashToasts();
    useForceTheme('dark');
    
    return (
        <div className="linear-landing dark min-h-screen bg-background text-foreground">
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <main>
                        <Navbar />
                        <Hero />
                        <Suspense fallback={<SectionLoader />}>
                            <Features />
                        </Suspense>
                        <Suspense fallback={<SectionLoader />}>
                            <ComparisonSection />
                        </Suspense>
                        <Suspense fallback={<SectionLoader />}>
                            <ActionSlidesSection />
                        </Suspense>
                        <Suspense fallback={<SectionLoader />}>
                            <FaqSection />
                        </Suspense>
                        <Suspense fallback={<SectionLoader />}>
                            <FinalCTA />
                        </Suspense>
                        <Suspense fallback={<SectionLoader />}>
                            <Footer />
                        </Suspense>
                    </main>
                </TooltipProvider>
            </QueryClientProvider>
        </div>
    );
}

