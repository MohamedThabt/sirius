import { useEffect } from 'react';

/**
 * useForceTheme Hook
 * 
 * Enforces a specific theme (usually 'dark') when a component mounts,
 * and optionally reverts to the previous state on unmount.
 * 
 * @param theme - The theme to enforce ('dark' | 'light')
 * @param revertOnUnmount - Whether to remove the class when component unmounts (default: true)
 */
export function useForceTheme(theme: 'dark' | 'light' = 'dark', revertOnUnmount = true) {
    useEffect(() => {
        const root = document.documentElement;
        
        // Apply theme
        root.classList.add(theme);
        
        return () => {
            if (revertOnUnmount) {
                // Only remove if we're unmounting so we don't flash safely
                // Note: In a real SPA, this might need more complex logic if 
                // correct theme management is global. For now, this matches existing behavior.
                root.classList.remove(theme);
            }
        };
    }, [theme, revertOnUnmount]);
}
