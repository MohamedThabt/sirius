import { SEO } from '@/components/SEO';
import SiriusHero from '@/components/sirius/SiriusHero';
import SiriusNavbar from '@/components/sirius/SiriusNavbar';
import { FeatureCard } from '@/components/ui/grid-feature-card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { documentationSuite, howItWorks } from '@/lib/sirius/content';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, type ReactNode } from 'react';

const ProblemSolutionSection = lazy(() => import('@/components/sirius/ProblemSolutionSection'));
const SiriusSectionShell = lazy(() => import('@/components/sirius/SiriusSectionShell'));
const SiriusStepTimeline = lazy(() => import('@/components/sirius/SiriusStepTimeline'));
const SiriusAiFlowCard = lazy(() => import('@/components/sirius/SiriusAiFlowCard'));
const TeamRolesSection = lazy(() => import('@/components/sirius/TeamRolesSection'));
const PricingSection = lazy(() => import('@/components/sirius/PricingSection'));
const FaqsSection = lazy(() => import('@/components/faqs-section').then(m => ({ default: m.FaqsSection })));
const CallToAction = lazy(() => import('@/components/call-to-action').then(m => ({ default: m.CallToAction })));
const Footer = lazy(() => import('@/components/footer').then(m => ({ default: m.Footer })));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
});

function LazySection({ children }: { children: ReactNode }) {
    return <Suspense fallback={null}>{children}</Suspense>;
}

export default function Landing() {
    useFlashToasts();

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Sirius',
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'Project Management, Documentation',
        operatingSystem: 'Web',
        description:
            'AI-powered software documentation generator. Transform project briefs into complete PRDs, SRS, ERDs, sequence diagrams, wireframes, and user stories. Export directly to GitHub for seamless development workflows.',
        featureList:
            'PRD Generation, SRS Generation, ERD Diagrams, Sequence Diagrams, Wireframes, User Stories, GitHub Export, Team Collaboration, AI-Powered Documentation',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/LimitedAvailability',
            description: 'Free beta access for early adopters',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '150',
        },
    };

    return (
        <div className="dark min-h-screen bg-background text-foreground">
            <SEO
                title="Sirius — AI PRD & Software Documentation Generator"
                description="Generate complete software documentation from a project brief. Sirius AI creates PRDs, SRS, ERDs, sequence diagrams, wireframes, and user stories—then exports to GitHub. Built for engineering teams who want to ship faster."
                keywords="AI PRD generator, automate software documentation using AI, generate PRD from project brief, AI tool for software requirements, auto generate ERD diagram, AI user story generator, software documentation automation, best documentation tool for startups, generate SRS automatically, AI technical specs generator, pre-code documentation, project planning AI, requirements management software, GitHub documentation exporter"
                image="/images/seo/image.png"
                type="website"
                structuredData={structuredData}
            />
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <main aria-label="Sirius landing page">
                        <SiriusNavbar />
                        <SiriusHero />

                        <LazySection>
                            <ProblemSolutionSection />
                        </LazySection>

                        <LazySection>
                            <SiriusSectionShell id="features" eyebrow={documentationSuite.eyebrow} title={documentationSuite.title}>
                                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {documentationSuite.features.map((feature, index) => (
                                        <FeatureCard key={index} feature={feature} className="h-full rounded-xl border border-border bg-card/50" />
                                    ))}
                                </div>
                            </SiriusSectionShell>
                        </LazySection>

                        <LazySection>
                            <section className="sirius-section scroll-mt-24 bg-gradient-to-b from-card/30 to-background md:scroll-mt-28" id="how-it-works">
                                <div className="sirius-container">
                                    <div className="mb-10 grid grid-cols-1 items-start gap-8 md:mb-12 lg:grid-cols-2 lg:gap-12">
                                        <div className="lg:sticky lg:top-24">
                                            <span className="text-kicker mb-2 block">{howItWorks.eyebrow}</span>
                                            <h2 className="text-section-title mb-4 text-foreground">{howItWorks.title}</h2>
                                            <p className="text-body mb-6 text-muted-foreground">
                                                Every project follows a structured flow from brief to build-ready documentation.
                                            </p>
                                            <SiriusAiFlowCard
                                                className="mt-6"
                                                circleText="Sirius AI"
                                                badgeTexts={{
                                                    first: 'Diagrams',
                                                    second: 'PRD',
                                                    third: 'Specs',
                                                    fourth: 'ERD',
                                                }}
                                                buttonText="GitHub Export"
                                                title="From Brief to Build-Ready Docs"
                                                leftBadgeText="Team Sync"
                                            />
                                        </div>
                                        <SiriusStepTimeline steps={howItWorks.steps} />
                                    </div>
                                </div>
                            </section>
                        </LazySection>

                        <LazySection>
                            <TeamRolesSection />
                        </LazySection>

                        <LazySection>
                            <PricingSection />
                        </LazySection>

                        <LazySection>
                            <FaqsSection />
                        </LazySection>

                        <LazySection>
                            <section className="sirius-section">
                                <CallToAction />
                            </section>
                        </LazySection>

                        <LazySection>
                            <Footer />
                        </LazySection>
                    </main>
                </TooltipProvider>
            </QueryClientProvider>
        </div>
    );
}
