import { SEO } from '@/components/SEO';
import DatabaseWithRestApi from '@/components/sirius/DatabaseWithRestApi';
import SiriusCTASection from '@/components/sirius/SiriusCTASection';
import SiriusFAQ from '@/components/sirius/SiriusFAQ';
import SiriusFooter from '@/components/sirius/SiriusFooter';
import SiriusHero from '@/components/sirius/SiriusHero';
import { FeatureCard } from '@/components/ui/grid-feature-card';
import SiriusNavbar from '@/components/sirius/SiriusNavbar';
import SiriusPipelineSection from '@/components/sirius/SiriusPipelineSection';
import SiriusProcessGrid from '@/components/sirius/SiriusProcessGrid';
import SiriusSectionShell from '@/components/sirius/SiriusSectionShell';
import SiriusStakeholderCard from '@/components/sirius/SiriusStakeholderCard';
import SiriusStepTimeline from '@/components/sirius/SiriusStepTimeline';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { aiGithubWorkflow, ctaContent, documentationSuite, howItWorks, teamCollaboration } from '@/lib/sirius/content';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion } from 'framer-motion';

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
                description="From Project Brief to Complete Spec. Describe your project in plain language. Sirius AI generates PRDs, user stories, ERDs, sequence diagrams, and wireframes—then exports to GitHub for AI code generators."
                keywords="AI project planning, PRD generator, ERD generator, wireframe generator, software requirements, project documentation, AI code generation, GitHub integration, sequence diagrams, user stories"
                image="/images/seo/image.png"
                type="website"
                structuredData={structuredData}
            />
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <main aria-label="Sirius landing page">
                        <SiriusNavbar />

                        <SiriusHero />

                        <SiriusPipelineSection />

                        <SiriusProcessGrid />

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
                                <div className="mb-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
                                    <div className="lg:sticky lg:top-24">
                                        <span className="text-kicker mb-2 block">{howItWorks.eyebrow}</span>
                                        <h2 className="text-section-title mb-3 text-foreground">{howItWorks.title}</h2>
                                        <p className="text-body mb-6 text-muted-foreground">
                                            Every project follows a structured flow from brief to build-ready documentation.
                                        </p>
                                        <DatabaseWithRestApi
                                            className="mt-6"
                                            circleText="Sirius AI"
                                            badgeTexts={{
                                                first: 'Brief',
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

                        <section className="sirius-section bg-card/30" id="teams">
                            <div className="sirius-container">
                                <div className="mx-auto mb-8 max-w-3xl text-center">
                                    <span className="text-kicker mb-2 block">{teamCollaboration.eyebrow}</span>
                                    <h2 className="text-section-title mb-3 text-foreground">{teamCollaboration.title}</h2>
                                    <p className="text-body text-muted-foreground">{teamCollaboration.description}</p>
                                </div>

                                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                                    {teamCollaboration.roles.map((role, index) => (
                                        <SiriusStakeholderCard
                                            key={index}
                                            role={role.role}
                                            description={role.description}
                                            responsibilities={role.responsibilities}
                                            delay={index * 0.1}
                                        />
                                    ))}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="flex flex-wrap justify-center gap-3"
                                >
                                    {teamCollaboration.specializations.map((spec, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center gap-2 rounded-full border border-border bg-accent px-4 py-2"
                                        >
                                            <spec.icon className="h-4 w-4 text-primary" />
                                            <span className="text-sm text-foreground">{spec.name}</span>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </section>



                        <section className="sirius-section bg-card/30" id="faq">
                            <div className="sirius-container">
                                <div className="mx-auto mb-8 max-w-3xl text-center">
                                    <span className="text-kicker mb-2 block">FAQ</span>
                                    <h2 className="text-section-title mb-3 text-foreground">Questions? Answers.</h2>
                                </div>
                                <SiriusFAQ />
                            </div>
                        </section>

                        <SiriusCTASection
                            headline={ctaContent.headline}
                            body={ctaContent.body}
                            primaryLabel={ctaContent.primaryLabel}
                            primaryHref={ctaContent.primaryHref}
                            secondaryLabel={ctaContent.secondaryLabel}
                            secondaryHref={ctaContent.secondaryHref}
                        />

                        <SiriusFooter />
                    </main>
                </TooltipProvider>
            </QueryClientProvider>
        </div>
    );
}
