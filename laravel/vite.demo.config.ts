/**
 * Static portfolio build of the frontend for GitHub Pages (sirius.sirthabet.dev).
 *
 * Runs the same Inertia pages without Laravel: `axios` (Inertia's transport) is
 * swapped for an in-browser mock server, and the gitignored Wayfinder route files
 * are replaced by small stubs so the build works without PHP.
 *
 *   pnpm build:demo    -> dist-demo/
 *   pnpm dev:demo      -> local preview with hot reload
 */
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, cpSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));
const js = resolve(root, 'resources/js');
const demo = resolve(js, 'demo');
const outDir = resolve(root, 'dist-demo');
const customDomain = 'sirius.sirthabet.dev';

/** Copies public assets and adds the files GitHub Pages needs for an SPA on a custom domain. */
function githubPages(): Plugin {
    return {
        name: 'sirius-github-pages',
        apply: 'build',
        closeBundle() {
            const publicDir = resolve(root, 'public');
            for (const file of ['favicon.ico', 'favicon.png', 'favicon.svg', 'apple-touch-icon.png', 'logo.svg']) {
                if (existsSync(resolve(publicDir, file))) copyFileSync(resolve(publicDir, file), resolve(outDir, file));
            }
            // Team pages use the small .webp avatars; skip the multi-MB source photos.
            cpSync(resolve(publicDir, 'images'), resolve(outDir, 'images'), {
                recursive: true,
                filter: (source) => !/[\\/]team[\\/][^\\/]+\.png$/i.test(source),
            });

            // Deep links (e.g. /projects/1/prd) are served 404.html, which boots the same SPA.
            copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'));
            writeFileSync(resolve(outDir, 'CNAME'), `${customDomain}\n`);
            writeFileSync(resolve(outDir, '.nojekyll'), '');
        },
    };
}

export default defineConfig(({ command }) => ({
    root: demo,
    base: '/',
    // Dev serves laravel/public directly; the build copies only what the demo needs (see githubPages()).
    publicDir: command === 'serve' ? resolve(root, 'public') : false,
    plugins: [react(), tailwindcss(), githubPages()],
    resolve: {
        alias: [
            { find: /^axios$/, replacement: resolve(demo, 'axios-shim.ts') },
            { find: /^@\/routes\/profile$/, replacement: resolve(demo, 'stubs/profile-routes.ts') },
            { find: /^@\/actions\/App\/Http\/Controllers\/Settings\/ProfileController$/, replacement: resolve(demo, 'stubs/profile-routes.ts') },
            { find: '@', replacement: js },
        ],
    },
    esbuild: {
        jsx: 'automatic',
    },
    server: {
        fs: { allow: [root] },
    },
    build: {
        outDir,
        emptyOutDir: true,
        chunkSizeWarningLimit: 4000,
    },
}));
