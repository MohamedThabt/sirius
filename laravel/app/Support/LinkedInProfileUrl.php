<?php

namespace App\Support;

use Illuminate\Validation\ValidationException;

final class LinkedInProfileUrl
{
    /**
     * @return string Normalized https://www.linkedin.com/in/{slug}/
     *
     * @throws ValidationException
     */
    public static function assertAndNormalizeNonEmpty(string $value): string
    {
        $t = trim($value);
        if ($t === '') {
            self::throwInvalid();
        }

        if (! str_starts_with(strtolower($t), 'http://') && ! str_starts_with(strtolower($t), 'https://')) {
            $t = 'https://' . ltrim($t, '/');
        }

        $parts = parse_url($t);
        if ($parts === false || ! isset($parts['host'], $parts['path'])) {
            self::throwInvalid();
        }

        $host = strtolower($parts['host']);
        if ($host !== 'linkedin.com' && $host !== 'www.linkedin.com') {
            self::throwInvalid();
        }

        if (! preg_match('~^/in/([^/]+)/?$~i', $parts['path'], $m) || $m[1] === '') {
            self::throwInvalid();
        }

        $slug = rawurldecode($m[1]);

        return 'https://www.linkedin.com/in/' . rawurlencode($slug) . '/';
    }

    public static function throwInvalid(): never
    {
        throw ValidationException::withMessages([
            'linkedin' => 'Use a valid LinkedIn profile link, e.g. https://www.linkedin.com/in/your-username or www.linkedin.com/in/your-name',
        ]);
    }
}
