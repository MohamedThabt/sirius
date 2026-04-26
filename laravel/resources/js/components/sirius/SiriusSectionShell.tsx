import { cn } from '@/lib/utils';
import React from 'react';

interface SiriusSectionShellProps {
    id?: string;
    eyebrow?: string;
    title: string;
    subtitle?: string;
    align?: 'left' | 'center';
    children: React.ReactNode;
    className?: string;
}

export const SiriusSectionShell: React.FC<SiriusSectionShellProps> = ({ id, eyebrow, title, subtitle, align = 'center', children, className }) => {
    return (
        <section id={id} className={cn('sirius-section bg-background', id && 'scroll-mt-24 md:scroll-mt-28', className)}>
            <div className="sirius-container">
                {(eyebrow || title || subtitle) && (
                    <div className={cn('mb-10 md:mb-12', align === 'center' ? 'mx-auto max-w-3xl text-center' : 'text-left')}>
                        {eyebrow && <span className="text-kicker mb-2 block">{eyebrow}</span>}
                        {title && <h2 className="text-section-title mb-4 text-foreground">{title}</h2>}
                        {subtitle && <p className="text-body text-muted-foreground">{subtitle}</p>}
                    </div>
                )}
                {children}
            </div>
        </section>
    );
};

export default SiriusSectionShell;
