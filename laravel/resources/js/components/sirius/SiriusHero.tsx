import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowDown, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HyperTextParagraph } from '@/components/ui/hyper-text-paragraph';
import { heroContent } from '@/lib/sirius/content';
import SiriusOrbitalFeatures from './SiriusOrbitalFeatures';

// Generate random stars for the background
const generateStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 2,
    }));
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

export const SiriusHero: React.FC = () => {
    const prefersReducedMotion = useReducedMotion();
    // Reduced particle counts for better mobile performance; skip entirely if user prefers reduced motion
    const stars = useMemo(() => prefersReducedMotion ? [] : generateStars(20), [prefersReducedMotion]);
    const spaceDust = useMemo(() => prefersReducedMotion ? [] : generateSpaceDust(8), [prefersReducedMotion]);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            {/* Dense starfield background */}
            <div className="absolute inset-0 z-0">
                {stars.map((star) => (
                    <motion.div
                        key={star.id}
                        className="absolute rounded-full bg-foreground/40"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: star.size,
                            height: star.size,
                        }}
                        animate={{
                            opacity: [0.2, 0.8, 0.2],
                            scale: [1, 1.3, 1],
                        }}
                        transition={{
                            duration: star.duration,
                            delay: star.delay,
                            repeat: Infinity,
                            ease: "easeInOut",
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
            <div className="absolute inset-0 z-[2]">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-background" />
                {/* Purple nebula accent */}
                <div 
                    className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
                    style={{
                        background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(56,189,248,0.2) 50%, transparent 70%)',
                    }}
                />
                {/* Blue nebula accent */}
                <div 
                    className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-25 blur-[100px]"
                    style={{
                        background: 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(99,102,241,0.2) 50%, transparent 70%)',
                    }}
                />
            </div>

            {/* Animated aurora effect */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-[40vh] z-[3] pointer-events-none"
                style={{
                    background: 'linear-gradient(180deg, rgba(56,189,248,0.08) 0%, rgba(168,85,247,0.05) 50%, transparent 100%)',
                }}
                animate={{
                    opacity: [0.3, 0.6, 0.3],
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
                                <a href="/beta">
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
