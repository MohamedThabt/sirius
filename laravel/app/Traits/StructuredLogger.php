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
            $user = auth()->user();
            
            $requestBody = $request
                ? AppLogger::sanitize($request->except(['password', 'password_confirmation', 'current_password', 'token']))
                : [];

            $data = array_merge([
                'sys' => [
                    'request_body' => $requestBody,
                    'request_id' => $request?->attributes->get('request_id'),
                    'url' => $request?->fullUrl(),
                    'method' => $request?->method(),
                    'ip' => $request?->ip(),
                    'user_agent' => $request?->userAgent(),
                    'user_id' => $user?->id,
                    'user_name' => $user?->name,
                    'user_email' => $user?->email,
                    'route' => $request?->route()?->getName() ?? $request?->path(),
                    'action' => $request?->route()?->getActionName(),
                ]
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
            $user = auth()->user();

            $structuredData = [
                'sys' => [
                    'url' => $request?->fullUrl(),
                    'method' => $request?->method(),
                    'ip' => $request?->ip(),
                    'user_id' => $user?->id,
                    'user_name' => $user?->name,
                    'user_email' => $user?->email,
                    'user_agent' => $request?->userAgent(),
                    'request_id' => $request?->attributes->get('request_id'),
                    'route' => $request?->route()?->getName() ?? $request?->path(),
                    'action' => $request?->route()?->getActionName(),
                ]
            ];
            $structuredData = array_merge($structuredData, AppLogger::sanitize($context));
            // Filter out empty system data to keep it clean
            $structuredData['sys'] = array_filter($structuredData['sys'], fn ($v) => $v !== null && $v !== '');

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
            $user = auth()->user();

            $structuredData = [
                'sys' => [
                    'url' => $request?->fullUrl(),
                    'method' => $request?->method(),
                    'ip' => $request?->ip(),
                    'user_id' => $user?->id,
                    'user_name' => $user?->name,
                    'user_email' => $user?->email,
                    'user_agent' => $request?->userAgent(),
                    'request_id' => $request?->attributes->get('request_id'),
                    'route' => $request?->route()?->getName() ?? $request?->path(),
                    'action' => $request?->route()?->getActionName(),
                ]
            ];
            $structuredData = array_merge($structuredData, AppLogger::sanitize($context));
            $structuredData['sys'] = array_filter($structuredData['sys'], fn ($v) => $v !== null && $v !== '');

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
            $user = auth()->user();

            $structuredData = [
                'sys' => [
                    'url' => $request?->fullUrl(),
                    'method' => $request?->method(),
                    'ip' => $request?->ip(),
                    'user_id' => $user?->id,
                    'user_name' => $user?->name,
                    'user_email' => $user?->email,
                    'request_id' => $request?->attributes->get('request_id'),
                    'route' => $request?->route()?->getName() ?? $request?->path(),
                    'action' => $request?->route()?->getActionName(),
                ]
            ];
            $structuredData = array_merge($structuredData, AppLogger::sanitize($context));
            $structuredData['sys'] = array_filter($structuredData['sys'], fn ($v) => $v !== null && $v !== '');

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
