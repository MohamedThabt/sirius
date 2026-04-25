import { Button } from '@/components/ui/button';
import { GridPattern } from '@/components/ui/shadcn-io/grid-pattern';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import React from 'react';

interface SiriusCTASectionProps {
    headline: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel?: string;
    secondaryHref?: string;
}

export const SiriusCTASection: React.FC<SiriusCTASectionProps> = ({ headline, body, primaryLabel, primaryHref, secondaryLabel, secondaryHref }) => {
    return (
        <section className="sirius-section relative overflow-hidden">
            <GridPattern
                width={50}
                height={50}
                className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] fill-primary/10 stroke-primary/20"
                squares={[
                    [2, 1],
                    [4, 3],
                    [6, 2],
                    [8, 4],
                    [10, 1],
                    [3, 5],
                    [5, 6],
                    [7, 5],
                    [9, 7],
                    [1, 6],
                    [4, 8],
                    [6, 9],
                    [8, 8],
                    [2, 9],
                    [10, 6],
                ]}
                animated
            />

            <div className="sirius-gradient-bg absolute inset-0 opacity-50" />
            <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

            <div className="sirius-container relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-2xl text-center"
                >
                    <h2 className="text-section-title mb-4 text-foreground">{headline}</h2>
                    <p className="text-body mb-8 text-muted-foreground">{body}</p>

                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Button size="lg" variant="sirius" className="group" asChild>
                            <a href={primaryHref}>
                                {primaryLabel}
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </a>
                        </Button>

                        {secondaryLabel && secondaryHref && (
                            <Button size="lg" variant="siriusOutline" asChild>
                                <a href={secondaryHref}>{secondaryLabel}</a>
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SiriusCTASection;
