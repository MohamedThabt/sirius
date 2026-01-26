import '../css/app.css';

import { FeedbackWidget } from '@/components/FeedbackWidget';
import { CreditLimitModal } from '@/components/CreditLimitModal';
import { Toaster } from '@/components/ui/sonner';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';
import { initializeTheme } from './hooks/use-appearance';
import { createElement, useState } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

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
                <>
                    <App {...props} />
                    <Toaster />
                    <FeedbackWidget initialComponent={props.initialPage.component} />
                    <CreditLimitModal
                        open={creditModalOpen}
                        onOpenChange={setCreditModalOpen}
                        message={creditModalMessage}
                        creditsBalance={creditBalance}
                    />
                </>
            );
        }

        root.render(createElement(AppWithModals));
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

// Handle HTTP errors (including 402 Credit Limit)
router.on('exception', (event) => {
    const response = event.detail.response;
    
    if (response?.status === 402) {
        event.preventDefault(); // Prevent default error handling
        
        // Try to parse response
        response.json().then((data: any) => {
            const message = data.message || 'Credit limit reached. Please upgrade your plan or purchase additional credits.';
            const balance = data.credits_balance;
            
            if (showCreditLimitModal) {
                showCreditLimitModal(message, balance);
            } else {
                toast.error(message);
            }
        }).catch(() => {
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
