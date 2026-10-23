/**
 * Minimal replacements for the Wayfinder-generated route helpers
 * (resources/js/routes, resources/js/actions), which are gitignored and need PHP
 * to generate. Only the helpers reachable from demo pages are stubbed.
 */
type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

function definition(method: Method, url: string) {
    const fn = () => ({ url, method });
    fn.url = () => url;
    fn.form = () => ({ action: url, method: method === 'get' ? 'get' : 'post' });
    fn.definition = { methods: [method], url };
    return fn;
}

export const profileEdit = definition('get', '/settings/profile');
export const profileUpdate = definition('patch', '/settings/profile');
export const profileDestroy = definition('delete', '/settings/profile');
