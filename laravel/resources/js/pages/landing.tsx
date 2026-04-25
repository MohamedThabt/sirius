import { CallToAction } from '@/components/call-to-action';
import { FaqsSection } from '@/components/faqs-section';
import { Footer } from '@/components/footer';
import { SEO } from '@/components/SEO';
import SiriusAiFlowCard from '@/components/sirius/SiriusAiFlowCard';
import SiriusHero from '@/components/sirius/SiriusHero';
import SiriusNavbar from '@/components/sirius/SiriusNavbar';
import { FeatureCard } from '@/components/ui/grid-feature-card';

import PricingSection from '@/components/sirius/PricingSection';
import ProblemSolutionSection from '@/components/sirius/ProblemSolutionSection';
import SiriusSectionShell from '@/components/sirius/SiriusSectionShell';
import SiriusStepTimeline from '@/components/sirius/SiriusStepTimeline';
import TeamRolesSection from '@/components/sirius/TeamRolesSection';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { documentationSuite, howItWorks } from '@/lib/sirius/content';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
});

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
        <div className="min-h-screen bg-background text-foreground">
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

                        <ProblemSolutionSection />

                        <SiriusSectionShell id="features" eyebrow={documentationSuite.eyebrow} title={documentationSuite.title}>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {documentationSuite.features.map((feature, index) => (
                                    <FeatureCard key={index} feature={feature} className="h-full rounded-xl border border-border bg-card/50" />
                                ))}
                            </div>
                        </SiriusSectionShell>

                        <section className="sirius-section bg-card/30" id="how-it-works">
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

                        <TeamRolesSection />

                        <PricingSection />

                        <FaqsSection />

                        <section className="sirius-section">
                            <CallToAction />
                        </section>

                        <Footer />
                    </main>
                </TooltipProvider>
            </QueryClientProvider>
        </div>
    );
}
