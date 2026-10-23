/**
 * Entry point for the static portfolio demo (see vite.demo.config.ts).
 *
 * Same Inertia app as app.tsx, but the initial page and every visit are served
 * by ./mock-server instead of Laravel, and analytics are left out.
 */
import './demo.css';

import { Toaster } from '@/components/ui/sonner';
import { initializeTheme } from '@/hooks/use-appearance';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import DemoTour from './DemoTour';
import LandingNotice from './LandingNotice';
import { DEMO_READ_ONLY_MESSAGE, resolveVisit } from './mock-server';

const appName = 'Sirius';

// Direct fetch() calls (AI generation, GitHub integration, autosave) have no backend:
// answer them with a JSON error the pages already know how to display.
const nativeFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : String(input), window.location.href);
    const isAppEndpoint = url.origin === window.location.origin && !/\.[a-z0-9]+$/i.test(url.pathname);
    if (isAppEndpoint) {
        const body = JSON.stringify({ success: false, message: DEMO_READ_ONLY_MESSAGE, error: DEMO_READ_ONLY_MESSAGE });
        return Promise.resolve(new Response(body, { status: 403, headers: { 'Content-Type': 'application/json' } }));
    }
    return nativeFetch(input, init);
};

// A few pages call Ziggy's global route() helper.
const namedRoutes: Record<string, string> = {
    'usage.index': '/settings/usage',
    'usage.purchase': '/settings/usage/purchase-credits',
};
(window as unknown as { route: (name: string) => string }).route = (name) => namedRoutes[name] ?? '/';

const initialPage = resolveVisit(window.location.href);
if (initialPage.url !== window.location.pathname + window.location.search) {
    window.history.replaceState(null, '', initialPage.url + window.location.hash);
}

createInertiaApp({
    page: initialPage,
    title: (title) => {
        if (!title || title === appName) return appName;
        return `${title} - ${appName}`;
    },
    resolve: (name) =>
        resolvePageComponent(
            `../pages/${name}.tsx`,
            import.meta.glob(['../pages/**/*.tsx', '!../pages/auth/**', '!../pages/admin/**', '!../pages/dashboard/**']),
        ),
    setup({ el, App, props }) {
        createRoot(el).render(
            <>
                <App {...props} />
                <Toaster />
                <LandingNotice />
                <DemoTour />
            </>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();
