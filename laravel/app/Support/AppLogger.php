<?php

namespace App\Support;

use Illuminate\Support\Facades\Log;
use Throwable;

class AppLogger
{
    private const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'current_password',
        'token',
        'api_token',
        'access_token',
        'refresh_token',
        'secret',
        'api_secret',
        'client_secret',
        'authorization',
        'bearer',
        'api_key',
        'card_number',
        'cvv',
        'cvc',
        'credit_card',
        'pin',
    ];

    public static function business(string $action, array $data = [], string $level = 'info'): void
    {
        try {
            $payload = array_merge(self::context(), [
                'event' => $action,
                'data' => self::sanitize($data),
                'timestamp' => now()->toIso8601String(),
            ]);
            Log::log($level, $action, $payload);
        } catch (Throwable $e) {
            self::failSafe('business', $action, $e);
        }
    }

    public static function security(string $action, array $data = [], string $level = 'warning'): void
    {
        try {
            $payload = array_merge(self::context(), [
                'event' => $action,
                'data' => self::sanitize($data),
                'timestamp' => now()->toIso8601String(),
            ]);
            Log::channel('security')->log($level, $action, $payload);
        } catch (Throwable $e) {
            self::failSafe('security', $action, $e);
        }
    }

    public static function api(string $service, string $endpoint, array $data = []): void
    {
        try {
            $payload = array_merge(self::context(), [
                'event' => 'api.call',
                'service' => $service,
                'endpoint' => $endpoint,
                'data' => self::sanitize($data),
                'timestamp' => now()->toIso8601String(),
            ]);
            Log::info("api.{$service}.{$endpoint}", $payload);
        } catch (Throwable $e) {
            self::failSafe('api', "{$service} {$endpoint}", $e);
        }
    }

    public static function apiFailure(string $service, string $endpoint, int $status, string $error, array $data = []): void
    {
        try {
            $payload = array_merge(self::context(), [
                'event' => 'api.failure',
                'service' => $service,
                'endpoint' => $endpoint,
                'status' => $status,
                'error' => \Illuminate\Support\Str::limit($error, 1000),
                'data' => self::sanitize($data),
                'timestamp' => now()->toIso8601String(),
            ]);
            Log::error("api.{$service}.{$endpoint}.failure", $payload);
        } catch (Throwable $e) {
            self::failSafe('apiFailure', "{$service} {$endpoint}", $e);
        }
    }

    public static function error(string $message, ?Throwable $e = null, array $data = []): void
    {
        try {
            $payload = array_merge(self::context(), [
                'event' => 'system.error',
                'message' => $message,
                'data' => self::sanitize($data),
                'timestamp' => now()->toIso8601String(),
            ]);
            if ($e !== null) {
                $payload['exception_type'] = get_class($e);
                $payload['exception_message'] = $e->getMessage();
                $payload['exception_file'] = $e->getFile();
                $payload['exception_line'] = $e->getLine();
                $payload['exception_trace'] = $e->getTraceAsString();
            }
            Log::error($message, $payload);
        } catch (Throwable $loggingException) {
            self::failSafe('error', $message, $loggingException);
        }
    }

    public static function sanitize(array $data): array
    {
        $out = [];
        foreach ($data as $key => $value) {
            $keyLower = is_string($key) ? strtolower($key) : '';
            if (self::isSensitiveKey($keyLower)) {
                $out[$key] = '[REDACTED]';
                continue;
            }
            if (is_array($value)) {
                $out[$key] = self::sanitize($value);
                continue;
            }
            if (is_string($value) && self::looksLikeToken($value)) {
                $out[$key] = self::maskToken($value);
                continue;
            }
            if (is_string($value) && self::looksLikeCardNumber($value)) {
                $out[$key] = self::maskCardNumber($value);
                continue;
            }
            $out[$key] = $value;
        }
        return $out;
    }

    private static function context(array $extra = []): array
    {
        $ctx = [
            'user_id' => auth()->guard('web')->id(),
            'admin_id' => auth()->guard('admin')->id(),
            'ip' => request()?->ip(),
            'url' => request()?->fullUrl(),
            'request_id' => request()?->attributes->get('request_id'),
            'user_agent' => request()?->userAgent(),
        ];
        $ctx = array_filter($ctx, fn ($v) => $v !== null && $v !== '');
        return $extra === [] ? $ctx : array_merge($ctx, self::sanitize($extra));
    }

    private static function isSensitiveKey(string $key): bool
    {
        foreach (self::SENSITIVE_KEYS as $s) {
            if (str_contains($key, $s)) {
                return true;
            }
        }
        return false;
    }

    private static function looksLikeToken(string $value): bool
    {
        return strlen($value) >= 20 && preg_match('/^[a-zA-Z0-9_\-]+$/', $value) === 1;
    }

    private static function looksLikeCardNumber(string $value): bool
    {
        $digits = preg_replace('/\D/', '', $value);
        return strlen($digits) >= 12 && strlen($digits) <= 19;
    }

    private static function maskToken(string $value): string
    {
        $len = strlen($value);
        if ($len <= 8) {
            return '****';
        }
        return substr($value, 0, 4) . '...' . substr($value, -4);
    }

    private static function maskCardNumber(string $value): string
    {
        $digits = preg_replace('/\D/', '', $value);
        if (strlen($digits) < 4) {
            return '****';
        }
        return '****' . substr($digits, -4);
    }

    private static function failSafe(string $type, string $subject, Throwable $e): void
    {
        try {
            Log::emergency('AppLogger failure', [
                'type' => $type,
                'subject' => $subject,
                'message' => $e->getMessage(),
            ]);
        } catch (Throwable) {
        }
    }
}
