import { SEO } from '@/components/SEO';
import DatabaseWithRestApi from '@/components/sirius/DatabaseWithRestApi';
import SiriusBentoFeatures from '@/components/sirius/SiriusBentoFeatures';
import SiriusCTASection from '@/components/sirius/SiriusCTASection';
import SiriusFAQ from '@/components/sirius/SiriusFAQ';
import SiriusFeatureCard from '@/components/sirius/SiriusFeatureCard';
import SiriusFooter from '@/components/sirius/SiriusFooter';
import SiriusHero from '@/components/sirius/SiriusHero';
import SiriusNavbar from '@/components/sirius/SiriusNavbar';
import SiriusPipelineSection from '@/components/sirius/SiriusPipelineSection';
import SiriusProcessGrid from '@/components/sirius/SiriusProcessGrid';
import SiriusRequirementPill from '@/components/sirius/SiriusRequirementPill';
import SiriusSectionShell from '@/components/sirius/SiriusSectionShell';
import SiriusStakeholderCard from '@/components/sirius/SiriusStakeholderCard';
import SiriusStepTimeline from '@/components/sirius/SiriusStepTimeline';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { aiGithubWorkflow, ctaContent, functionalRequirements, howItWorks, nonFunctionalRequirements, teamCollaboration } from '@/lib/sirius/content';
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

                        <SiriusBentoFeatures />

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
                                    <SiriusFeatureCard
                                        key={index}
                                        icon={feature.icon}
                                        title={feature.title}
                                        description={feature.description}
                                        delay={index * 0.1}
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

                        <SiriusSectionShell
                            eyebrow="Built to Last"
                            title="Enterprise-ready from day one"
                            subtitle="Sirius is designed with performance, security, and scalability at its core."
                        >
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                                <div>
                                    <h3 className="mb-6 flex items-center gap-2 font-sirius text-lg font-semibold text-foreground">
                                        <SiriusRequirementPill label="FR" type="functional" />
                                        Functional Requirements
                                    </h3>
                                    <div className="space-y-4">
                                        {functionalRequirements.map((req, index) => (
                                            <motion.div
                                                key={req.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex gap-3 rounded-lg border border-border bg-card/50 p-4"
                                            >
                                                <span className="font-mono text-xs whitespace-nowrap text-primary">{req.id}</span>
                                                <div>
                                                    <h4 className="mb-1 text-sm font-medium text-foreground">{req.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{req.description}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-6 flex items-center gap-2 font-sirius text-lg font-semibold text-foreground">
                                        <SiriusRequirementPill label="NFR" type="non-functional" />
                                        Non-Functional Requirements
                                    </h3>
                                    <div className="space-y-4">
                                        {nonFunctionalRequirements.map((req, index) => (
                                            <motion.div
                                                key={req.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex gap-3 rounded-lg border border-border bg-card/50 p-4"
                                            >
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
                                                    <req.icon className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="mb-1 text-sm font-medium text-foreground">{req.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{req.description}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SiriusSectionShell>

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
