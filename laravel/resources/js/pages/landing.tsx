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
import PricingSection from '@/components/landing/PricingSection';
import SocialProof from '@/components/landing/SocialProof';
import StatsSection from '@/components/landing/StatsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import WorkflowSection from '@/components/landing/WorkflowSection';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import './landing.css';

const queryClient = new QueryClient();

export default function Landing() {
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
                    <Toaster />
                    <Sonner />
                    <main>
                        <Navbar />
                        <Hero />
                        <HeroIllustration />
                        <SocialProof />
                        <Features />
                        <ComparisonSection />
                        <ActionSlidesSection />
                        <WorkflowSection />
                        <MetricsSection />
                        <PersonasSection />
                        <TestimonialsSection />
                        <PricingSection />
                        <CompetitorComparison />
                        <StatsSection />
                        <FinalCTA />
                        <Footer />
                    </main>
                </TooltipProvider>
            </QueryClientProvider>
        </div>
    );
}
