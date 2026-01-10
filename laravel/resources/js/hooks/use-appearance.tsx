import { useCallback, useEffect } from 'react';

export type Appearance = 'dark';

// Always apply dark mode
const applyTheme = () => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.style.colorScheme = 'dark';
};

export function initializeTheme() {
    applyTheme();
}

export function useAppearance() {
    useEffect(() => {
        applyTheme();
    }, []);

    const updateAppearance = useCallback((_mode: Appearance) => {
        // No-op
    }, []);

    return { 
        appearance: 'dark' as Appearance, 
        updateAppearance 
    } as const;
}

