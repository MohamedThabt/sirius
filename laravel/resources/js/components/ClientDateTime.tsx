import { useEffect, useState } from 'react';

interface ClientDateTimeProps {
    value?: string | null;
    dateStyle?: 'full' | 'long' | 'medium' | 'short';
    timeStyle?: 'full' | 'long' | 'medium' | 'short';
    fallback?: React.ReactNode;
    suppressHydrationWarning?: boolean;
    className?: string;
}

/**
 * Renders a date/time using the user's browser locale and timezone.
 * 
 * SSR-safe: shows fallback during server render and before client hydration,
 * then formats with Intl.DateTimeFormat(undefined, ...) to respect user's country/timezone.
 * 
 * Usage:
 * - <ClientDateTime value={project.created_at} dateStyle="medium" />
 * - <ClientDateTime value={user.last_login} dateStyle="short" timeStyle="short" />
 */
export function ClientDateTime({
    value,
    dateStyle = 'medium',
    timeStyle,
    fallback = '—',
    suppressHydrationWarning = true,
    className,
}: ClientDateTimeProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!value) {
        return <span className={className}>{fallback}</span>;
    }

    if (!isClient) {
        return <span className={className}>{fallback}</span>;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return <span className={className}>{fallback}</span>;
    }

    const formatted = new Intl.DateTimeFormat(undefined, {
        dateStyle,
        timeStyle,
    }).format(date);

    return (
        <span className={className} suppressHydrationWarning={suppressHydrationWarning}>
            {formatted}
        </span>
    );
}

/**
 * Hook that returns true after component mounts (client-side only).
 * Useful for conditional rendering that differs between SSR and client.
 */
export function useIsClient(): boolean {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient;
}

/**
 * Format a date/time string using the user's browser locale and timezone.
 * 
 * Warning: Only call this on the client side (after mount) to avoid SSR/hydration mismatches.
 * Prefer using the ClientDateTime component for rendering in SSR'd pages.
 */
export function formatLocalDateTime(
    value?: string | null,
    options?: Intl.DateTimeFormatOptions,
): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat(undefined, options).format(date);
}
