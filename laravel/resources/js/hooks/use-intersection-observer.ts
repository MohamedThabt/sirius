import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/**
 * Hook to detect when an element enters the viewport
 * Useful for lazy loading and animations
 */
export function useIntersectionObserver({ threshold = 0.1, rootMargin = '0px', triggerOnce = true }: UseIntersectionObserverOptions = {}) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // If already intersected and triggerOnce is true, don't observe again
        if (hasIntersected && triggerOnce) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const isVisible = entry.isIntersecting;
                setIsIntersecting(isVisible);

                if (isVisible && triggerOnce) {
                    setHasIntersected(true);
                }
            },
            { threshold, rootMargin },
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin, triggerOnce, hasIntersected]);

    return { ref, isIntersecting, hasIntersected };
}
