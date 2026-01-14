'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Brain, FileText, GitBranch, Layers, SparklesIcon, Users } from 'lucide-react';
import React from 'react';

interface DatabaseWithRestApiProps {
    className?: string;
    circleText?: string;
    badgeTexts?: {
        first: string;
        second: string;
        third: string;
        fourth: string;
    };
    buttonText?: string;
    title?: string;
    lightColor?: string;
    leftBadgeText?: string;
}

const DatabaseWithRestApi: React.FC<DatabaseWithRestApiProps> = ({
    className,
    circleText = 'Sirius AI',
    badgeTexts = {
        first: 'Brief',
        second: 'PRD',
        third: 'SRS',
        fourth: 'ERD',
    },
    buttonText = 'GitHub Export',
    title = 'From Brief to Build-Ready Docs',
    lightColor = '#6495ED',
    leftBadgeText = 'Team Sync',
}) => {
    return (
        <div className={cn('relative flex h-[350px] w-full max-w-[500px] flex-col items-center', className)}>
            {/* SVG Paths */}
            <svg className="h-full w-full text-muted-foreground/30" viewBox="0 0 200 100">
                <g stroke="currentColor" fill="none" strokeWidth="0.4" strokeDasharray="100 100" pathLength="100">
                    <path d="M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 10" />
                    <path d="M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 10" />
                    <path d="M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 10" />
                    <path d="M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 10" />
                    {/* Animation for path drawing */}
                    <animate
                        attributeName="stroke-dashoffset"
                        from="100"
                        to="0"
                        dur="1s"
                        fill="freeze"
                        calcMode="spline"
                        keySplines="0.25,0.1,0.5,1"
                        keyTimes="0; 1"
                    />
                </g>

                {/* Celestial Blue lights traveling along paths */}
                <g mask="url(#db-mask-1)">
                    <circle className="database db-light-1" cx="0" cy="0" r="12" fill="url(#db-blue-grad)" />
                </g>
                <g mask="url(#db-mask-2)">
                    <circle className="database db-light-2" cx="0" cy="0" r="12" fill="url(#db-blue-grad)" />
                </g>
                <g mask="url(#db-mask-3)">
                    <circle className="database db-light-3" cx="0" cy="0" r="12" fill="url(#db-blue-grad)" />
                </g>
                <g mask="url(#db-mask-4)">
                    <circle className="database db-light-4" cx="0" cy="0" r="12" fill="url(#db-blue-grad)" />
                </g>

                {/* Badge Buttons */}
                <g stroke="currentColor" fill="none" strokeWidth="0.4">
                    {/* First Badge - Brief (input) */}
                    <g>
                        <rect fill="var(--card)" x="14" y="5" width="34" height="10" rx="5" stroke="var(--border)" />
                        <FileTextIcon x="18" y="7.5" />
                        <text x="28" y="12" fill="var(--foreground)" stroke="none" fontSize="5" fontWeight="500">
                            {badgeTexts.first}
                        </text>
                    </g>
                    {/* Second Badge - PRD */}
                    <g>
                        <rect fill="var(--card)" x="60" y="5" width="34" height="10" rx="5" stroke="var(--border)" />
                        <FileTextIcon x="64" y="7.5" />
                        <text x="74" y="12" fill="var(--foreground)" stroke="none" fontSize="5" fontWeight="500">
                            {badgeTexts.second}
                        </text>
                    </g>
                    {/* Third Badge - SRS */}
                    <g>
                        <rect fill="var(--card)" x="108" y="5" width="34" height="10" rx="5" stroke="var(--border)" />
                        <LayersIcon x="112" y="7.5" />
                        <text x="122" y="12" fill="var(--foreground)" stroke="none" fontSize="5" fontWeight="500">
                            {badgeTexts.third}
                        </text>
                    </g>
                    {/* Fourth Badge - ERD */}
                    <g>
                        <rect fill="var(--card)" x="150" y="5" width="40" height="10" rx="5" stroke="var(--border)" />
                        <DatabaseIcon x="154" y="7.5" />
                        <text x="165" y="12" fill="var(--foreground)" stroke="none" fontSize="5" fontWeight="500">
                            {badgeTexts.fourth}
                        </text>
                    </g>
                </g>

                <defs>
                    {/* Masks for light paths */}
                    <mask id="db-mask-1">
                        <path d="M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 10" strokeWidth="0.5" stroke="white" />
                    </mask>
                    <mask id="db-mask-2">
                        <path d="M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 10" strokeWidth="0.5" stroke="white" />
                    </mask>
                    <mask id="db-mask-3">
                        <path d="M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 10" strokeWidth="0.5" stroke="white" />
                    </mask>
                    <mask id="db-mask-4">
                        <path d="M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 10" strokeWidth="0.5" stroke="white" />
                    </mask>
                    {/* Celestial Blue radial gradient */}
                    <radialGradient id="db-blue-grad" fx="1">
                        <stop offset="0%" stopColor={lightColor} />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                </defs>
            </svg>

            {/* Main Box */}
            <div className="absolute bottom-10 flex w-full flex-col items-center">
                {/* Bottom shadow */}
                <div className="absolute -bottom-4 h-[100px] w-[62%] rounded-lg bg-accent/30" />

                {/* Box title */}
                <div className="absolute -top-3 z-20 flex items-center justify-center rounded-lg border border-border bg-card px-2 py-1 sm:-top-4 sm:py-1.5">
                    <SparklesIcon className="size-3 text-primary" />
                    <span className="ml-2 text-[10px] text-foreground">{title}</span>
                </div>

                {/* Box outer circle with icon */}
                <div className="absolute -bottom-8 z-30 grid h-[60px] w-[60px] place-items-center rounded-full border-t border-border bg-card font-semibold text-xs">
                    <div className="flex flex-col items-center justify-center">
                        <Brain className="h-4 w-4 text-primary" />
                        <span className="mt-0.5 text-[8px] text-foreground">{circleText}</span>
                    </div>
                </div>

                {/* Box content with pulsing circles */}
                <div className="relative z-10 flex h-[150px] w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-background shadow-md">
                    {/* Floating badges */}
                    <div className="absolute bottom-8 left-8 z-10 flex h-7 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs sm:left-12">
                        <Users className="size-4 text-primary" />
                        <span className="text-foreground">{leftBadgeText}</span>
                    </div>
                    <div className="absolute right-8 top-6 z-10 hidden h-7 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs sm:right-16 sm:flex">
                        <GitBranch className="size-4 text-primary" />
                        <span className="text-foreground">{buttonText}</span>
                    </div>

                    {/* Pulsing concentric circles */}
                    <motion.div
                        className="absolute -bottom-14 h-[100px] w-[100px] rounded-full border-t border-primary/20 bg-primary/5"
                        animate={{
                            scale: [0.98, 1.02, 0.98, 1, 1, 1, 1, 1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute -bottom-20 h-[145px] w-[145px] rounded-full border-t border-primary/15 bg-primary/5"
                        animate={{
                            scale: [1, 1, 1, 0.98, 1.02, 0.98, 1, 1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute -bottom-[100px] h-[190px] w-[190px] rounded-full border-t border-primary/10 bg-primary/5"
                        animate={{
                            scale: [1, 1, 1, 1, 1, 0.98, 1.02, 0.98, 1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute -bottom-[120px] h-[235px] w-[235px] rounded-full border-t border-primary/5 bg-primary/5"
                        animate={{
                            scale: [1, 1, 1, 1, 1, 1, 0.98, 1.02, 0.98, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            </div>
        </div>
    );
};

export default DatabaseWithRestApi;

const FileTextIcon = ({ x = '0', y = '0' }: { x: string; y: string }) => (
    <svg
        x={x}
        y={y}
        xmlns="http://www.w3.org/2000/svg"
        width="5"
        height="5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
    </svg>
);

const LayersIcon = ({ x = '0', y = '0' }: { x: string; y: string }) => (
    <svg
        x={x}
        y={y}
        xmlns="http://www.w3.org/2000/svg"
        width="5"
        height="5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
        <path d="m22 12.5-8.97 4.08a2 2 0 0 1-1.66 0L2.4 12.5" />
        <path d="m22 17.5-8.97 4.08a2 2 0 0 1-1.66 0L2.4 17.5" />
    </svg>
);

const DatabaseIcon = ({ x = '0', y = '0' }: { x: string; y: string }) => (
    <svg
        x={x}
        y={y}
        xmlns="http://www.w3.org/2000/svg"
        width="5"
        height="5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
);
