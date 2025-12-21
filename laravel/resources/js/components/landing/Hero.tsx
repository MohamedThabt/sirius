import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Highlighter } from '@/components/ui/highlighter';
import { Meteors } from '@/components/ui/meteors';
import { IconSparklesSmall } from './LandingIcons';

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

const Hero = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <section className="sirius-hero relative overflow-hidden">
            {/* Enhanced Background Space Effects */}
            <div className="hero-gradient" aria-hidden="true" />
            
            {/* Constellation layer */}
            <div className="hero-constellation" aria-hidden="true" />
            
            {/* More meteors for enhanced effect */}
            <Meteors number={40} minDuration={2} maxDuration={10} />
            
            {/* Nebula effects - now visible with vibrant colors */}
            <div className="hero-nebula hero-nebula--left" aria-hidden="true" />
            <div className="hero-nebula hero-nebula--right" aria-hidden="true" />
            <div className="hero-nebula hero-nebula--center" aria-hidden="true" />

            {/* Centered Layout */}
            <div className="hero-inner-centered mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div 
                    className="hero-copy-centered"
                    style={{ 
                        opacity: isVisible ? 1 : 0,
                        transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {/* Eyebrow with icon */}
                    <div className="hero-eyebrow mb-8 flex items-center justify-center gap-2">
                        <IconSparklesSmall className="h-5 w-5 animate-pulse" />
                        <span>Sirius AI Planning Engine</span>
                    </div>

                    {/* Main Headline - Larger */}
                    <h1 className="hero-headline hero-headline--large mb-8 text-center" aria-label={headline}>
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

                    {/* Subheadline - Wider */}
                    <p
                        className="hero-subheadline mx-auto mb-12 max-w-2xl text-center text-lg leading-relaxed text-balance text-white/80 sm:text-xl md:text-2xl"
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
                            transitionDelay: '0.25s',
                        }}
                    >
                        <SubheadlineContent />
                    </p>

                    {/* CTA Buttons - Centered */}
                    <div
                        className="hero-cta mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
                            transitionDelay: '0.35s',
                        }}
                    >
                        <Button 
                            size="lg" 
                            className="group h-14 px-10 text-base font-semibold rounded-full bg-[#edf2f2] text-[#1d2328] hover:bg-white hover:text-black border-0 shadow-none" 
                            asChild
                        >
                            <a href="/beta" className="flex items-center gap-2">
                                Join Closed Beta
                            </a>
                        </Button>
                        
                        <Button 
                            size="lg" 
                            variant="outline"
                            className="group h-14 px-8 text-base font-medium rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm" 
                            asChild
                        >
                            <a href="#demo" className="flex items-center gap-2">
                                <Play className="h-4 w-4 fill-current" />
                                Watch Demo
                            </a>
                        </Button>
                    </div>

                    {/* Social Proof / Trust Indicators - Centered */}
                    <div
                        className="hero-social-proof flex flex-col items-center justify-center gap-4 sm:flex-row"
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transitionDelay: '0.45s',
                        }}
                    >
                        {/* Trust badges */}
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div 
                                        key={i}
                                        className="h-8 w-8 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-br from-indigo-400 to-purple-500"
                                        style={{ zIndex: 6 - i }}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-white/70">
                                <span className="font-semibold text-white">500+</span> developers in beta
                            </span>
                        </div>
                        
                        {/* Separator */}
                        <div className="hidden sm:block h-4 w-px bg-white/20" />
                        
                        {/* Additional trust */}
                        <p className="text-sm text-white/60">
                            No credit card required • Works with Copilot & Cursor
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
