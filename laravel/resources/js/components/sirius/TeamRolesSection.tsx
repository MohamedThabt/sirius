import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GridPattern } from '@/components/ui/shadcn-io/grid-pattern';
import { teamCollaboration } from '@/lib/sirius/content';
import { Users, ChevronDown, Check } from 'lucide-react';

export const TeamRolesSection: React.FC = () => {
    const [showAll, setShowAll] = useState(false);
    const maxDisplayed = 4;

    return (
        <section className="sirius-section relative overflow-hidden" id="teams">
            {/* Grid Pattern Background */}
            <GridPattern
                width={40}
                height={40}
                x={-1}
                y={-1}
                className="absolute inset-0 h-full w-full fill-primary/[0.02] stroke-border/40 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
                squares={[
                    [2, 3], [5, 1], [8, 4], [12, 2], [15, 5],
                    [3, 8], [7, 6], [10, 9], [14, 7], [18, 3],
                    [1, 12], [6, 10], [11, 13], [16, 11], [20, 8],
                ]}
            />

            <div className="sirius-container relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center justify-center mb-12">
                    <div className="flex flex-col gap-4 max-w-2xl">
                        <span className="text-kicker text-center">{teamCollaboration.eyebrow}</span>
                        <h2 className="text-center text-section-title text-foreground">
                            {teamCollaboration.title}
                        </h2>
                        <p className="text-center text-body text-muted-foreground">
                            {teamCollaboration.description}
                        </p>
                    </div>
                </div>

                {/* Role Cards */}
                <div className="relative">
                    <div
                        className={cn(
                            'flex justify-center items-stretch gap-6 flex-wrap',
                            !showAll && teamCollaboration.roles.length > maxDisplayed && 'max-h-[500px] overflow-hidden'
                        )}
                    >
                        {teamCollaboration.roles.slice(0, showAll ? undefined : maxDisplayed).map((role, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="flex"
                            >
                                <Card className="w-80 h-full flex flex-col p-6 relative bg-card/80 backdrop-blur-sm border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                                    {/* Role Icon & Header */}
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex flex-col pl-4">
                                            <span className="font-semibold text-lg text-foreground">
                                                {role.role}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-muted-foreground text-sm mb-5 leading-relaxed flex-1">
                                        {role.description}
                                    </p>

                                    {/* Responsibilities */}
                                    <ul className="space-y-2.5">
                                        {role.responsibilities.map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-2.5 text-sm text-foreground">
                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Check className="w-3 h-3 text-primary" />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Load More Button */}
                    {teamCollaboration.roles.length > maxDisplayed && !showAll && (
                        <>
                            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
                            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                                <Button variant="outline" onClick={() => setShowAll(true)} className="gap-2">
                                    Load More
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {/* Use Cases Pills */}
                <div className="mt-12">
                    <p className="text-center text-sm text-muted-foreground mb-4">Common Use Cases</p>
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
                            className="flex items-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur-sm px-4 py-2 hover:border-primary/30 transition-colors"
                        >
                            <spec.icon className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground font-medium">{spec.name}</span>
                        </motion.div>
                    ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default TeamRolesSection;
