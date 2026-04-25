import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowDown, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HyperTextParagraph } from '@/components/ui/hyper-text-paragraph';
import { heroContent } from '@/lib/sirius/content';
import SiriusOrbitalFeatures from './SiriusOrbitalFeatures';

// Star color palette — fully opaque, glow handled via boxShadow
const STAR_COLORS = [
    '#ffffff',          // white
    '#c8dcff',          // blue-white
    '#aabeff',          // pale blue
    '#ffe6c8',          // warm white
    '#b4a0ff',          // pale violet
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

// Generate space dust particles
const generateSpaceDust = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        delay: Math.random() * 5,
        duration: Math.random() * 8 + 5,
        direction: Math.random() > 0.5 ? 1 : -1,
    }));
};

// CSS keyframes injected once for star twinkle — pure GPU compositing
const starTwinkleCSS = `
@keyframes starTwinkle {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}
`;


export const SiriusHero: React.FC = () => {
    const prefersReducedMotion = useReducedMotion();
    // Reduced particle counts for better mobile performance; skip entirely if user prefers reduced motion
    const stars = useMemo(() => prefersReducedMotion ? [] : generateStars(45), [prefersReducedMotion]);
    const spaceDust = useMemo(() => prefersReducedMotion ? [] : generateSpaceDust(12), [prefersReducedMotion]);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            {/* Deep space radial base */}
            <div className="absolute inset-0 z-0" style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(15,10,40,0.6) 0%, transparent 70%)',
            }} />

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
                            boxShadow: star.glow,
                            animation: `starTwinkle ${star.duration}s ${star.delay}s ease-in-out infinite`,
                            willChange: 'opacity, transform',
                        }}
                    />
                ))}
            </div>


            {/* Space dust particles */}
            <div className="absolute inset-0 z-[1] pointer-events-none">
                {spaceDust.map((dust) => (
                    <motion.div
                        key={`dust-${dust.id}`}
                        className="absolute rounded-full bg-primary/20"
                        style={{
                            left: `${dust.x}%`,
                            top: `${dust.y}%`,
                            width: dust.size,
                            height: dust.size,
                        }}
                        animate={{
                            x: [0, dust.direction * 30, 0],
                            y: [0, -20, 0],
                            opacity: [0.1, 0.4, 0.1],
                        }}
                        transition={{
                            duration: dust.duration,
                            delay: dust.delay,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            {/* Cosmic nebula gradient overlay */}
            <div className="absolute inset-0 z-[2] pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-background" />
                
                {/* Deep purple nebula - upper left */}
                <motion.div 
                    className="absolute -top-20 -left-20 w-[700px] h-[700px] rounded-full opacity-[0.12] blur-[140px]"
                    style={{
                        background: 'radial-gradient(circle, rgba(120,80,220,0.5) 0%, rgba(80,40,180,0.3) 40%, transparent 70%)',
                    }}
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.12, 0.18, 0.12],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                {/* Blue nebula - center right */}
                <motion.div 
                    className="absolute top-1/3 -right-10 w-[550px] h-[550px] rounded-full opacity-[0.10] blur-[120px]"
                    style={{
                        background: 'radial-gradient(circle, rgba(60,120,255,0.4) 0%, rgba(40,80,200,0.2) 45%, transparent 70%)',
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.10, 0.16, 0.10],
                    }}
                    transition={{
                        duration: 15,
                        delay: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                {/* Cyan/teal nebula - lower */}
                <motion.div 
                    className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[110px]"
                    style={{
                        background: 'radial-gradient(circle, rgba(60,200,220,0.35) 0%, rgba(40,150,180,0.15) 50%, transparent 70%)',
                    }}
                    animate={{
                        scale: [1, 1.12, 1],
                        opacity: [0.08, 0.14, 0.08],
                    }}
                    transition={{
                        duration: 10,
                        delay: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                {/* Subtle warm accent */}
                <div 
                    className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full opacity-[0.06] blur-[100px]"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,180,100,0.3) 0%, transparent 60%)',
                    }}
                />
            </div>

            {/* Animated aurora / cosmic veil */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-[50vh] z-[3] pointer-events-none"
                style={{
                    background: 'linear-gradient(180deg, rgba(100,60,200,0.08) 0%, rgba(60,120,255,0.04) 30%, rgba(60,200,220,0.02) 60%, transparent 100%)',
                }}
                animate={{
                    opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Main content - 2 column layout */}
            <div className="relative z-10 sirius-container py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    
                    {/* Left Column - Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                        className="text-center lg:text-left order-2 lg:order-1"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mb-6"
                        >
                            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/60 backdrop-blur-md px-4 py-1.5 text-sm font-medium text-foreground shadow-lg shadow-primary/5">
                                <Sparkles className="w-4 h-4 text-primary" />
                                {heroContent.badge}
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
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
                            className="max-w-xl mb-8 mx-auto lg:mx-0"
                        >
                            <HyperTextParagraph
                                text="Paste your project brief and Sirius AI breaks it into features with complete PRDs, user stories, ERDs, sequence diagrams, and wireframes—then exports everything to GitHub."
                                highlightWords={["Sirius AI", "PRDs", "user stories", "ERDs", "sequence diagrams", "wireframes", "GitHub"]}
                                className="text-lg lg:text-xl text-muted-foreground leading-relaxed"
                            />
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
                        >
                            <Button 
                                size="lg" 
                                variant="sirius" 
                                className="group text-base px-8 h-12 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow" 
                                asChild
                            >
                                <a href="/register">
                                    {heroContent.primaryCta}
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-base h-12 border-border/50 bg-card/30 backdrop-blur-sm hover:bg-accent/50"
                                onClick={() =>
                                    document.getElementById('how-it-works')?.scrollIntoView({
                                        behavior: 'smooth',
                                    })
                                }
                            >
                                {heroContent.secondaryCta}
                                <ArrowDown className="ml-2 w-4 h-4" />
                            </Button>
                        </motion.div>

                        {/* Value Props */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.45, duration: 0.7 }}
                            className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-x-8 gap-y-3"
                        >
                            {heroContent.valueProps.map((prop, index) => (
                                <motion.div 
                                    key={index} 
                                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                >
                                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 border border-primary/20">
                                        <Check className="w-3 h-3 text-primary" />
                                    </div>
                                    <span>{prop}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Column - Sirius Orbital Features Visualization */}
                    <div className="relative hidden md:flex items-center justify-center order-1 lg:order-2">
                        <SiriusOrbitalFeatures />
                    </div>
                </div>
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[5]" />
        </section>
    );
};

export default SiriusHero;
