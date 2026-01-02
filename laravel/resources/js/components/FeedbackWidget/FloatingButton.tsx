import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { GripVertical, MessageCircle } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
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

// localStorage key for persisting position
const POSITION_STORAGE_KEY = 'feedback-widget-position';

// Default position (bottom-right, higher to avoid bottom nav)
const DEFAULT_POSITION = { x: 0, y: 0 };

interface Position {
    x: number;
    y: number;
}

/**
 * Floating action button with animated astronaut and always-visible speech bubble.
 * Positioned bottom-right by default (higher to avoid bottom navigation).
 * Draggable to allow user to reposition. Position is persisted to localStorage.
 */
export function FloatingButton({ onClick, className }: FloatingButtonProps) {
    const [messageIndex, setMessageIndex] = useState(0);
    const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
    const [isDragging, setIsDragging] = useState(false);
    const [showDragHint, setShowDragHint] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragControls = useDragControls();
    const dragStartPos = useRef<Position>({ x: 0, y: 0 });

    // Load saved position from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(POSITION_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as Position;
                // Validate the position is within viewport bounds
                const maxX = window.innerWidth - 100;
                const maxY = window.innerHeight - 150;
                setPosition({
                    x: Math.max(-maxX, Math.min(0, parsed.x)),
                    y: Math.max(-maxY, Math.min(0, parsed.y)),
                });
            }
        } catch {
            // Ignore parsing errors, use default position
        }
    }, []);

    // Cycle through messages every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // Save position to localStorage
    const savePosition = useCallback((newPosition: Position) => {
        try {
            localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(newPosition));
        } catch {
            // Ignore storage errors
        }
    }, []);

    const handleDragStart = () => {
        setIsDragging(true);
        dragStartPos.current = { ...position };
    };

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false);
        
        // Calculate new position
        const newPosition = {
            x: position.x + info.offset.x,
            y: position.y + info.offset.y,
        };
        
        // Constrain to viewport bounds
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 150;
        const constrainedPosition = {
            x: Math.max(-maxX, Math.min(0, newPosition.x)),
            y: Math.max(-maxY, Math.min(0, newPosition.y)),
        };
        
        setPosition(constrainedPosition);
        savePosition(constrainedPosition);
    };

    const handleClick = () => {
        // Only trigger click if not dragging (prevents accidental clicks during drag)
        if (!isDragging) {
            onClick();
        }
    };

    return (
        <motion.div
            ref={containerRef}
            className="fixed bottom-24 right-6 z-[9999] flex flex-col items-end gap-2 cursor-grab active:cursor-grabbing touch-none"
            drag
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{ x: position.x, y: position.y }}
            whileDrag={{ scale: 1.05 }}
            onHoverStart={() => setShowDragHint(true)}
            onHoverEnd={() => setShowDragHint(false)}
        >
            {/* Drag Handle Indicator (shows on hover) */}
            <AnimatePresence>
                {showDragHint && !isDragging && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute -left-8 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                        <GripVertical className="size-5" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Always Visible Speech Bubble */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    'px-3 py-1.5 rounded-full',
                    'bg-card text-card-foreground',
                    'border border-border shadow-md',
                    'text-xs font-medium whitespace-nowrap',
                    'select-none pointer-events-none'
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
                onClick={handleClick}
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
                    'select-none',
                    className
                )}
                whileHover={!isDragging ? { scale: 1.1 } : undefined}
                whileTap={!isDragging ? { scale: 0.95 } : undefined}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                    scale: 1, 
                    opacity: 1,
                    y: isDragging ? 0 : [0, -6, 0]
                }}
                transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    y: {
                        duration: 2.5,
                        repeat: isDragging ? 0 : Infinity,
                        ease: 'easeInOut'
                    }
                }}
                aria-label="Open feedback widget - drag to reposition"
            >
                {/* Shooting Star Effect */}
                <ShootingStar containerClass="rounded-full" />

                {/* Astronaut animation on larger screens with Aura */}
                <span className="hidden md:block pointer-events-none">
                    <AstronautLottie size={48} state="idle" showAura={true} />
                </span>
                
                {/* Icon fallback on mobile */}
                <MessageCircle className="size-6 md:hidden pointer-events-none" />
                
                {/* Pulse ring effect */}
                <motion.span
                    className="absolute inset-0 rounded-full bg-primary/50 pointer-events-none"
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut'
                    }}
                />
            </motion.button>
        </motion.div>
    );
}
