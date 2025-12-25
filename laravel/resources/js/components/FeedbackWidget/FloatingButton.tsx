import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AstronautLottie } from './AstronautLottie';
import { ShootingStar } from './StarConfetti';

interface FloatingButtonProps {
    onClick: () => void;
    className?: string;
}

// Messages the astronaut says - cycles through them
const messages = [
    "Got feedback?",
    "Found a bug?",
    "Share ideas!",
    "Need help?",
];

/**
 * Floating action button with animated astronaut and always-visible speech bubble.
 * Fixed position bottom-right, bounces on hover.
 */
export function FloatingButton({ onClick, className }: FloatingButtonProps) {
    const [messageIndex, setMessageIndex] = useState(0);

    // Cycle through messages every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
            {/* Always Visible Speech Bubble */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    'px-3 py-1.5 rounded-full',
                    'bg-card text-card-foreground',
                    'border border-border shadow-md',
                    'text-xs font-medium whitespace-nowrap'
                )}
            >
                <AnimatePresence mode="wait">
                    <motion.span
                        key={messageIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                    >
                        {messages[messageIndex]} 💬
                    </motion.span>
                </AnimatePresence>
            </motion.div>

            {/* Main Button */}
            <motion.button
                onClick={onClick}
                className={cn(
                    'group relative',
                    'flex items-center justify-center',
                    'size-14 md:size-16',
                    'rounded-full',
                    'bg-primary text-primary-foreground',
                    'shadow-lg shadow-primary/25',
                    'hover:shadow-xl hover:shadow-primary/30',
                    'transition-all duration-300',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    className
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                    scale: 1, 
                    opacity: 1,
                    y: [0, -6, 0]
                }}
                transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    y: {
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }
                }}
                aria-label="Open feedback widget"
            >
                {/* Shooting Star Effect */}
                <ShootingStar containerClass="rounded-full" />

                {/* Astronaut animation on larger screens with Aura */}
                <span className="hidden md:block">
                    <AstronautLottie size={48} state="idle" showAura={true} />
                </span>
                
                {/* Icon fallback on mobile */}
                <MessageCircle className="size-6 md:hidden" />
                
                {/* Pulse ring effect */}
                <motion.span
                    className="absolute inset-0 rounded-full bg-primary/50"
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut'
                    }}
                />
            </motion.button>
        </div>
    );
}
