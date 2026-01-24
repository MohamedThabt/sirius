<?php

namespace App\Traits;

use App\Support\AppLogger;
use Illuminate\Support\Facades\Log;
use Throwable;

trait StructuredLogger
{
    protected function logException(Throwable $e, array $context = []): void
    {
        try {
            $request = request();
            $requestBody = $request
                ? AppLogger::sanitize($request->except(['password', 'password_confirmation', 'current_password', 'token']))
                : [];

            $data = array_merge([
                'request_body' => $requestBody,
                'request_id' => $request?->attributes->get('request_id'),
            ], AppLogger::sanitize($context));

            AppLogger::error('Exception occurred', $e, $data);
        } catch (Throwable $loggingException) {
            try {
                Log::emergency('Logging failure', [
                    'original_exception_message' => $e->getMessage(),
                    'logging_exception_message' => $loggingException->getMessage(),
                ]);
            } catch (Throwable) {
            }
        }
    }

    protected function logInfo(string $message, array $context = []): void
    {
        try {
            $request = request();
            $structuredData = [
                'url' => $request?->fullUrl(),
                'method' => $request?->method(),
                'ip' => $request?->ip(),
                'user_id' => auth()->guard('web')->id(),
                'admin_id' => auth()->guard('admin')->id(),
                'user_agent' => $request?->userAgent(),
                'request_id' => $request?->attributes->get('request_id'),
            ];
            $structuredData = array_merge($structuredData, AppLogger::sanitize($context));
            $structuredData = array_filter($structuredData, fn ($v) => $v !== null && $v !== '');

            Log::info($message, $structuredData);
        } catch (Throwable $loggingException) {
            try {
                Log::emergency('Logging failure', [
                    'original_message' => $message,
                    'logging_exception_message' => $loggingException->getMessage(),
                ]);
            } catch (Throwable) {
            }
        }
    }

    protected function logWarning(string $message, array $context = []): void
    {
        try {
            $request = request();
            $structuredData = [
                'url' => $request?->fullUrl(),
                'method' => $request?->method(),
                'ip' => $request?->ip(),
                'user_id' => auth()->guard('web')->id(),
                'admin_id' => auth()->guard('admin')->id(),
                'user_agent' => $request?->userAgent(),
                'request_id' => $request?->attributes->get('request_id'),
            ];
            $structuredData = array_merge($structuredData, AppLogger::sanitize($context));
            $structuredData = array_filter($structuredData, fn ($v) => $v !== null && $v !== '');

            Log::warning($message, $structuredData);
        } catch (Throwable $loggingException) {
            try {
                Log::emergency('Logging failure', [
                    'original_message' => $message,
                    'logging_exception_message' => $loggingException->getMessage(),
                ]);
            } catch (Throwable) {
            }
        }
    }

    protected function logDebug(string $message, array $context = []): void
    {
        try {
            $request = request();
            $structuredData = [
                'url' => $request?->fullUrl(),
                'method' => $request?->method(),
                'ip' => $request?->ip(),
                'user_id' => auth()->guard('web')->id(),
                'request_id' => $request?->attributes->get('request_id'),
            ];
            $structuredData = array_merge($structuredData, AppLogger::sanitize($context));
            $structuredData = array_filter($structuredData, fn ($v) => $v !== null && $v !== '');

            Log::debug($message, $structuredData);
        } catch (Throwable $loggingException) {
            try {
                Log::emergency('Logging failure', [
                    'original_message' => $message,
                    'logging_exception_message' => $loggingException->getMessage(),
                ]);
            } catch (Throwable) {
            }
        }
    }
}
