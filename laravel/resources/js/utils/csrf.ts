/**
 * Retrieves the CSRF token from meta tags or cookies.
 * Handles URL-encoded XSRF-TOKEN cookie values via decodeURIComponent.
 */
export function getCsrfToken(): string {
    // Priority 1: Standard Laravel meta tag
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (metaToken) return metaToken;

    // Priority 2: Alternate meta tag name
    const altMetaToken = document.querySelector('meta[name="_token"]')?.getAttribute('content');
    if (altMetaToken) return altMetaToken;

    // Priority 3: XSRF-TOKEN cookie (URL-encoded by Laravel, must decode)
    const cookie = document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN='));
    if (cookie) {
        try {
            return decodeURIComponent(cookie.split('=')[1]);
        } catch {
            return cookie.split('=')[1];
        }
    }

    return '';
}

/**
 * Standard headers for JSON fetch requests to Laravel backend.
 */
export function getJsonHeaders(): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest',
    };
}
