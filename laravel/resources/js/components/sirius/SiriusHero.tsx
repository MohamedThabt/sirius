import { Button } from '@/components/ui/button';
import { HyperTextParagraph } from '@/components/ui/hyper-text-paragraph';
import { useIsMobile } from '@/hooks/use-mobile';
import { heroContent } from '@/lib/sirius/content';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, Check, Sparkles } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import SiriusOrbitalFeatures from './SiriusOrbitalFeatures';

// Star color palette — fully opaque, glow handled via boxShadow
const STAR_COLORS = [
    '#ffffff', // white
    '#c8dcff', // blue-white
    '#aabeff', // pale blue
    '#ffe6c8', // warm white
    '#b4a0ff', // pale violet
];

// Generate random stars for the background
const generateStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => {
        const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
        const size = Math.random() * 2.5 + 0.8;
        return {
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size,
            delay: Math.random() * 4,
            duration: Math.random() * 3 + 2,
            color,
            glow: `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}40`,
        };
    });
};

// CSS keyframes injected once for star twinkle — pure GPU compositing
const starTwinkleCSS = `
@keyframes starTwinkle {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}
`;

export const SiriusHero: React.FC = () => {
    const isMobile = useIsMobile();
    const prefersReducedMotion = useReducedMotion();
    const [isHydrated, setIsHydrated] = useState(false);
    const shouldReduceEffects = !isHydrated || prefersReducedMotion || isMobile;

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Lower density and fewer loops on mobile keeps scroll and touch interaction smooth.
    const stars = useMemo(() => (shouldReduceEffects ? generateStars(14) : generateStars(45)), [shouldReduceEffects]);

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
            {/* Deep space radial base */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(15,10,40,0.6) 0%, transparent 70%)',
                }}
            />

            {/* Inject star twinkle keyframe once */}
            <style>{starTwinkleCSS}</style>

            {/* Dense starfield background — CSS animated for zero JS overhead */}
            <div className="absolute inset-0 z-0">
                {stars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute rounded-full"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: star.size,
                            height: star.size,
                            backgroundColor: star.color,
                            boxShadow: shouldReduceEffects ? 'none' : star.glow,
                            animation: `starTwinkle ${star.duration}s ${star.delay}s ease-in-out infinite`,
                            willChange: 'opacity, transform',
                        }}
                    />
                ))}
            </div>

            {/* Cosmic nebula gradient overlay */}
            <div className="pointer-events-none absolute inset-0 z-[2]">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-background" />

                {!shouldReduceEffects ? (
                    <>
                        {/* Deep purple nebula - upper left */}
                        <div
                            className="absolute -top-20 -left-20 h-[700px] w-[700px] rounded-full opacity-[0.12] blur-[140px]"
                            style={{
                                background: 'radial-gradient(circle, rgba(120,80,220,0.5) 0%, rgba(80,40,180,0.3) 40%, transparent 70%)',
                            }}
                        />
                        {/* Blue nebula - center right */}
                        <div
                            className="absolute top-1/3 -right-10 h-[550px] w-[550px] rounded-full opacity-[0.10] blur-[120px]"
                            style={{
                                background: 'radial-gradient(circle, rgba(60,120,255,0.4) 0%, rgba(40,80,200,0.2) 45%, transparent 70%)',
                            }}
                        />
                        {/* Cyan/teal nebula - lower */}
                        <div
                            className="absolute bottom-1/4 left-1/3 h-[500px] w-[500px] rounded-full opacity-[0.08] blur-[110px]"
                            style={{
                                background: 'radial-gradient(circle, rgba(60,200,220,0.35) 0%, rgba(40,150,180,0.15) 50%, transparent 70%)',
                            }}
                        />
                    </>
                ) : (
                    <>
                        <div
                            className="absolute -top-12 -left-12 h-[420px] w-[420px] rounded-full opacity-[0.10] blur-[70px]"
                            style={{
                                background: 'radial-gradient(circle, rgba(120,80,220,0.4) 0%, transparent 72%)',
                            }}
                        />
                        <div
                            className="absolute top-1/3 -right-8 h-[340px] w-[340px] rounded-full opacity-[0.08] blur-[60px]"
                            style={{
                                background: 'radial-gradient(circle, rgba(60,120,255,0.35) 0%, transparent 72%)',
                            }}
                        />
                    </>
                )}

                {/* Subtle warm accent */}
                <div
                    className="absolute top-1/2 left-1/4 h-[300px] w-[300px] rounded-full opacity-[0.06] blur-[100px]"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,180,100,0.3) 0%, transparent 60%)',
                    }}
                />
            </div>

            {!shouldReduceEffects && (
                <div
                    className="pointer-events-none absolute top-0 right-0 left-0 z-[3] h-[50vh]"
                    style={{
                        opacity: 0.5,
                        background:
                            'linear-gradient(180deg, rgba(100,60,200,0.08) 0%, rgba(60,120,255,0.04) 30%, rgba(60,200,220,0.02) 60%, transparent 100%)',
                    }}
                />
            )}

            {/* Main content - 2 column layout */}
            <div className="sirius-container relative z-10 py-16 lg:py-24">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Left Column - Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                        className="order-2 text-center lg:order-1 lg:text-left"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mb-6"
                        >
                            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/60 px-4 py-1.5 text-sm font-medium text-foreground shadow-lg shadow-primary/5 backdrop-blur-md">
                                <Sparkles className="h-4 w-4 text-primary" />
                                {heroContent.badge}
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                            className="mb-6 text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
                        >
                            <span className="text-foreground">{heroContent.title}</span>
                            <br />
                            <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                                {heroContent.titleHighlight}
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                            className="mx-auto mb-8 max-w-xl lg:mx-0"
                        >
                            {shouldReduceEffects ? (
                                <p className="text-lg leading-relaxed text-muted-foreground lg:text-xl">
                                    Paste your project brief and Sirius AI breaks it into features with complete PRDs, user stories, ERDs, sequence
                                    diagrams, and wireframes, then exports everything to GitHub.
                                </p>
                            ) : (
                                <HyperTextParagraph
                                    text="Paste your project brief and Sirius AI breaks it into features with complete PRDs, user stories, ERDs, sequence diagrams, and wireframes—then exports everything to GitHub."
                                    highlightWords={['Sirius AI', 'PRDs', 'user stories', 'ERDs', 'sequence diagrams', 'wireframes', 'GitHub']}
                                    className="text-lg leading-relaxed text-muted-foreground lg:text-xl"
                                />
                            )}
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                            className="mb-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
                        >
                            <Button
                                size="lg"
                                variant="sirius"
                                className="group h-12 px-8 text-base shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30"
                                asChild
                            >
                                <a href="/register">
                                    {heroContent.primaryCta}
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </a>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-12 border-border/50 bg-card/30 text-base backdrop-blur-sm hover:bg-accent/50"
                                onClick={() =>
                                    document.getElementById('how-it-works')?.scrollIntoView({
                                        behavior: shouldReduceEffects ? 'auto' : 'smooth',
                                    })
                                }
                            >
                                {heroContent.secondaryCta}
                                <ArrowDown className="ml-2 h-4 w-4" />
                            </Button>
                        </motion.div>

                        {/* Value Props */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.45, duration: 0.7 }}
                            className="flex flex-col flex-wrap justify-center gap-x-8 gap-y-3 sm:flex-row lg:justify-start"
                        >
                            {heroContent.valueProps.map((prop, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                >
                                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/15">
                                        <Check className="h-3 w-3 text-primary" />
                                    </div>
                                    <span>{prop}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Column - Sirius Orbital Features Visualization */}
                    {isHydrated && !isMobile && (
                        <div className="relative order-1 hidden items-center justify-center md:flex lg:order-2">
                            <SiriusOrbitalFeatures />
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom fade */}
            <div className="absolute right-0 bottom-0 left-0 z-[5] h-32 bg-gradient-to-t from-background to-transparent" />
        </section>
    );
};

export default SiriusHero;
