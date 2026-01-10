import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { heroContent } from '@/lib/sirius/content';
import SiriusCpuArchitecture from './SiriusCpuArchitecture';
import { cn } from '@/lib/utils';

export const SiriusHero: React.FC = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            {/* Clean gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-background z-0" />
            
            {/* Subtle radial accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-3xl z-0" />

            <div className="relative z-20 sirius-container py-16 lg:py-24">
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
                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-foreground shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
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
                            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                {heroContent.titleHighlight}
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                            className="text-lg lg:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed mx-auto lg:mx-0"
                        >
                            {heroContent.subtitle}
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
                        >
                            <Button size="lg" variant="sirius" className="group text-base px-8 h-12 shadow-lg shadow-primary/20">
                                {heroContent.primaryCta}
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-base h-12 border-border hover:bg-accent"
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
                                <div key={index} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-primary" />
                                    </div>
                                    <span>{prop}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Column - CPU Visualization */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                        className="relative hidden md:flex flex-col items-center order-1 lg:order-2"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-3xl rounded-full scale-125 opacity-60" />

                        {/* CPU Component - Larger */}
                        <SiriusCpuArchitecture 
                            text="Sirius" 
                            className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px] xl:h-[520px]" 
                        />

                        {/* Labels under the visualization */}
                        <div className="flex justify-center gap-8 mt-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                <span className="font-medium">Brief Input</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                <span className="font-medium">Doc Output</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default SiriusHero;
