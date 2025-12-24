import { useEffect, useState } from 'react';

/**
 * useThemeDetection Hook
 *
 * WHY: Theme detection via MutationObserver was duplicated in 4+ files:
 * - DatabaseDesigner.tsx
 * - SystemArchitecture.tsx
 * - SystemOverview.tsx
 * - Brainstorming.tsx
 *
 * This hook centralizes the dark mode detection logic and properly cleans up
 * the observer on unmount to prevent memory leaks.
 */
export function useThemeDetection(): 'light' | 'dark' {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        // Initial detection - safe for SSR
        if (typeof document !== 'undefined') {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const detectTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'dark' : 'light');
        };

        // Initial detection
        detectTheme();

        // Watch for theme changes via class mutations on <html>
        const observer = new MutationObserver(detectTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    return theme;
}

/**
 * Shorthand hook that returns boolean for dark mode
 */
export function useIsDarkMode(): boolean {
    return useThemeDetection() === 'dark';
}
