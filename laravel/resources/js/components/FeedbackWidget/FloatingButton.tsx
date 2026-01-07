import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { GripVertical, MessageCircle, X, ChevronUp } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AstronautLottie } from './AstronautLottie';

interface FloatingButtonProps {
    onClick: () => void;
    className?: string;
}

// localStorage keys
const POSITION_STORAGE_KEY = 'feedback-widget-position';
const MINIMIZED_STORAGE_KEY = 'feedback-widget-minimized';

// Default position (bottom-right, higher to avoid bottom nav)
const DEFAULT_POSITION = { x: 0, y: 0 };

interface Position {
    x: number;
    y: number;
}

/**
 * Professional floating action button with subtle animations.
 * Positioned bottom-right by default (higher to avoid bottom navigation).
 * Draggable to allow user to reposition. Position is persisted to localStorage.
 * Can be minimized to reduce visual clutter.
 */
export function FloatingButton({ onClick, className }: FloatingButtonProps) {
    const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
    const [isDragging, setIsDragging] = useState(false);
    const [showDragHint, setShowDragHint] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef<Position>({ x: 0, y: 0 });

    // Load saved position and minimized state from localStorage on mount
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

        try {
            const minimized = localStorage.getItem(MINIMIZED_STORAGE_KEY);
            if (minimized === 'true') {
                setIsMinimized(true);
            }
        } catch {
            // Ignore parsing errors, use default state
        }
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

    const getDragConstraints = useCallback(() => {
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 150;
        return {
            left: -maxX,
            right: 0,
            top: -maxY,
            bottom: 0,
        };
    }, []);

    const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // Update position during drag for real-time movement
        const newPosition = {
            x: dragStartPos.current.x + info.offset.x,
            y: dragStartPos.current.y + info.offset.y,
        };
        
        // Constrain to viewport bounds
        const constraints = getDragConstraints();
        const constrainedPosition = {
            x: Math.max(constraints.left, Math.min(constraints.right, newPosition.x)),
            y: Math.max(constraints.top, Math.min(constraints.bottom, newPosition.y)),
        };
        
        setPosition(constrainedPosition);
    };

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false);
        
        // Calculate final position
        const newPosition = {
            x: dragStartPos.current.x + info.offset.x,
            y: dragStartPos.current.y + info.offset.y,
        };
        
        // Constrain to viewport bounds
        const constraints = getDragConstraints();
        const constrainedPosition = {
            x: Math.max(constraints.left, Math.min(constraints.right, newPosition.x)),
            y: Math.max(constraints.top, Math.min(constraints.bottom, newPosition.y)),
        };
        
        setPosition(constrainedPosition);
        savePosition(constrainedPosition);
    };

    const handleClick = () => {
        // Only trigger click if not dragging (prevents accidental clicks during drag)
        if (!isDragging && !isMinimized) {
            onClick();
        }
    };

    const handleMinimize = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMinimized(true);
        try {
            localStorage.setItem(MINIMIZED_STORAGE_KEY, 'true');
        } catch {
            // Ignore storage errors
        }
    };

    const handleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMinimized(false);
        try {
            localStorage.removeItem(MINIMIZED_STORAGE_KEY);
        } catch {
            // Ignore storage errors
        }
    };

    return (
        <motion.div
            ref={containerRef}
            className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2 cursor-grab active:cursor-grabbing touch-none"
            drag={!isMinimized}
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={getDragConstraints()}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ x: position.x, y: position.y }}
            whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
            onHoverStart={() => {
                setShowDragHint(true);
                setIsHovered(true);
            }}
            onHoverEnd={() => {
                setShowDragHint(false);
                setIsHovered(false);
            }}
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

            {/* Speech Bubble - Only visible on hover/focus when not minimized */}
            <AnimatePresence>
                {isHovered && !isMinimized && !isDragging && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className={cn(
                            'px-3 py-1.5 rounded-full',
                            'bg-card text-card-foreground',
                            'border border-border shadow-sm',
                            'text-xs font-medium whitespace-nowrap',
                            'select-none pointer-events-none'
                        )}
                    >
                        Share feedback
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Button */}
            {isMinimized ? (
                <motion.button
                    onClick={handleExpand}
                    className={cn(
                        'group relative',
                        'flex items-center justify-center',
                        'size-10 md:size-12',
                        'rounded-full',
                        'bg-primary/80 text-primary-foreground',
                        'shadow-md shadow-primary/10',
                        'hover:bg-primary hover:shadow-lg hover:shadow-primary/15',
                        'transition-all duration-200',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        'select-none',
                        className
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 20
                    }}
                    aria-label="Expand feedback widget"
                >
                    <ChevronUp className="size-5 pointer-events-none" />
                </motion.button>
            ) : (
                <motion.button
                    onClick={handleClick}
                    drag={false}
                    className={cn(
                        'group relative',
                        'flex items-center justify-center',
                        'size-14 md:size-16',
                        'rounded-full',
                        'bg-primary text-primary-foreground',
                        'shadow-md shadow-primary/15',
                        'hover:shadow-lg hover:shadow-primary/20',
                        'transition-all duration-200',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        'select-none',
                        className
                    )}
                    whileHover={!isDragging ? { scale: 1.05 } : undefined}
                    whileTap={!isDragging ? { scale: 0.95 } : undefined}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                        scale: 1, 
                        opacity: 1
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 20
                    }}
                    aria-label="Open feedback widget - drag to reposition"
                >
                    {/* Astronaut animation on larger screens with Aura */}
                    <span className="hidden md:block pointer-events-none">
                        <AstronautLottie size={48} state="idle" showAura={false} />
                    </span>
                    
                    {/* Icon fallback on mobile */}
                    <MessageCircle className="size-6 md:hidden pointer-events-none" />
                    
                    {/* Minimize button - appears on hover */}
                    <AnimatePresence>
                        {isHovered && !isDragging && (
                            <motion.button
                                onClick={handleMinimize}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                                className={cn(
                                    'absolute -top-1 -right-1',
                                    'size-5 rounded-full',
                                    'bg-muted hover:bg-muted/80',
                                    'border border-border',
                                    'flex items-center justify-center',
                                    'shadow-sm',
                                    'transition-colors duration-150',
                                    'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                                )}
                                aria-label="Minimize feedback widget"
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <X className="size-3 text-muted-foreground" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </motion.button>
            )}
        </motion.div>
    );
}
