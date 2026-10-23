import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/** Current pathname, kept in sync with Inertia navigations (works outside the Inertia App tree). */
export function useCurrentPath(): string {
    const [path, setPath] = useState(() => window.location.pathname);

    useEffect(() => {
        const update = () => setPath(window.location.pathname);
        const removeListener = router.on('navigate', update);
        window.addEventListener('popstate', update);
        return () => {
            removeListener();
            window.removeEventListener('popstate', update);
        };
    }, []);

    return path;
}
