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
export function FeedbackWidget({ initialComponent }: { initialComponent?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
    const [pageComponent, setPageComponent] = useState(initialComponent || '');

    const handleOpen = useCallback(() => {
        setIsOpen(true);
    }, []);

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
    }, []);

    // Update pathname and component on navigation
    useEffect(() => {
        const updateState = (component?: string) => {
            setCurrentPath(window.location.pathname);
            if (component) setPageComponent(component);
        };

        // Listen for browser back/forward navigation
        const handlePopState = () => updateState();
        window.addEventListener('popstate', handlePopState);

        // Listen for Inertia navigation events
        let cleanupNavigate: (() => void) | undefined;
        try {
            cleanupNavigate = router.on('navigate', (event) => {
                updateState(event.detail.page.component);
            });
        } catch {
            // Router event API might not be available
        }

        // Fallback: check periodically for path changes
        const interval = setInterval(() => setCurrentPath(window.location.pathname), 500);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (cleanupNavigate) cleanupNavigate();
            clearInterval(interval);
        };
    }, []);

    // Pages where the feedback widget should be hidden
    // Based on URL paths since we're outside Inertia component tree
    const shouldHide =
        pageComponent === 'Error' || // Explicitly hide on Error page
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
