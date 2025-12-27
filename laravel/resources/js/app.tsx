import '../css/app.css';

import { FeedbackWidget } from '@/components/FeedbackWidget';
import { Toaster } from '@/components/ui/sonner';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => {
        if (!title) return appName;
        // If title is exactly "Sirius", return it without appending appName
        if (title === 'Sirius') return title;
        return `${title} - ${appName}`;
    },
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster />
                <FeedbackWidget />
            </>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Handle CSRF token mismatch errors
// Based on: https://inertiajs.com/csrf-protection#handling-mismatches
router.on('error', (event) => {
    const errors = event.detail.errors;
    if (errors && typeof errors === 'object' && 'message' in errors && errors.message === 'CSRF token mismatch.') {
        toast.error('Your session has expired. Please refresh the page and try again.');
    }
});

// This will set light / dark mode on load...
initializeTheme();
