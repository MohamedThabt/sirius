/**
 * Entry point for the static portfolio demo (see vite.demo.config.ts).
 *
 * Same Inertia app as app.tsx, but the initial page and every visit are served
 * by ./mock-server instead of Laravel, and analytics are left out.
 */
import './demo.css';

import { Toaster } from '@/components/ui/sonner';
import { initializeTheme } from '@/hooks/use-appearance';
import { createInertiaApp, router } from '@inertiajs/react';
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

// Marketing pages keep the original theme and are always dark; the app uses the v0.2
// design system and follows the visitor's light/dark preference.
const MARKETING_PAGES = new Set(['landing', 'architecture', 'pricing', 'team', 'Error']);
let onMarketingPage = false;

const prefersDarkApp = () => {
    let appearance = 'system';
    try {
        appearance = localStorage.getItem('appearance') || 'system';
    } catch {
        // storage unavailable: fall back to the system setting
    }
    return appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
};

const setDark = (dark: boolean) => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.classList.toggle('light', !dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
};

const applyPageTheme = (component: string) => {
    onMarketingPage = MARKETING_PAGES.has(component);
    document.documentElement.classList.toggle('theme-classic', onMarketingPage);
    setDark(onMarketingPage || prefersDarkApp());
};

// The appearance hook can re-apply light mode at any time (toggle, OS change); keep marketing pages dark.
new MutationObserver(() => {
    if (onMarketingPage && !document.documentElement.classList.contains('dark')) setDark(true);
}).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
router.on('navigate', (event) => applyPageTheme(event.detail.page.component));

const initialPage = resolveVisit(window.location.href);
applyPageTheme(initialPage.component);
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
