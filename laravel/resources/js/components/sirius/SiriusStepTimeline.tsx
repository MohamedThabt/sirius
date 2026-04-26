import { GridPattern } from '@/components/ui/shadcn-io/grid-pattern';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';

interface Step {
    id?: string;
    label: string;
    title: string;
    description: string;
    badge?: string;
}

interface SiriusStepTimelineProps {
    steps: Step[];
    className?: string;
}

export const SiriusStepTimeline: React.FC<SiriusStepTimelineProps> = ({ steps, className }) => {
    const isMobile = useIsMobile();
    const prefersReducedMotion = useReducedMotion();
    const [isHydrated, setIsHydrated] = React.useState(false);
    const shouldAnimateInView = isHydrated && !isMobile && !prefersReducedMotion;

    React.useEffect(() => {
        setIsHydrated(true);
    }, []);

    return (
        <div className={cn('relative', className)}>
            <GridPattern
                width={40}
                height={40}
                x={-1}
                y={-1}
                className="absolute inset-0 h-full w-full [mask-image:radial-gradient(600px_circle_at_center,white,transparent)] fill-primary/5 stroke-primary/10"
                squares={[
                    [1, 2],
                    [3, 4],
                    [5, 1],
                    [7, 3],
                    [9, 5],
                    [2, 7],
                    [4, 9],
                    [6, 6],
                    [8, 2],
                    [10, 4],
                ]}
            />

            <div className="absolute top-0 bottom-0 left-4 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent md:left-1/2 md:-translate-x-1/2" />

            <div className="space-y-8 md:space-y-12">
                {steps.map((step, index) => {
                    const itemClassName = cn('relative pl-12 md:grid md:grid-cols-2 md:gap-8 md:pl-0');
                    const cardClassName = cn('sirius-card p-6 md:p-8', index % 2 === 0 ? 'md:order-first' : 'md:col-start-2');

                    const itemContent = (
                        <>
                            <div className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background md:left-1/2 md:-translate-x-1/2">
                                <span className="font-sirius text-xs font-bold text-primary">{index + 1}</span>
                            </div>

                            <div className={cardClassName}>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="text-meta">{step.label}</span>
                                    {step.badge && <span className="sirius-pill-functional">{step.badge}</span>}
                                </div>
                                <h3 className="mb-2 font-sirius text-lg font-semibold text-foreground">{step.title}</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                            </div>
                        </>
                    );

                    if (!shouldAnimateInView) {
                        return (
                            <div key={step.id || index} className={itemClassName}>
                                {itemContent}
                            </div>
                        );
                    }

                    return (
                        <motion.div
                            key={step.id || index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={itemClassName}
                        >
                            {itemContent}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default SiriusStepTimeline;
