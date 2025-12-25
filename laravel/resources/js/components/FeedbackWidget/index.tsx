import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { FeedbackModal } from './FeedbackModal';
import { FloatingButton } from './FloatingButton';

/**
 * Main Feedback Widget component.
 * Renders a floating astronaut button and feedback modal.
 *
 * This should be placed in the app layout to be accessible from all pages.
 */
export function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

    const handleOpen = useCallback(() => {
        setIsOpen(true);
    }, []);

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
    }, []);

    // Update pathname on navigation
    useEffect(() => {
        const updatePath = () => setCurrentPath(window.location.pathname);

        // Listen for browser back/forward navigation
        window.addEventListener('popstate', updatePath);

        // Listen for Inertia navigation events (if available)
        let cleanupStart: (() => void) | undefined;
        try {
            cleanupStart = router.on('start', updatePath);
        } catch {
            // Router event API might not be available or different
        }

        // Fallback: check periodically for path changes (handles edge cases)
        const interval = setInterval(updatePath, 500);

        return () => {
            window.removeEventListener('popstate', updatePath);
            if (cleanupStart) {
                cleanupStart();
            }
            clearInterval(interval);
        };
    }, []);

    // Pages where the feedback widget should be hidden
    // Based on URL paths since we're outside Inertia component tree
    const shouldHide =
        currentPath === '/' || // landing
        currentPath === '/team' || // team
        currentPath === '/beta' || // beta-signup
        currentPath.startsWith('/admin/') || // dashboard pages (admin routes)
        currentPath === '/login' ||
        currentPath === '/register' ||
        currentPath === '/forgot-password' ||
        currentPath.startsWith('/reset-password') ||
        currentPath.startsWith('/verify-email') ||
        currentPath === '/confirm-password';

    if (shouldHide) {
        return null;
    }

    return (
        <>
            <FloatingButton onClick={handleOpen} />
            <FeedbackModal open={isOpen} onOpenChange={handleOpenChange} />
        </>
    );
}

// Named exports for individual components
export { AstronautLottie } from './AstronautLottie';
export { FeedbackModal } from './FeedbackModal';
export { FloatingButton } from './FloatingButton';
export { StarConfetti } from './StarConfetti';
