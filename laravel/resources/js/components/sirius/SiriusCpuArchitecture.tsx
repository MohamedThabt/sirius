'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export interface SiriusCpuArchitectureProps {
    className?: string;
    width?: string;
    height?: string;
    text?: string;
    showCpuConnections?: boolean;
    lineMarkerSize?: number;
    animateText?: boolean;
    animateLines?: boolean;
    animateMarkers?: boolean;
}

const SiriusCpuArchitecture: React.FC<SiriusCpuArchitectureProps> = ({
    className,
    width = '100%',
    height = '100%',
    text = 'AI',
    showCpuConnections = true,
    animateText = true,
    lineMarkerSize = 18,
    animateLines = true,
    animateMarkers = true,
}) => {
    return (
        <svg className={cn('text-muted', className)} width={width} height={height} viewBox="0 0 200 100">
            {/* Paths */}
            <g
                stroke="currentColor"
                fill="none"
                strokeWidth="0.3"
                strokeDasharray="100 100"
                pathLength="100"
                markerStart="url(#sirius-cpu-circle-marker)"
            >
                {/* 1st - Brief input */}
                <path strokeDasharray="100 100" pathLength="100" d="M 10 20 h 79.5 q 5 0 5 5 v 30" />
                {/* 2nd - PRD input */}
                <path strokeDasharray="100 100" pathLength="100" d="M 180 10 h -69.7 q -5 0 -5 5 v 30" />
                {/* 3rd - SRS input */}
                <path d="M 130 20 v 21.8 q 0 5 -5 5 h -10" />
                {/* 4th - ERD output */}
                <path d="M 170 80 v -21.8 q 0 -5 -5 -5 h -50" />
                {/* 5th - Specs output */}
                <path strokeDasharray="100 100" pathLength="100" d="M 135 65 h 15 q 5 0 5 5 v 10 q 0 5 -5 5 h -39.8 q -5 0 -5 -5 v -20" />
                {/* 6th - Wireframe output */}
                <path d="M 94.8 95 v -36" />
                {/* 7th - Workflow output */}
                <path d="M 88 88 v -15 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -5 q 0 -5 5 -5 h 14" />
                {/* 8th - GitHub export */}
                <path d="M 30 30 h 25 q 5 0 5 5 v 6.5 q 0 5 5 5 h 20" />

                {animateLines && (
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
                )}
            </g>

            {/* 1. Primary Orange Light (Brief) */}
            <g mask="url(#sirius-cpu-mask-1)">
                <circle className="cpu-architecture cpu-line-1" cx="0" cy="0" r="8" fill="url(#sirius-cpu-primary-grad)" />
            </g>
            {/* 2. Secondary Orange Light (PRD) */}
            <g mask="url(#sirius-cpu-mask-2)">
                <circle className="cpu-architecture cpu-line-2" cx="0" cy="0" r="8" fill="url(#sirius-cpu-secondary-grad)" />
            </g>
            {/* 3. Accent Light (SRS) */}
            <g mask="url(#sirius-cpu-mask-3)">
                <circle className="cpu-architecture cpu-line-3" cx="0" cy="0" r="8" fill="url(#sirius-cpu-accent-grad)" />
            </g>
            {/* 4. White Light (ERD) */}
            <g mask="url(#sirius-cpu-mask-4)">
                <circle className="cpu-architecture cpu-line-4" cx="0" cy="0" r="8" fill="url(#sirius-cpu-white-grad)" />
            </g>
            {/* 5. Muted Light (Specs) */}
            <g mask="url(#sirius-cpu-mask-5)">
                <circle className="cpu-architecture cpu-line-5" cx="0" cy="0" r="8" fill="url(#sirius-cpu-muted-grad)" />
            </g>
            {/* 6. Primary Light (Wireframe) */}
            <g mask="url(#sirius-cpu-mask-6)">
                <circle className="cpu-architecture cpu-line-6" cx="0" cy="0" r="8" fill="url(#sirius-cpu-primary-grad)" />
            </g>
            {/* 7. Secondary Light (Workflow) */}
            <g mask="url(#sirius-cpu-mask-7)">
                <circle className="cpu-architecture cpu-line-7" cx="0" cy="0" r="8" fill="url(#sirius-cpu-secondary-grad)" />
            </g>
            {/* 8. Accent Light (GitHub) */}
            <g mask="url(#sirius-cpu-mask-8)">
                <circle className="cpu-architecture cpu-line-8" cx="0" cy="0" r="8" fill="url(#sirius-cpu-accent-grad)" />
            </g>

            {/* Sirius AI Core */}
            <g>
                {showCpuConnections && (
                    <g fill="url(#sirius-cpu-connection-gradient)">
                        <rect x="93" y="37" width="2.5" height="5" rx="0.7" />
                        <rect x="104" y="37" width="2.5" height="5" rx="0.7" />
                        <rect x="116.3" y="44" width="2.5" height="5" rx="0.7" transform="rotate(90 116.25 45.5)" />
                        <rect x="122.8" y="44" width="2.5" height="5" rx="0.7" transform="rotate(90 116.25 45.5)" />
                        <rect x="104" y="16" width="2.5" height="5" rx="0.7" transform="rotate(180 105.25 39.5)" />
                        <rect x="114.5" y="16" width="2.5" height="5" rx="0.7" transform="rotate(180 105.25 39.5)" />
                        <rect x="80" y="-13.6" width="2.5" height="5" rx="0.7" transform="rotate(270 115.25 19.5)" />
                        <rect x="87" y="-13.6" width="2.5" height="5" rx="0.7" transform="rotate(270 115.25 19.5)" />
                    </g>
                )}

                {/* Main Sirius Rectangle */}
                <rect x="85" y="40" width="30" height="20" rx="2" fill="var(--card)" filter="url(#sirius-cpu-light-shadow)" stroke="var(--primary)" strokeWidth="0.5" />

                {/* Sirius Text */}
                <text
                    x="92"
                    y="52.5"
                    fontSize="7"
                    fill={animateText ? 'url(#sirius-cpu-text-gradient)' : 'var(--foreground)'}
                    fontWeight="600"
                    letterSpacing="0.05em"
                >
                    {text}
                </text>
            </g>

            {/* Masks */}
            <defs>
                <mask id="sirius-cpu-mask-1">
                    <path d="M 10 20 h 79.5 q 5 0 5 5 v 24" strokeWidth="0.5" stroke="white" />
                </mask>
                <mask id="sirius-cpu-mask-2">
                    <path d="M 180 10 h -69.7 q -5 0 -5 5 v 24" strokeWidth="0.5" stroke="white" />
                </mask>
                <mask id="sirius-cpu-mask-3">
                    <path d="M 130 20 v 21.8 q 0 5 -5 5 h -10" strokeWidth="0.5" stroke="white" />
                </mask>
                <mask id="sirius-cpu-mask-4">
                    <path d="M 170 80 v -21.8 q 0 -5 -5 -5 h -50" strokeWidth="0.5" stroke="white" />
                </mask>
                <mask id="sirius-cpu-mask-5">
                    <path d="M 135 65 h 15 q 5 0 5 5 v 10 q 0 5 -5 5 h -39.8 q -5 0 -5 -5 v -20" strokeWidth="0.5" stroke="white" />
                </mask>
                <mask id="sirius-cpu-mask-6">
                    <path d="M 94.8 95 v -36" strokeWidth="0.5" stroke="white" />
                </mask>
                <mask id="sirius-cpu-mask-7">
                    <path d="M 88 88 v -15 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -5 q 0 -5 5 -5 h 14" strokeWidth="0.5" stroke="white" />
                </mask>
                <mask id="sirius-cpu-mask-8">
                    <path d="M 30 30 h 25 q 5 0 5 5 v 6.5 q 0 5 5 5 h 20" strokeWidth="0.5" stroke="white" />
                </mask>

                {/* Sirius Celestial Blue Gradients */}
                <radialGradient id="sirius-cpu-primary-grad" fx="1">
                    <stop offset="0%" stopColor="#6495ED" />
                    <stop offset="50%" stopColor="#7AA6F5" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <radialGradient id="sirius-cpu-secondary-grad" fx="1">
                    <stop offset="0%" stopColor="#7AA6F5" />
                    <stop offset="50%" stopColor="#6495ED" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <radialGradient id="sirius-cpu-accent-grad" fx="1">
                    <stop offset="0%" stopColor="#B4D4FF" />
                    <stop offset="50%" stopColor="#93C5FD" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <radialGradient id="sirius-cpu-white-grad" fx="1">
                    <stop offset="0%" stopColor="white" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <radialGradient id="sirius-cpu-muted-grad" fx="1">
                    <stop offset="0%" stopColor="#A3A3A3" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                <filter id="sirius-cpu-light-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="1.5" dy="1.5" stdDeviation="1" floodColor="black" floodOpacity="0.1" />
                </filter>

                <marker
                    id="sirius-cpu-circle-marker"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth={lineMarkerSize}
                    markerHeight={lineMarkerSize}
                >
                    <circle id="innerMarkerCircle" cx="5" cy="5" r="2" fill="var(--card)" stroke="var(--border)" strokeWidth="0.5">
                        {animateMarkers && <animate attributeName="r" values="0; 3; 2" dur="0.5s" />}
                    </circle>
                </marker>

                {/* CPU connection gradient */}
                <linearGradient id="sirius-cpu-connection-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--muted-foreground)" />
                    <stop offset="60%" stopColor="var(--border)" />
                </linearGradient>

                {/* Sirius Text Gradient Animation */}
                <linearGradient id="sirius-cpu-text-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--muted-foreground)">
                        <animate
                            attributeName="offset"
                            values="-2; -1; 0"
                            dur="5s"
                            repeatCount="indefinite"
                            calcMode="spline"
                            keyTimes="0; 0.5; 1"
                            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                        />
                    </stop>
                    <stop offset="25%" stopColor="var(--primary)">
                        <animate
                            attributeName="offset"
                            values="-1; 0; 1"
                            dur="5s"
                            repeatCount="indefinite"
                            calcMode="spline"
                            keyTimes="0; 0.5; 1"
                            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                        />
                    </stop>
                    <stop offset="50%" stopColor="var(--muted-foreground)">
                        <animate
                            attributeName="offset"
                            values="0; 1; 2;"
                            dur="5s"
                            repeatCount="indefinite"
                            calcMode="spline"
                            keyTimes="0; 0.5; 1"
                            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                        />
                    </stop>
                </linearGradient>
            </defs>
        </svg>
    );
};

export default SiriusCpuArchitecture;
