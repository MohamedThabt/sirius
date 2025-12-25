import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

interface StarConfettiProps {
    show: boolean;
    onComplete?: () => void;
}

/**
 * Star confetti effect shown on successful feedback submission.
 * Creates a burst of animated stars using Framer Motion.
 */
export function StarConfetti({ show, onComplete }: StarConfettiProps) {
    const stars = Array.from({ length: 12 }, (_, i) => i);

    const handleAnimationComplete = useCallback(() => {
        onComplete?.();
    }, [onComplete]);

    return (
        <AnimatePresence onExitComplete={handleAnimationComplete}>
            {show && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {stars.map((i) => {
                        const angle = (i / stars.length) * Math.PI * 2;
                        const distance = 80 + Math.random() * 40;
                        const endX = Math.cos(angle) * distance;
                        const endY = Math.sin(angle) * distance;
                        const delay = Math.random() * 0.2;
                        const size = 10 + Math.random() * 10;

                        return (
                            <motion.div
                                key={i}
                                className="absolute left-1/2 top-1/2 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                                initial={{ 
                                    x: 0, 
                                    y: 0, 
                                    scale: 0, 
                                    opacity: 1,
                                    rotate: 0
                                }}
                                animate={{ 
                                    x: endX, 
                                    y: endY, 
                                    scale: 1, 
                                    opacity: 0,
                                    rotate: 360
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ 
                                    duration: 0.8, 
                                    delay,
                                    ease: 'easeOut'
                                }}
                                style={{ fontSize: size }}
                            >
                                {['✦', '★', '✧'][i % 3]}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </AnimatePresence>
    );
}

/**
 * A reusable shooting star that streaks across the container periodically.
 */
export function ShootingStar({ containerClass = '' }: { containerClass?: string }) {
    const [trigger, setTrigger] = useState(0);

    // Trigger periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setTrigger(prev => prev + 1);
        }, 5000); // Every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${containerClass}`}>
            <AnimatePresence>
                {trigger > 0 && (
                    <motion.div
                        key={trigger}
                        initial={{ top: '20%', left: '100%', opacity: 0, scale: 0.5 }}
                        animate={{ 
                            top: '80%', 
                            left: '-20%', 
                            opacity: [0, 1, 1, 0],
                            scale: 1 
                        }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute h-0.5 w-16 bg-gradient-to-l from-transparent via-white to-transparent"
                        style={{ rotate: '45deg' }}
                    >
                        {/* Star at the head */}
                        <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
