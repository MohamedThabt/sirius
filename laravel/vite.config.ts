import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

const isDockerBuild = process.env.DOCKER_BUILD === 'true';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        // Skip wayfinder generation in Docker build since routes are pre-generated
        ...(isDockerBuild ? [] : [wayfinder({
            formVariants: true,
        })]),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    build: {
        // Suppress chunk size warnings - large libs like mermaid, excalidraw are expected for this app
        chunkSizeWarningLimit: 2000,
    },
});
