import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => {
            if (!title) return appName;
            // If title is exactly "Sirius", return it without appending appName
            if (title === 'Sirius') return title;
            return `${title} - ${appName}`;
        },
        resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
        setup: ({ App, props }) => {
            return <App {...props} />;
        },
    }),
);
