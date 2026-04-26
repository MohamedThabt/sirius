/**
 * Accepts e.g. https://www.linkedin.com/in/mohamed-thabet-swe or www.linkedin.com/in/user-name (https is added).
 * Empty string is valid (optional field).
 */
export function parseLinkedInProfileUrl(
    input: string,
):
    | { ok: true; normalized: string }
    | { ok: false; message: string } {
    const t = input.trim();
    if (t === '') {
        return { ok: true, normalized: '' };
    }

    const withProtocol = /^https?:\/\//i.test(t) ? t : `https://${t.replace(/^\/+/, '')}`;

    let url: URL;
    try {
        url = new URL(withProtocol);
    } catch {
        return {
            ok: false,
            message: 'Enter a valid LinkedIn profile link.',
        };
    }

    const host = url.hostname.toLowerCase();
    if (host !== 'linkedin.com' && host !== 'www.linkedin.com') {
        return {
            ok: false,
            message: 'Use a link on linkedin.com (e.g. www.linkedin.com/in/your-name).',
        };
    }

    const match = url.pathname.match(/^\/in\/([^/]+)\/?$/i);
    if (!match || !match[1]) {
        return {
            ok: false,
            message: 'Use your profile URL: linkedin.com/in/your-username',
        };
    }

    const slug = decodeURIComponent(match[1]);
    if (!slug.length) {
        return { ok: false, message: 'Profile path is missing after /in/.' };
    }

    const normalized = `https://www.linkedin.com/in/${encodeURIComponent(slug)}/`;

    return { ok: true, normalized };
}
