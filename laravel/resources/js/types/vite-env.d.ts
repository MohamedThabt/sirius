/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_TURNSTILE_SITE_KEY: string;
    readonly VITE_TURNSTILE_SITEKEY: string;
    readonly VITE_GA_MEASUREMENT_ID: string;
    readonly VITE_PUBLIC_POSTHOG_PROJECT_TOKEN: string;
    readonly VITE_PUBLIC_POSTHOG_HOST: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
}
