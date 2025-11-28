<?php

namespace App\Traits;

use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * StructuredLogger Trait
 *
 * Provides structured exception logging with comprehensive context capture.
 * Includes failsafe mechanisms to prevent logging failures from breaking application flow.
 */
trait StructuredLogger
{
    /**
     * Log an exception with structured context data.
     *
     * Captures comprehensive information about the exception including:
     * - Exception details (type, message, file, line, trace)
     * - Request context (URL, method, IP, user agent, body)
     * - User information (authenticated user ID if available)
     * - Custom context passed by the caller
     *
     * @param Throwable $e The exception to log
     * @param array<string, mixed> $context Additional context to include in the log
     * @return void
     */
    protected function logException(Throwable $e, array $context = []): void
    {
        try {
            $structuredData = [
                'exception_type' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'url' => request()->fullUrl(),
                'method' => request()->method(),
                'ip' => request()->ip(),
                'request_body' => request()->all(),
                'user_id' => auth()->check() ? auth()->id() : null,
                'user_agent' => request()->userAgent(),
            ];

            // Merge custom context with structured data
            $structuredData = array_merge($structuredData, $context);

            Log::error('Exception occurred', $structuredData);
        } catch (Throwable $loggingException) {
            // Failsafe: If logging itself fails, log an emergency entry
            Log::emergency('Logging failure', [
                'original_exception_message' => $e->getMessage(),
                'logging_exception_message' => $loggingException->getMessage(),
            ]);
        }
    }
}
