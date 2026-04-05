<?php

namespace App\Logging;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Monolog\Handler\AbstractProcessingHandler;
use Monolog\Level;
use Monolog\LogRecord;

/**
 * Custom Monolog handler that sends log messages to Telegram.
 * Used for critical error notifications in production.
 */
class TelegramLogHandler extends AbstractProcessingHandler
{
    private string $botToken;
    private string $chatId;
    private ?int $topicId;
    private bool $enabled;

    public function __construct(
        string $botToken,
        string $chatId,
        ?int $topicId = null,
        int|string|Level $level = Level::Error,
        bool $bubble = true
    ) {
        parent::__construct($level, $bubble);

        $this->botToken = $botToken;
        $this->chatId = $chatId;
        $this->topicId = $topicId;
        $this->enabled = !empty($botToken) && !empty($chatId);
    }

    /**
     * Process and write the log record to Telegram.
     */
    protected function write(LogRecord $record): void
    {
        if (!$this->enabled) {
            return;
        }

        $message = $this->formatMessage($record);
        $this->sendToTelegram($message);
    }

    /**
     * Format the log record into a Telegram-friendly message.
     * Extracts structured context from AppLogger/StructuredLogger format.
     */
    private function formatMessage(LogRecord $record): string
    {
        $levelEmoji = match (strtolower($record->level->name)) {
            'emergency' => '🆘',
            'alert' => '🚨',
            'critical' => '💥',
            'error' => '❌',
            'warning' => '⚠️',
            'notice' => '📢',
            'info' => 'ℹ️',
            'debug' => '🐛',
            default => '📝',
        };

        $appName = config('app.name', 'Laravel');
        $environment = config('app.env', 'production');
        
        // Extract Context and System Data
        $context = $record->context;
        $exception = $context['exception'] ?? null;
        $sys = $context['sys'] ?? [];
        
        // Extract exception details from structured logging (AppLogger puts them at top level)
        $exceptionType = $context['exception_type'] ?? ($exception ? get_class($exception) : null);
        $exceptionMessage = $context['exception_message'] ?? ($exception instanceof \Throwable ? $exception->getMessage() : null);
        $exceptionFile = $context['exception_file'] ?? ($exception instanceof \Throwable ? $exception->getFile() : null);
        $exceptionLine = $context['exception_line'] ?? ($exception instanceof \Throwable ? $exception->getLine() : null);
        
        // Extract user info (prefer sys, fallback to top-level)
        $userName = $sys['user_name'] ?? $context['user_name'] ?? null;
        $userEmail = $sys['user_email'] ?? $context['user_email'] ?? null;
        $userId = $sys['user_id'] ?? $context['user_id'] ?? null;
        
        // Extract route info (prefer sys, fallback to top-level)
        $route = $sys['route'] ?? $context['route_name'] ?? $context['route'] ?? $context['url'] ?? null;
        $method = $sys['method'] ?? $context['method'] ?? 'GET';
        $action = $sys['action'] ?? $context['route_action'] ?? null;
        
        // Extract request_id
        $requestId = $sys['request_id'] ?? $context['request_id'] ?? null;
        
        // Build clean, structured message
        $message = "{$levelEmoji} *{$record->level->name}* | {$appName} ({$environment})\n";
        
        // 1. Main message/exception
        $mainMessage = $exceptionMessage ?: $record->message;
        $message .= "\n🗣️ *" . $this->escapeMarkdown($this->truncate($mainMessage, 200)) . "*";
        
        // 2. User info (if available)
        if ($userName || $userEmail) {
            $userParts = array_filter([
                $userName,
                $userEmail,
                $userId ? "ID:{$userId}" : null
            ]);
            $message .= "\n👤 " . $this->escapeMarkdown(implode(' | ', $userParts));
        }
        
        // 3. Route + method
        if ($route) {
            $routeDisplay = $route;
            if ($action && $action !== $route) {
                $routeDisplay = "{$route} ({$action})";
            }
            $message .= "\n🛣️ `{$method} " . $this->escapeMarkdown($routeDisplay) . "`";
        }
        
        // 4. Exception details (class + location)
        if ($exceptionType) {
            $message .= "\n\n*Exception:* `" . $this->escapeMarkdown($exceptionType) . "`";
            if ($exceptionFile && $exceptionLine) {
                $message .= "\n📍 " . $this->escapeMarkdown(basename($exceptionFile) . ':' . $exceptionLine);
            }
        }
        
        // 5. Request ID (for tracing)
        if ($requestId) {
            $message .= "\n🔖 Request ID: `" . $this->escapeMarkdown($requestId) . "`";
        }
        
        // 6. Compact context (only show a few safe keys, avoid dumping entire request_body)
        $contextWhitelist = ['event', 'action', 'data', 'status', 'error', 'ip'];
        $compactContext = [];
        foreach ($contextWhitelist as $key) {
            if (isset($context[$key]) && !in_array($key, ['sys', 'exception', 'exception_type', 'exception_message', 'exception_file', 'exception_line', 'exception_trace'])) {
                $value = $context[$key];
                if (is_array($value) || is_object($value)) {
                    $value = json_encode($value);
                }
                $compactContext[$key] = $this->truncate((string)$value, 100);
            }
        }
        
        if (!empty($compactContext)) {
            $message .= "\n\n*Context:*";
            foreach ($compactContext as $key => $value) {
                $message .= "\n• *{$this->escapeMarkdown($key)}*: " . $this->escapeMarkdown($value);
            }
        }
        
        return $message;
    }

    /**
     * Format context array for display.
     * Deprecated: logic moved to formatMessage for better control
     */
    private function formatContext(array $context): string
    {
        return '';
    }

    /**
     * Format exception for display.
     * Deprecated: logic moved to formatMessage
     */
    private function formatException(\Throwable $exception): string
    {
        return '';
    }

    /**
     * Send the message to Telegram.
     */
    private function sendToTelegram(string $message): void
    {
        try {
            $url = "https://api.telegram.org/bot{$this->botToken}/sendMessage";

            $payload = [
                'chat_id' => $this->chatId,
                'text' => $message,
                'parse_mode' => 'Markdown',
                'disable_web_page_preview' => true,
            ];

            if ($this->topicId !== null) {
                $payload['message_thread_id'] = $this->topicId;
            }

            Http::timeout(5)->post($url, $payload);
        } catch (\Throwable $e) {
            // Silently fail to prevent logging loops
        }
    }

    /**
     * Escape Markdown special characters.
     */
    private function escapeMarkdown(string $text): string
    {
        // Only escape characters that would break Markdown parsing
        $specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];

        foreach ($specialChars as $char) {
            $text = str_replace($char, '\\' . $char, $text);
        }

        return $text;
    }

    /**
     * Truncate text to a maximum length.
     */
    private function truncate(string $text, int $maxLength): string
    {
        if (strlen($text) <= $maxLength) {
            return $text;
        }

        return substr($text, 0, $maxLength) . '...';
    }
}
