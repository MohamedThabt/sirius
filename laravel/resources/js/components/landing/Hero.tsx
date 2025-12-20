import { Database, FileText, GitBranch, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Highlighter } from '@/components/ui/highlighter';
import { Meteors } from '@/components/ui/meteors';

const headline = 'From Project Brief to Complete Spec';
const SubheadlineContent = () => (
    <>
        Describe your project in plain language. Sirius AI generates{' '}
        <Highlighter action="underline" color="rgba(99, 102, 241, 0.6)">
            PRDs, user stories, ERDs
        </Highlighter>
        , sequence diagrams, and wireframes—then exports to{' '}
        <Highlighter action="underline" color="rgba(139, 92, 246, 0.6)">
            GitHub
        </Highlighter>{' '}
        for AI code generators.
    </>
);

const coreArtifacts = [
    { icon: FileText, label: 'PRD & User Stories' },
    { icon: Database, label: 'ERDs & Diagrams' },
    { icon: GitBranch, label: 'GitHub Export' },
];

const Hero = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <section className="sirius-hero relative overflow-hidden">
            {/* Background Space Effects */}
            <div className="hero-gradient" aria-hidden="true" />
            <Meteors number={25} minDuration={3} maxDuration={12} />
            <div className="hero-nebula hero-nebula--left" aria-hidden="true" />
            <div className="hero-nebula hero-nebula--right" aria-hidden="true" />

            <div className="hero-inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="hero-copy" style={{ opacity: isVisible ? 1 : 0 }}>
                    {/* Eyebrow with icon */}
                    <div className="hero-eyebrow mb-8 flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5 animate-pulse text-indigo-400" />
                        <span>Sirius AI Planning Engine</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="hero-headline mb-10 text-center" aria-label={headline}>
                        {headline.split(' ').map((word, index) => (
                            <span
                                key={`${word}-${index}`}
                                className="hero-headline-word"
                                style={{
                                    opacity: isVisible ? 1 : 0,
                                    transform: isVisible ? 'translateY(0)' : 'translateY(20%)',
                                    transitionDelay: `${index * 0.05}s`,
                                }}
                            >
                                {word}
                                {'\u00a0'}
                            </span>
                        ))}
                    </h1>

                    {/* Subheadline */}
                    <p
                        className="hero-subheadline mx-auto mb-20 max-w-3xl text-center text-lg leading-relaxed text-balance text-white/85 sm:text-xl"
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
                            transitionDelay: '0.25s',
                        }}
                    >
                        <SubheadlineContent />
                    </p>

                    {/* Core Artifacts - Visual Cards */}
                    <div
                        className="mx-auto mb-16 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3"
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
                            transitionDelay: '0.35s',
                        }}
                    >
                        {coreArtifacts.map((artifact, index) => {
                            const Icon = artifact.icon;
                            return (
                                <div
                                    key={artifact.label}
                                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/10 hover:shadow-2xl hover:shadow-indigo-500/20"
                                    style={{
                                        transitionDelay: `${0.4 + index * 0.1}s`,
                                    }}
                                >
                                    {/* Card glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                    <div className="relative z-10 flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 transition-all duration-500 group-hover:scale-110">
                                            <Icon className="h-6 w-6 text-indigo-300" />
                                        </div>
                                        <h3 className="text-base font-semibold text-white">{artifact.label}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* CTA Buttons */}
                    <div
                        className="hero-cta mb-8 flex flex-col justify-center gap-4 sm:flex-row"
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
                            transitionDelay: '0.55s',
                        }}
                    >
                        <Button size="lg" className="hero-cta-primary group h-14 px-10 text-base font-semibold" asChild>
                            <a href="/beta" className="flex items-center gap-2">
                                Join Closed Beta
                            </a>
                        </Button>
                    </div>

                    {/* Trust Indicator */}
                    <div
                        className="hero-footnote flex items-center justify-center text-center"
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transitionDelay: '0.65s',
                        }}
                    >
                        <p className="text-sm text-white/60">No credit card required • 3 free projects • Works with Copilot & Cursor</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
