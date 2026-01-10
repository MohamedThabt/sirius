import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ParticleCanvas from './ParticleHero';
import { heroContent } from '@/lib/sirius/content';
import SiriusCpuArchitecture from './SiriusCpuArchitecture';

export const SiriusHero: React.FC = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <ParticleCanvas />
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

            <div className="relative z-20 sirius-container py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Column - Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center lg:text-left"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-6"
                        >
                            <span className="sirius-badge">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                {heroContent.badge}
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6"
                        >
                            <span className="text-foreground">{heroContent.title}</span>
                            <br />
                            <span className="bg-gradient-to-r from-primary via-primary to-orange-400 bg-clip-text text-transparent">
                                {heroContent.titleHighlight}
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed mx-auto lg:mx-0"
                        >
                            {heroContent.subtitle}
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
                        >
                            <Button size="lg" variant="sirius" className="group text-base px-8">
                                {heroContent.primaryCta}
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                size="lg"
                                variant="siriusOutline"
                                className="text-base"
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
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="flex flex-col sm:flex-row lg:flex-col xl:flex-row flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3"
                        >
                            {heroContent.valueProps.map((prop, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span>{prop}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Column - CPU Visualization */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="relative flex flex-col items-center"
                    >
                        {/* Glow effect behind */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/5 to-primary/15 blur-3xl rounded-full scale-110" />

                        {/* CPU Component - No background */}
                        <SiriusCpuArchitecture text="Sirius" className="relative w-full h-[220px] sm:h-[280px] md:h-[340px] lg:h-[380px]" />

                        {/* Labels under the visualization */}
                        <div className="flex justify-center gap-6 sm:gap-8 mt-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span>Input: Brief</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-400" />
                                <span>Output: Docs</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default SiriusHero;
