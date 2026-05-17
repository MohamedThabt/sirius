import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GridPattern } from '@/components/ui/shadcn-io/grid-pattern';
import { useIsMobile } from '@/hooks/use-mobile';
import { teamCollaboration } from '@/lib/sirius/content';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, Users } from 'lucide-react';
import React, { useState } from 'react';

export const TeamRolesSection: React.FC = () => {
    const [showAll, setShowAll] = useState(false);
    const maxDisplayed = 4;
    const isMobile = useIsMobile();
    const prefersReducedMotion = useReducedMotion();
    const [isHydrated, setIsHydrated] = useState(false);
    const shouldAnimateInView = isHydrated && !isMobile && !prefersReducedMotion;

    const iconGradients = [
        'bg-[var(--color-gradient-mint)]/15',
        'bg-[var(--color-gradient-peach)]/15',
        'bg-[var(--color-gradient-lavender)]/15',
        'bg-[var(--color-gradient-sky)]/15',
        'bg-[var(--color-gradient-rose)]/15',
    ];

    const iconTextColors = [
        'text-[var(--color-gradient-mint)]',
        'text-[var(--color-gradient-peach)]',
        'text-[var(--color-gradient-lavender)]',
        'text-[var(--color-gradient-sky)]',
        'text-[var(--color-gradient-rose)]',
    ];

    React.useEffect(() => {
        setIsHydrated(true);
    }, []);

    return (
        <section className="sirius-section scroll-mt-24 relative overflow-hidden md:scroll-mt-28" id="teams">
            {/* Grid Pattern Background */}
            <GridPattern
                width={40}
                height={40}
                x={-1}
                y={-1}
                className="absolute inset-0 h-full w-full [mask-image:radial-gradient(800px_circle_at_center,white,transparent)] fill-primary/[0.02] stroke-border/40"
                squares={[
                    [2, 3],
                    [5, 1],
                    [8, 4],
                    [12, 2],
                    [15, 5],
                    [3, 8],
                    [7, 6],
                    [10, 9],
                    [14, 7],
                    [18, 3],
                    [1, 12],
                    [6, 10],
                    [11, 13],
                    [16, 11],
                    [20, 8],
                ]}
            />

            <div className="sirius-container relative z-10">
                {/* Header */}
                <div className="mb-12 flex flex-col items-center justify-center">
                    <div className="flex max-w-2xl flex-col gap-4">
                        <span className="text-kicker text-center">{teamCollaboration.eyebrow}</span>
                        <h2 className="text-section-title text-center text-foreground">{teamCollaboration.title}</h2>
                        <p className="text-body text-center text-muted-foreground">{teamCollaboration.description}</p>
                    </div>
                </div>

                {/* Role Cards */}
                <div className="relative">
                    <div
                        className={cn(
                            'flex flex-wrap items-stretch justify-center gap-6',
                            !showAll && teamCollaboration.roles.length > maxDisplayed && 'max-h-[500px] overflow-hidden',
                        )}
                    >
                        {teamCollaboration.roles.slice(0, showAll ? undefined : maxDisplayed).map((role, index) => {
                            const card = (
                                <Card className="relative flex h-full w-full max-w-[320px] flex-col border-border bg-card/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg sm:w-80">
                                    {/* Role Icon & Header */}
                                    <div className="mb-4 flex items-center">
                                        <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', iconGradients[index % iconGradients.length])}>
                                            <Users className={cn('h-6 w-6', iconTextColors[index % iconTextColors.length])} />
                                        </div>
                                        <div className="flex flex-col pl-4">
                                            <span className="text-lg font-semibold text-foreground">{role.role}</span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">{role.description}</p>

                                    {/* Responsibilities */}
                                    <ul className="space-y-2.5">
                                        {role.responsibilities.map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-2.5 text-sm text-foreground">
                                                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                    <Check className="h-3 w-3 text-primary" />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            );

                            if (!shouldAnimateInView) {
                                return (
                                    <div key={index} className="flex">
                                        {card}
                                    </div>
                                );
                            }

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="flex"
                                >
                                    {card}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Load More Button */}
                    {teamCollaboration.roles.length > maxDisplayed && !showAll && (
                        <>
                            <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-background to-transparent" />
                            <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 transform">
                                <Button variant="outline" onClick={() => setShowAll(true)} className="gap-2">
                                    Load More
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {/* Use Cases Pills */}
                <div className="mt-12">
                    <p className="mb-4 text-center text-sm text-muted-foreground">Common Use Cases</p>
                    {shouldAnimateInView ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-3"
                        >
                            {teamCollaboration.useCases.map((spec, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                    className="flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 backdrop-blur-sm transition-colors hover:border-primary/30"
                                >
                                    <spec.icon className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium text-foreground">{spec.name}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-3">
                            {teamCollaboration.useCases.map((spec, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 backdrop-blur-sm transition-colors hover:border-primary/30"
                                >
                                    <spec.icon className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium text-foreground">{spec.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default TeamRolesSection;
