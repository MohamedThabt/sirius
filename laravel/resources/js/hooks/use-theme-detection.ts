import { useEffect, useState } from 'react';

/**
 * Hook to detect the current theme based on the document's class or color scheme.
 * Returns 'dark' or 'light' based on the current theme.
 */
export function useThemeDetection(): 'dark' | 'light' {
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof document !== 'undefined') {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        }
        return 'dark';
    });

    useEffect(() => {
        const updateTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'dark' : 'light');
        };

        // Initial check
        updateTheme();

        // Watch for class changes on documentElement
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    updateTheme();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return theme;
}
