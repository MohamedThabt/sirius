import ComparisonSection from '@/components/landing/ComparisonSection';
import CompetitorComparison from '@/components/landing/CompetitorComparison';
import ActionSlidesSection from '@/components/landing/ActionSlidesSection';
import Features from '@/components/landing/Features';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import Hero from '@/components/landing/Hero';
import HeroIllustration from '@/components/landing/HeroIllustration';
import MetricsSection from '@/components/landing/MetricsSection';
import Navbar from '@/components/landing/Navbar';
import PersonasSection from '@/components/landing/PersonasSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import WorkflowSection from '@/components/landing/WorkflowSection';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import './landing.css';

const queryClient = new QueryClient();

export default function Landing() {
    useFlashToasts();
    // Force dark mode for landing page
    useEffect(() => {
        document.documentElement.classList.add('dark');
        return () => {
            // Optional: remove dark class when leaving landing page
            // document.documentElement.classList.remove('dark');
        };
    }, []);

    return (
        <div className="linear-landing dark min-h-screen bg-background text-foreground">
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <main>
                        <Navbar />
                        <Hero />
                        <HeroIllustration />
                        <Features />
                        <ComparisonSection />
                        <ActionSlidesSection />
                        <WorkflowSection />
                        <MetricsSection />
                        <PersonasSection />
                        <TestimonialsSection />
                        <CompetitorComparison />
                        <FinalCTA />
                        <Footer />
                    </main>
                </TooltipProvider>
            </QueryClientProvider>
        </div>
    );
}
