import { SEO } from '@/components/SEO';
import SiriusAiFlowCard from '@/components/sirius/SiriusAiFlowCard';
import { CallToAction } from '@/components/call-to-action';
import { Footer } from '@/components/footer';
import { FaqsSection } from '@/components/faqs-section';
import SiriusHero from '@/components/sirius/SiriusHero';
import { FeatureCard } from '@/components/ui/grid-feature-card';
import SiriusNavbar from '@/components/sirius/SiriusNavbar';

import SiriusSectionShell from '@/components/sirius/SiriusSectionShell';
import SiriusStepTimeline from '@/components/sirius/SiriusStepTimeline';
import TeamRolesSection from '@/components/sirius/TeamRolesSection';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { aiGithubWorkflow, documentationSuite, howItWorks } from '@/lib/sirius/content';
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
        operatingSystem: 'Web',
        description:
            'From Project Brief to Complete Spec. Describe your project in plain language. Sirius AI generates PRDs, user stories, ERDs, sequence diagrams, and wireframes—then exports to GitHub for AI code generators.',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
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
                title="Sirius"
                description="Build-ready specs for engineering teams. Paste your project brief and Sirius AI generates PRDs, user stories, ERDs, sequence diagrams, and wireframes—then exports to GitHub."
                keywords="AI project planning, PRD generator, ERD generator, wireframe generator, software requirements, project documentation, GitHub integration, sequence diagrams, user stories, engineering teams"
                image="/images/seo/image.png"
                type="website"
                structuredData={structuredData}
            />
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <main aria-label="Sirius landing page">
                        <SiriusNavbar />

                        <SiriusHero />

                        <SiriusSectionShell
                            eyebrow={documentationSuite.eyebrow}
                            title={documentationSuite.title}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {documentationSuite.features.map((feature, index) => (
                                    <FeatureCard
                                        key={index}
                                        feature={feature}
                                        className="rounded-xl border border-border bg-card/50 h-full"
                                    />
                                ))}
                            </div>
                        </SiriusSectionShell>

                        <section className="sirius-section bg-card/30" id="how-it-works">
                            <div className="sirius-container">
                                <div className="mb-10 md:mb-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
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

                        <SiriusSectionShell eyebrow={aiGithubWorkflow.eyebrow} title={aiGithubWorkflow.title} subtitle={aiGithubWorkflow.description}>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {aiGithubWorkflow.features.map((feature, index) => (
                                    <FeatureCard
                                        key={index}
                                        feature={feature}
                                        className="rounded-xl border border-border bg-card/50"
                                    />
                                ))}
                            </div>
                        </SiriusSectionShell>

                        <TeamRolesSection />



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
