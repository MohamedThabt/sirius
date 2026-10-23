/**
 * Stand-in for `axios` in the static demo build.
 *
 * WHY: Inertia's router sends every visit through `axios({...})`. The demo build
 * aliases `axios` to this module so visits are answered by the in-browser mock
 * server instead of Laravel, which lets every page, Link and router.visit work
 * unchanged on a static host (GitHub Pages).
 */
import { toast } from 'sonner';
import { DEMO_READ_ONLY_MESSAGE, resolveVisit } from './mock-server';

interface RequestConfig {
    method?: string;
    url: string;
    params?: Record<string, unknown>;
    signal?: AbortSignal;
}

class CanceledError extends Error {
    readonly __CANCEL__ = true;
}

function withParams(url: string, params?: Record<string, unknown>): string {
    const target = new URL(url, window.location.href);
    Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            target.searchParams.set(key, String(value));
        }
    });
    return target.href;
}

async function axios(config: RequestConfig) {
    if (config.signal?.aborted) {
        throw new CanceledError('canceled');
    }

    const method = (config.method ?? 'get').toLowerCase();
    let url = withParams(config.url, config.params);

    // Writes are not persisted: tell the visitor and re-render the page they are on.
    if (method !== 'get') {
        if (new URL(url).pathname === '/logout') {
            url = new URL('/', window.location.href).href;
        } else {
            toast.info(DEMO_READ_ONLY_MESSAGE);
            url = window.location.href;
        }
    }

    // Small delay so Inertia's progress bar and loading states behave like a real request.
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (config.signal?.aborted) {
        throw new CanceledError('canceled');
    }

    return {
        status: 200,
        statusText: 'OK',
        headers: { 'x-inertia': 'true' },
        data: JSON.stringify(resolveVisit(url)),
        config,
    };
}

axios.isCancel = (error: unknown): boolean => Boolean(error && (error as CanceledError).__CANCEL__);

export const isCancel = axios.isCancel;
export default axios;
