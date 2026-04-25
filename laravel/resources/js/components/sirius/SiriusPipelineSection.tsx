import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, FileText, GitBranch, Layers, Sparkles, Zap } from 'lucide-react';
import React, { useState } from 'react';
import SiriusOrbitalFeatures from './SiriusOrbitalFeatures';

interface PipelineItem {
    id: string;
    icon: React.ElementType;
    label: string;
    title: string;
    description: string;
    color: 'primary' | 'accent' | 'muted' | 'secondary';
}

const pipelineItems: PipelineItem[] = [
    {
        id: 'documentation',
        icon: Layers,
        label: 'DOCUMENTATION PIPELINE',
        title: 'Structured documentation from day one',
        description:
            'Unlike fragmented doc tools, Sirius employs a structured pipeline that generates PRDs, SRSs, and technical specs in a cohesive flow. Each document builds on the previous, ensuring consistency and completeness.',
        color: 'primary',
    },
    {
        id: 'decomposition',
        icon: FileText,
        label: 'SMART DECOMPOSITION',
        title: 'Break complexity into clarity',
        description:
            'Through intelligent analysis, your project brief is decomposed into features, epics, and granular user stories. Each story comes with acceptance criteria, ERDs, and technical specifications.',
        color: 'accent',
    },
    {
        id: 'ai-export',
        icon: Sparkles,
        label: 'AI-READY EXPORT',
        title: 'Prompts optimized for AI tools',
        description:
            'Every user story generates production-ready prompts for Cursor, Copilot, and other AI code assistants. Context-rich prompts that understand your architecture and constraints.',
        color: 'secondary',
    },
    {
        id: 'github',
        icon: GitBranch,
        label: 'GITHUB INTEGRATION',
        title: 'Version-controlled documentation',
        description:
            'Export your entire documentation suite to GitHub with structured folders. Changes sync automatically, keeping your docs in lockstep with development.',
        color: 'muted',
    },
];

const FloatingParticles: React.FC = () => {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute h-1 w-1 rounded-full bg-primary/30"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    }}
                />
            ))}
        </div>
    );
};

const SiriusPipelineSection: React.FC = () => {
    const [activeId, setActiveId] = useState<string>('documentation');
    const activeItem = pipelineItems.find((item) => item.id === activeId);

    return (
        <section className="sirius-section relative overflow-hidden" id="pipeline">
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
            </div>
            <FloatingParticles />

            <div className="sirius-container relative z-10">
                <div className="grid grid-cols-1 items-start gap-8 md:gap-12 lg:grid-cols-2 lg:gap-20">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="lg:sticky lg:top-32"
                    >
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-xs tracking-wider text-primary uppercase md:mb-6">
                            <Zap className="h-3 w-3" />
                            <span>Automated Pipeline</span>
                        </div>

                        <h2 className="mb-4 text-2xl leading-tight font-bold text-foreground sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl">
                            Sirius's documentation <span className="sirius-gradient-text">pipeline</span> enables true automation
                        </h2>
                        <p className="mb-4 text-base text-muted-foreground md:text-lg">
                            Sirius transforms your project brief into a complete documentation suite:
                        </p>
                        <ul className="mb-6 space-y-2 md:mb-8 md:space-y-3">
                            {['Generate PRDs and SRSs automatically', 'Decompose into user stories with ERDs', 'Export AI-optimized prompts'].map(
                                (item, i) => (
                                    <motion.li
                                        key={i}
                                        className="flex items-center gap-3 text-foreground"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 + 0.3 }}
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                                            <Sparkles className="h-3 w-3 flex-shrink-0 text-primary" />
                                        </div>
                                        <span>{item}</span>
                                    </motion.li>
                                ),
                            )}
                        </ul>

                        <motion.div
                            className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span>Request Beta Access</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative mb-6 flex items-center justify-center">
                            <div className="hidden sm:block">
                                <SiriusOrbitalFeatures />
                            </div>
                            <div className="flex h-32 items-center justify-center gap-2 sm:hidden">
                                {pipelineItems.map((item, index) => {
                                    const Icon = item.icon;
                                    const isActive = item.id === activeId;
                                    return (
                                        <React.Fragment key={item.id}>
                                            <motion.div
                                                className={cn(
                                                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                                                    isActive ? 'border-primary bg-primary' : 'border-border bg-card',
                                                )}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setActiveId(item.id)}
                                            >
                                                <Icon className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                                            </motion.div>
                                            {index < pipelineItems.length - 1 && <div className="h-0.5 w-4 bg-border" />}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="relative z-10 rounded-2xl border border-border bg-card/80 p-6 shadow-xl shadow-black/5 backdrop-blur-md">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 p-4"
                                >
                                    <div className="mb-2 flex items-center gap-3">
                                        {activeItem && <activeItem.icon className="h-5 w-5 text-primary" />}
                                        <h3 className="font-semibold text-foreground">{activeItem?.title}</h3>
                                    </div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{activeItem?.description}</p>
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex flex-wrap gap-2">
                                {pipelineItems.map((item, index) => {
                                    const Icon = item.icon;
                                    const isActive = item.id === activeId;

                                    return (
                                        <motion.button
                                            key={item.id}
                                            onClick={() => setActiveId(item.id)}
                                            className={cn(
                                                'flex items-center gap-2 rounded-lg border px-4 py-2 transition-all duration-300',
                                                isActive
                                                    ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                    : 'border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                                            )}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="font-mono text-xs tracking-wider whitespace-nowrap uppercase">
                                                {item.label.split(' ')[0]}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
                        <div className="absolute -top-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-br from-accent/20 to-transparent blur-xl" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default SiriusPipelineSection;
