import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Animation state types for the astronaut
export type AstronautState = 'idle' | 'wave' | 'thinking' | 'celebrate' | 'celebrate-idea' | 'celebrate-ux' | 'celebrate-bug' | 'confused';

interface AstronautLottieProps {
    state?: AstronautState;
    className?: string; // Additional classes for the container
    size?: number; // Size in pixels
    showAura?: boolean; // Whether to show the space background
}

/**
 * A beautiful, pure SVG/CSS animated astronaut component.
 * Replaces the Lottie implementation for better reliability and customization.
 */
export function AstronautLottie({ state = 'idle', className = '', size = 80, showAura = false }: AstronautLottieProps) {
    // Animation Variants
    const bodyVariants = {
        idle: { y: [0, -6, 0], rotate: [0, 2, -2, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } },
        wave: { y: [0, -4, 0], rotate: [0, 2, -2, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
        thinking: { y: [0, -3, 0], rotate: [0, -2, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } },
        celebrate: { y: [0, -8, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } },
        'celebrate-idea': { y: [0, -10, 0], rotate: [0, 3, -3, 0], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' } },
        'celebrate-ux': { y: [0, -5, 0], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } },
        'celebrate-bug': { y: [0, -12, 0, -6, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeOut' } },
        confused: { rotate: [0, -5, 5, 0], x: [0, -2, 2, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
    };

    const leftArmVariants = {
        idle: { rotate: [-5, 5, -5], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
        wave: { rotate: [0, 30, 0, 30, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } },
        thinking: { rotate: 0, y: -2, x: 2, transition: { duration: 0.5 } },
        celebrate: { rotate: [-45, -60, -45], y: [-2, -6, -2], transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' } },
        'celebrate-idea': { rotate: [-60, -75, -60], y: [-4, -8, -4], transition: { duration: 0.3, repeat: Infinity, ease: 'easeInOut' } },
        'celebrate-ux': { rotate: [-30, -40, -30], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' } },
        'celebrate-bug': { rotate: [-80, -95, -80], y: [-6, -10, -6], transition: { duration: 0.35, repeat: Infinity, ease: 'easeOut' } },
        confused: { rotate: [-10, 10, -10], transition: { duration: 2, repeat: Infinity } },
    };

    const rightArmVariants = {
        idle: { rotate: [5, -5, 5], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } },
        wave: { rotate: 0, transition: { duration: 0.5 } },
        thinking: { rotate: -100, y: -8, x: -4, transition: { duration: 0.6 } },
        celebrate: { rotate: [45, 60, 45], y: [-2, -6, -2], transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut', delay: 0.1 } },
        'celebrate-idea': { rotate: [60, 75, 60], y: [-4, -8, -4], transition: { duration: 0.3, repeat: Infinity, ease: 'easeInOut', delay: 0.05 } },
        'celebrate-ux': { rotate: [50, 65, 50], y: [-3, -6, -3], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } },
        'celebrate-bug': { rotate: [80, 95, 80], y: [-6, -10, -6], transition: { duration: 0.35, repeat: Infinity, ease: 'easeOut', delay: 0.08 } },
        confused: { rotate: [-20, -40, -20], transition: { duration: 2, repeat: Infinity } },
    };

    return (
        <div className={cn('relative flex items-center justify-center', className)} style={{ width: size, height: size }}>
            {/* Deep Space Aura & Shooting Stars */}
            {showAura && <SpaceAura />}

            {/* The Detailed Astronaut SVG */}
            <motion.svg
                viewBox="0 0 100 100"
                className="relative z-10 h-full w-full drop-shadow-xl"
                initial="idle"
                animate={state}
                variants={bodyVariants}
                style={{ overflow: 'visible' }}
            >
                <defs>
                    <linearGradient id="visorDeepSpace" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2e1065" /> {/* Deep purple */}
                        <stop offset="50%" stopColor="#0f172a" /> {/* Slate 900 */}
                        <stop offset="100%" stopColor="#000000" /> {/* Black */}
                    </linearGradient>
                    <linearGradient id="suitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#f1f5f9" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Backpack (Equipment) */}
                <rect x="25" y="35" width="50" height="45" rx="8" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />

                {/* Left Arm (Back Segment) */}
                <motion.g variants={leftArmVariants} style={{ originX: 0.9, originY: 0.1 }} x="28" y="48">
                    <path d="M28 48 Q 15 58 22 70" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" fill="none" />
                    <circle cx="22" cy="70" r="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                </motion.g>

                {/* Legs with Boots */}
                <g transform="translate(0, -2)">
                    <path d="M40 75 L38 92 A 4 4 0 0 0 44 92 L46 75" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                    <rect x="36" y="88" width="10" height="6" rx="2" fill="#94a3b8" /> {/* Left Boot Sole */}
                    <path d="M60 75 L62 92 A 4 4 0 0 0 56 92 L54 75" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                    <rect x="54" y="88" width="10" height="6" rx="2" fill="#94a3b8" /> {/* Right Boot Sole */}
                </g>

                {/* Main Suit Body */}
                <rect x="32" y="42" width="36" height="38" rx="12" fill="url(#suitGradient)" stroke="#cbd5e1" strokeWidth="2" />

                {/* Chest/Control Panel */}
                <rect x="38" y="52" width="24" height="14" rx="3" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
                <circle cx="43" cy="59" r="2" fill="#ef4444" />
                <circle cx="50" cy="59" r="2" fill="#3b82f6" />
                <rect x="55" y="57" width="4" height="4" rx="1" fill="#fbbf24" />

                {/* Right Arm (Front Segment) */}
                <motion.g variants={rightArmVariants} style={{ originX: 0.1, originY: 0.1 }} x="72" y="48">
                    <path d="M72 48 Q 85 58 78 70" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" fill="none" />
                    <circle cx="78" cy="70" r="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                </motion.g>

                {/* Advanced Helmet */}
                <g>
                    {/* Outer Helmet Shell */}
                    <circle cx="50" cy="34" r="24" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                    <path d="M26 34 A 24 24 0 0 0 74 34" fill="none" stroke="#e2e8f0" strokeWidth="2" /> {/* Helmet Shine Line */}
                    {/* Visor Area */}
                    <path
                        d="M34 28 A 16 16 0 0 1 66 28 A 16 16 0 0 1 66 40 A 12 12 0 0 1 34 40 Z"
                        fill="url(#visorDeepSpace)"
                        stroke="#1e293b"
                        strokeWidth="2"
                    />
                    {/* Visor Reflection */}
                    <path d="M38 28 Q 50 20 62 28" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
                    <ellipse cx="40" cy="32" rx="3" ry="1.5" fill="white" opacity="0.4" transform="rotate(-45 40 32)" />
                </g>
            </motion.svg>
        </div>
    );
}

/**
 * Background Aura Component with Deep Space Theme
 */
function SpaceAura() {
    return (
        <div className="pointer-events-none absolute inset-[-40%] z-0 overflow-hidden rounded-full">
            {/* Deep Space Background Layer */}
            <div className="absolute inset-0 bg-[#0f1025]" />

            {/* Rotating Nebula Glow - Deep colors */}
            <motion.div
                className="absolute inset-[-50%] opacity-80 blur-3xl"
                style={{
                    background: 'conic-gradient(from 0deg at 50% 50%, #1e1b4b, #312e81, #4c1d95, #1e1b4b)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />

            {/* Stars Layer */}
            {[...Array(8)].map((_, i) => (
                <div
                    key={`star-${i}`}
                    className="absolute rounded-full bg-white opacity-60"
                    style={{
                        width: Math.random() * 2 + 1 + 'px',
                        height: Math.random() * 2 + 1 + 'px',
                        top: Math.random() * 100 + '%',
                        left: Math.random() * 100 + '%',
                        animation: `twinkle ${Math.random() * 2 + 1}s infinite alternate`,
                    }}
                />
            ))}

            {/* Inner Glow to emphasize center */}
            <div className="absolute inset-[15%] rounded-full bg-indigo-500/10 blur-xl" />

            {/* Shooting Star */}
            <ShootingStar />
        </div>
    );
}

function ShootingStar() {
    const [key, setKey] = useState(0);

    // Trigger effect every few seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setKey((prev) => prev + 1);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                key={key}
                className="absolute top-[20%] right-[-10%] h-0.5 w-12 bg-gradient-to-l from-transparent via-white to-transparent"
                style={{ rotate: '25deg', transformOrigin: 'right center' }}
                initial={{ opacity: 0, x: 20, y: -20, scale: 0.5 }}
                animate={{
                    opacity: [0, 1, 0],
                    x: [-20, -100],
                    y: [20, 100],
                    scale: 1.5,
                }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
            >
                <div className="absolute top-1/2 left-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_4px_rgba(255,255,255,0.6)]" />
            </motion.div>
        </AnimatePresence>
    );
}
