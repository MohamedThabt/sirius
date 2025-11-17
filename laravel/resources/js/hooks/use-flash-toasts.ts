import type { FlashMessages } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook to handle flash messages from the backend
 * Displays toast notifications using Sonner for success, error, warning, and info messages
 * Based on: https://inertiajs.com/csrf-protection#handling-mismatches
 */
export const useFlashToasts = () => {
    const { props } = usePage();
    const flashMessages = (props.flash || {}) as FlashMessages;

    useEffect(() => {
        // Handle success messages
        if (flashMessages.success) {
            toast.success(flashMessages.success);
        }

        // Handle error messages
        if (flashMessages.error) {
            toast.error(flashMessages.error);
        }

        // Handle warning messages
        if (flashMessages.warning) {
            toast.warning(flashMessages.warning);
        }

        // Handle info messages
        if (flashMessages.info) {
            toast.info(flashMessages.info);
        }
    }, [flashMessages.success, flashMessages.error, flashMessages.warning, flashMessages.info]);
};
