import { specDrivenDevelopment } from '@/lib/sirius/content';
import { cn } from '@/lib/utils';
import React from 'react';

const Feature = ({
    title,
    description,
    icon: Icon,
    index,
}: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    index: number;
}) => {
    return (
        <div
            className={cn(
                'group/feature relative flex flex-col border-border py-10',
                'border-b',
                index === 3 && 'border-b-0',
                index < 2 ? 'md:border-b' : 'md:border-b-0',
                index % 2 === 0 ? 'md:border-r' : 'md:border-r-0',
                'lg:border-b-0',
                index < 3 ? 'lg:border-r' : 'lg:border-r-0',
            )}
        >
            {index < 4 && (
                <div className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-t from-muted to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100" />
            )}
            {index >= 4 && (
                <div className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-b from-muted to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100" />
            )}
            <div className="relative z-10 mb-4 px-6 text-muted-foreground md:px-10">
                <Icon className="h-6 w-6" />
            </div>
            <div className="relative z-10 mb-2 px-6 text-lg font-bold md:px-10">
                <div className="absolute inset-y-0 left-0 h-6 w-1 origin-center rounded-tr-full rounded-br-full bg-muted-foreground/30 transition-all duration-200 group-hover/feature:h-8 group-hover/feature:bg-gradient-to-b group-hover/feature:from-[var(--color-gradient-lavender)] group-hover/feature:to-[var(--color-gradient-mint)]" />
                <span className="inline-block text-foreground transition duration-200 group-hover/feature:translate-x-2">{title}</span>
            </div>
            <p className="relative z-10 max-w-xs px-6 text-sm text-muted-foreground md:px-10">{description}</p>
        </div>
    );
};

export const ProblemSolutionSection: React.FC = () => {
    const { eyebrow, title, problem } = specDrivenDevelopment;

    return (
        <section className="sirius-section relative overflow-hidden bg-background" id="why-sirius">
            <div className="sirius-container relative z-10">
                {/* Header */}
                <div className="mb-12 flex flex-col items-center justify-center md:mb-16">
                    <div className="flex max-w-2xl flex-col gap-4">
                        <span className="text-kicker text-center">{eyebrow}</span>
                        <h2 className="text-section-title text-center text-foreground">{title}</h2>
                    </div>
                </div>

                {/* Features Grid with Hover Effects */}
                <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 overflow-hidden rounded-xl border border-border md:grid-cols-2 lg:grid-cols-4">
                    {problem.painPoints.map((point, index) => (
                        <Feature key={point.title} title={point.title} description={point.description} icon={point.icon} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemSolutionSection;
