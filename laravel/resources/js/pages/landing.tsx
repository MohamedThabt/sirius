import { lazy, Suspense, memo } from 'react';
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

/**
 * Loading fallback component for lazy-loaded sections.
 * Memoized to prevent unnecessary re-renders.
 * Uses GPU-accelerated animation for smooth performance.
 */
export const SectionLoader = memo(() => (
    <div 
        className="flex items-center justify-center py-24 section-loader" 
        role="status" 
        aria-label="Loading section"
    >
        <div className="h-2 w-32 animate-pulse rounded-full bg-white/10 gpu-accelerated" />
        <span className="sr-only">Loading...</span>
    </div>
));
SectionLoader.displayName = 'SectionLoader';

/**
 * Wrapper for lazy-loaded sections with content-visibility optimization.
 * This allows the browser to skip rendering off-screen content.
 */
const LazySection = memo(({ children }: { children: React.ReactNode }) => (
    <div className="lazy-section">
        {children}
    </div>
));
LazySection.displayName = 'LazySection';

export default function Landing() {
    useFlashToasts();
    useForceTheme('dark');
    
    return (
        <div className="linear-landing dark min-h-screen bg-background text-foreground smooth-scroll">
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <main aria-label="Sirius landing page">
                        <Navbar />
                        <Hero />
                        <Suspense fallback={<SectionLoader />}>
                            <LazySection>
                                <Features />
                            </LazySection>
                        </Suspense>
                        <Suspense fallback={<SectionLoader />}>
                            <LazySection>
                                <ComparisonSection />
                            </LazySection>
                        </Suspense>
                        <Suspense fallback={<SectionLoader />}>
                            <LazySection>
                                <ActionSlidesSection />
                            </LazySection>
                        </Suspense>
                        <Suspense fallback={<SectionLoader />}>
                            <LazySection>
                                <FaqSection />
                            </LazySection>
                        </Suspense>
                        <Suspense fallback={<SectionLoader />}>
                            <LazySection>
                                <FinalCTA />
                            </LazySection>
                        </Suspense>
                        <Suspense fallback={<SectionLoader />}>
                            <LazySection>
                                <Footer />
                            </LazySection>
                        </Suspense>
                    </main>
                </TooltipProvider>
            </QueryClientProvider>
        </div>
    );
}

