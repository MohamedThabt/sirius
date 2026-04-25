import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useResizablePanel Hook
 *
 * WHY: Nearly identical resizable panel logic was duplicated in:
 * - DatabaseDesigner.tsx
 * - SystemArchitecture.tsx
 * - SystemOverview.tsx
 *
 * This hook provides:
 * 1. Width state as percentage (constrained between min/max)
 * 2. isResizing state for cursor styling
 * 3. handleMouseDown handler for the resize divider
 * 4. Automatic cleanup of global event listeners
 * 5. requestAnimationFrame throttling for smooth performance
 *
 * The containerRef must be passed to the parent container that contains both panels.
 */

interface UseResizablePanelOptions {
    /** Initial width as percentage (default: 50) */
    initialWidth?: number;
    /** Minimum width as percentage (default: 20) */
    minWidth?: number;
    /** Maximum width as percentage (default: 80) */
    maxWidth?: number;
}

interface UseResizablePanelReturn {
    /** Current width as percentage */
    width: number;
    /** Whether the user is currently resizing */
    isResizing: boolean;
    /** Attach this to the resize handle's onMouseDown */
    handleMouseDown: (e: React.MouseEvent) => void;
    /** Attach this ref to the container element */
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useResizablePanel(options: UseResizablePanelOptions = {}): UseResizablePanelReturn {
    const { initialWidth = 50, minWidth = 20, maxWidth = 80 } = options;

    const [width, setWidth] = useState(initialWidth);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;

            // Cancel any pending animation frame
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            // Throttle updates using requestAnimationFrame for smooth 60fps
            animationFrameRef.current = requestAnimationFrame(() => {
                if (!containerRef.current) return;

                const rect = containerRef.current.getBoundingClientRect();
                const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
                const constrained = Math.min(maxWidth, Math.max(minWidth, newWidth));
                setWidth(constrained);
            });
        },
        [isResizing, minWidth, maxWidth],
    );

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    // Add/remove global event listeners based on resize state
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    // Cleanup animation frame on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return {
        width,
        isResizing,
        handleMouseDown,
        containerRef,
    };
}
