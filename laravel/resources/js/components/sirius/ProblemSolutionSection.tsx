import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { specDrivenDevelopment } from '@/lib/sirius/content';
import { Check, SparklesIcon, AlertTriangle, ArrowRight, Brain } from 'lucide-react';
import { GridPattern } from '@/components/ui/shadcn-io/grid-pattern';

export const ProblemSolutionSection: React.FC = () => {
    const { eyebrow, title, problem, solution } = specDrivenDevelopment;

    return (
        <section className="sirius-section relative overflow-hidden bg-background" id="why-sirius">
            {/* Grid Pattern Background */}
            <GridPattern
                width={40}
                height={40}
                x={-1}
                y={-1}
                className="absolute inset-0 h-full w-full fill-primary/[0.02] stroke-border/40 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
                squares={[
                    [4, 2], [8, 5], [12, 3], [16, 6],
                    [2, 8], [6, 11], [10, 9], [14, 12],
                    [5, 15], [9, 14], [13, 16], [17, 10],
                ]}
            />

            <div className="sirius-container relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center justify-center mb-12 md:mb-16">
                    <div className="flex flex-col gap-4 max-w-2xl">
                        <span className="text-kicker text-center">{eyebrow}</span>
                        <h2 className="text-center text-section-title text-foreground">
                            {title}
                        </h2>
                    </div>
                </div>

                {/* Problem → Solution Flow */}
                <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-4">
                    {/* Problem Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.5 }}
                        className="flex-1"
                    >
                        <div className="h-full p-6 rounded-xl border border-border bg-card/80 backdrop-blur-sm hover:border-destructive/30 transition-all duration-300">
                            {/* Card Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-destructive" />
                                </div>
                                <div>
                                    <span className="text-xs text-destructive uppercase tracking-wider font-medium">The Problem</span>
                                    <h3 className="text-lg font-semibold text-foreground">{problem.title}</h3>
                                </div>
                            </div>

                            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                                {problem.description}
                            </p>

                            {/* Pain Points */}
                            <ul className="space-y-3">
                                {problem.painPoints.map((point, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="flex items-start gap-3 text-sm"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <point.icon className="w-3 h-3 text-destructive" />
                                        </div>
                                        <span className="text-foreground">{point.title}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Arrow Connector */}
                    <div className="flex items-center justify-center lg:flex-col py-2 lg:py-0 lg:px-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
                        >
                            <Brain className="w-5 h-5 text-primary" />
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                            className="hidden lg:flex flex-col items-center gap-1 mt-2"
                        >
                            <div className="w-px h-8 bg-gradient-to-b from-primary/40 to-primary/10" />
                            <ArrowRight className="w-4 h-4 text-primary rotate-90" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                            className="lg:hidden flex items-center gap-1 ml-2"
                        >
                            <div className="w-8 h-px bg-gradient-to-r from-primary/40 to-primary/10" />
                            <ArrowRight className="w-4 h-4 text-primary" />
                        </motion.div>
                    </div>

                    {/* Solution Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex-1"
                    >
                        <div className="h-full p-6 rounded-xl border border-border bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
                            {/* Card Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <SparklesIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <span className="text-xs text-primary uppercase tracking-wider font-medium">The Solution</span>
                                    <h3 className="text-lg font-semibold text-foreground">{solution.title}</h3>
                                </div>
                            </div>

                            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                                {solution.description}
                            </p>

                            {/* Solution Steps */}
                            <div className="space-y-3">
                                {solution.steps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                                        className="flex items-start gap-3 text-sm"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
                                            {step.step}
                                        </div>
                                        <span className="text-foreground">{step.title}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Contrast Statement */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: 0.6 }}
                                className="mt-5 pt-4 border-t border-border"
                            >
                                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{solution.contrast}</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ProblemSolutionSection;
