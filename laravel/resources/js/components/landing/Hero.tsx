import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Highlighter } from '@/components/ui/highlighter';
import { Meteors } from '@/components/ui/meteors';
import { IconSparklesSmall } from './LandingIcons';

const headline = 'From Project Brief to Complete Spec';

// Memoized subheadline to prevent re-renders
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

// Lazy load demo section (below fold)
const DemoSection = lazy(() => Promise.resolve({
    default: () => (
        <section id="demo" className="relative py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm gpu-accelerated">
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center">
                        <div className="text-center">
                            <Play className="h-12 w-12 text-white/40 mx-auto mb-4" />
                            <p className="text-white/60 text-lg">Demo video coming soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}));

// Precompute headline words for memoization
const headlineWords = headline.split(' ');

const Hero = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Use useCallback for stable reference
    const showContent = useCallback(() => {
        setIsVisible(true);
    }, []);

    useEffect(() => {
        // Use requestAnimationFrame for smoother initial render
        const raf = requestAnimationFrame(showContent);
        return () => cancelAnimationFrame(raf);
    }, [showContent]);

    // Memoize headline words with animation delays
    const animatedWords = useMemo(() => 
        headlineWords.map((word, index) => ({
            word,
            key: `${word}-${index}`,
            delay: `${index * 0.05}s`,
        })),
    []);

    return (
        <section className="sirius-hero relative overflow-hidden">
            {/* Enhanced Background Space Effects - GPU Accelerated */}
            <div className="hero-gradient gpu-accelerated" aria-hidden="true" />
            
            {/* Constellation layer */}
            <div className="hero-constellation gpu-accelerated" aria-hidden="true" />
            
            {/* Optimized meteors - GPU accelerated */}
            <Meteors number={15} minDuration={3} maxDuration={12} />
            
            {/* Nebula effects - GPU accelerated */}
            <div className="hero-nebula hero-nebula--left gpu-accelerated" aria-hidden="true" />
            <div className="hero-nebula hero-nebula--right gpu-accelerated" aria-hidden="true" />
            <div className="hero-nebula hero-nebula--center gpu-accelerated" aria-hidden="true" />

            {/* Centered Layout */}
            <div className="hero-inner-centered mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div 
                    className={`hero-copy-centered hero-fade-in ${isVisible ? 'is-visible' : ''}`}
                >
                    {/* Eyebrow with icon */}
                    <div className="hero-eyebrow mb-8 flex items-center justify-center gap-2">
                        <IconSparklesSmall className="h-5 w-5 animate-pulse" />
                        <span>Sirius AI Planning Engine</span>
                    </div>

                    {/* Main Headline - Larger with CSS animations */}
                    <h1 className="hero-headline hero-headline--large mb-8 text-center" aria-label={headline}>
                        {animatedWords.map(({ word, key, delay }) => (
                            <span
                                key={key}
                                className={`hero-headline-word hero-word-animate ${isVisible ? 'is-visible' : ''}`}
                                style={{ transitionDelay: delay }}
                            >
                                {word}
                                {'\u00a0'}
                            </span>
                        ))}
                    </h1>

                    {/* Subheadline - Wider with CSS animation */}
                    <p
                        className={`hero-subheadline mx-auto mb-12 max-w-2xl text-center text-lg leading-relaxed text-balance text-white/80 sm:text-xl md:text-2xl hero-element-animate ${isVisible ? 'is-visible' : ''}`}
                        style={{ transitionDelay: '0.25s' }}
                    >
                        <SubheadlineContent />
                    </p>

                    {/* CTA Buttons - Centered with CSS animation */}
                    <div
                        className={`hero-cta mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row hero-element-animate ${isVisible ? 'is-visible' : ''}`}
                        style={{ transitionDelay: '0.35s' }}
                    >
                        <Button 
                            size="lg" 
                            className="group h-14 px-10 text-base font-semibold rounded-full bg-[#edf2f2] text-[#1d2328] hover:bg-white hover:text-black border-0 shadow-none gpu-accelerated" 
                            asChild
                        >
                            <a href="/beta" className="flex items-center gap-2">
                                Join Closed Beta
                            </a>
                        </Button>
                        
                        <Button 
                            size="lg" 
                            variant="outline"
                            className="group h-14 px-8 text-base font-medium rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm gpu-accelerated" 
                            asChild
                        >
                            <a href="#demo" className="flex items-center gap-2">
                                <Play className="h-4 w-4 fill-current" />
                                Watch Demo
                            </a>
                        </Button>
                    </div>

                    {/* Social Proof / Trust Indicators - Centered with CSS animation */}
                    <div
                        className={`hero-social-proof flex flex-col items-center justify-center gap-4 sm:flex-row hero-element-animate ${isVisible ? 'is-visible' : ''}`}
                        style={{ transitionDelay: '0.45s' }}
                    >
                        {/* Trust badges */}
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div 
                                        key={i}
                                        className="h-8 w-8 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-br from-indigo-400 to-purple-500 gpu-accelerated"
                                        style={{ zIndex: 6 - i }}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-white/70">
                                <span className="font-semibold text-white">50+</span> developers in beta
                            </span>
                        </div>
                        
                        {/* Separator */}
                        <div className="hidden sm:block h-4 w-px bg-white/20" />
                        
                        {/* Additional trust */}
                        <p className="text-sm text-white/60">
                            Free during closed beta • Works with Copilot &amp; Cursor
                        </p>
                    </div>
                </div>
            </div>

            {/* Demo Video - Lazy loaded */}
            <Suspense fallback={null}>
                <DemoSection />
            </Suspense>
        </section>
    );
};

export default Hero;

