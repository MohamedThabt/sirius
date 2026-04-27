import '../css/app.css';

import { CreditLimitModal } from '@/components/CreditLimitModal';
import { Toaster } from '@/components/ui/sonner';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import posthog from 'posthog-js';
import { PostHogProvider } from '@posthog/react';
import { createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const gaMeasurementId = 'G-333ZHPTC8B';

// Global state for credit limit modal
let showCreditLimitModal: ((message: string, balance?: number) => void) | null = null;

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

        const posthogOptions = {
            api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
            defaults: '2026-01-30',
        } as const;

        if (typeof window !== 'undefined' && import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN) {
            posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN, posthogOptions);
        }

        function AppWithModals() {
            const [creditModalOpen, setCreditModalOpen] = useState(false);
            const [creditModalMessage, setCreditModalMessage] = useState('');
            const [creditBalance, setCreditBalance] = useState<number | undefined>(undefined);

            // Expose function to show modal
            showCreditLimitModal = (message: string, balance?: number) => {
                setCreditModalMessage(message);
                setCreditBalance(balance);
                setCreditModalOpen(true);
            };

            return (
                <PostHogProvider client={posthog}>
                    <App {...props} />
                    <Toaster />
                    <CreditLimitModal
                        open={creditModalOpen}
                        onOpenChange={setCreditModalOpen}
                        message={creditModalMessage}
                        creditsBalance={creditBalance}
                    />
                </PostHogProvider>
            );
        }

        root.render(createElement(AppWithModals));
    },
    progress: {
        color: '#4B5563',
    },
});

// Configure client-side analytics tracking for SPAs / Inertia
router.on('navigate', (event) => {
    const page = event.detail.page;

    // GA page view mapping
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', gaMeasurementId, {
            page_path: window.location.pathname,
            page_title: document.title,
        });
    }

    // PostHog SPA tracking and Identity binding
    if (typeof window !== 'undefined' && import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN) {
        posthog.capture('$pageview');

        // Capture Identify if the user is authenticated in the new page props
        const auth = (page.props as any).auth;
        if (auth && auth.user) {
            posthog.identify(String(auth.user.id), {
                email: auth.user.email,
                name: auth.user.name,
            });
        } else {
            // When navigating to an unauthenticated page/logout, reset tracking to avoid leakage
            posthog.reset();
        }
    }
});

// Handle CSRF token mismatch errors
// Based on: https://inertiajs.com/csrf-protection#handling-mismatches
router.on('error', (event) => {
    const errors = event.detail.errors;
    if (errors && typeof errors === 'object' && 'message' in errors && errors.message === 'CSRF token mismatch.') {
        toast.error('Your session has expired. Please refresh the page and try again.');
    }
});

// Handle HTTP errors (including 402 Credit Limit)
router.on('exception', (event) => {
    const response = event.detail.response;

    if (response?.status === 402) {
        event.preventDefault(); // Prevent default error handling

        // Try to parse response
        response
            .json()
            .then((data: any) => {
                const message = data.message || 'Credit limit reached. Please upgrade your plan or purchase additional credits.';
                const balance = data.credits_balance;

                if (showCreditLimitModal) {
                    showCreditLimitModal(message, balance);
                } else {
                    toast.error(message);
                }
            })
            .catch(() => {
                if (showCreditLimitModal) {
                    showCreditLimitModal('Credit limit reached. Please upgrade your plan or purchase additional credits.');
                } else {
                    toast.error('Credit limit reached. Please upgrade your plan or purchase additional credits.');
                }
            });
    }
});

// This will set light / dark mode on load...
initializeTheme();
