import React from 'react';
import { cn } from '@/lib/utils';
import { specDrivenDevelopment } from '@/lib/sirius/content';

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
                'flex flex-col lg:border-r py-10 relative group/feature border-border',
                (index === 0 || index === 4) && 'lg:border-l border-border',
                index < 4 && 'lg:border-b border-border'
            )}
        >
            {index < 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-muted to-transparent pointer-events-none" />
            )}
            {index >= 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-muted to-transparent pointer-events-none" />
            )}
            <div className="mb-4 relative z-10 px-10 text-muted-foreground">
                <Icon className="w-6 h-6" />
            </div>
            <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-muted-foreground/30 group-hover/feature:bg-primary transition-all duration-200 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
                    {title}
                </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs relative z-10 px-10">
                {description}
            </p>
        </div>
    );
};

export const ProblemSolutionSection: React.FC = () => {
    const { eyebrow, title, problem } = specDrivenDevelopment;

    return (
        <section className="sirius-section relative overflow-hidden bg-background" id="why-sirius">
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

                {/* Features Grid with Hover Effects */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 max-w-7xl mx-auto">
                    {problem.painPoints.map((point, index) => (
                        <Feature
                            key={point.title}
                            title={point.title}
                            description={point.description}
                            icon={point.icon}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemSolutionSection;
