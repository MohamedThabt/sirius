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
        $timestamp = $record->datetime->format('Y-m-d H:i:s');

        // Escape markdown special characters
        $escapedMessage = $this->escapeMarkdown($this->truncate($record->message, 1000));

        $message = <<<MSG
{$levelEmoji} *{$record->level->name}* | {$appName}

*Environment:* {$environment}
*Time:* {$timestamp}

*Message:*
```
{$escapedMessage}
```
MSG;

        // Add context if available
        if (!empty($record->context)) {
            $contextStr = $this->formatContext($record->context);
            if (!empty($contextStr)) {
                $message .= "\n\n*Context:*\n```\n{$contextStr}\n```";
            }
        }

        // Add exception details if present
        if (isset($record->context['exception'])) {
            $exception = $record->context['exception'];
            if ($exception instanceof \Throwable) {
                $exceptionInfo = $this->formatException($exception);
                $message .= "\n\n*Exception:*\n```\n{$exceptionInfo}\n```";
            }
        }

        return $message;
    }

    /**
     * Format context array for display.
     */
    private function formatContext(array $context): string
    {
        // Remove exception from context as it's handled separately
        unset($context['exception']);

        if (empty($context)) {
            return '';
        }

        try {
            $json = json_encode($context, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            return $this->truncate($json, 500);
        } catch (\Throwable $e) {
            return 'Context could not be serialized';
        }
    }

    /**
     * Format exception for display.
     */
    private function formatException(\Throwable $exception): string
    {
        $info = sprintf(
            "%s: %s\nFile: %s:%d",
            get_class($exception),
            $this->truncate($exception->getMessage(), 300),
            $exception->getFile(),
            $exception->getLine()
        );

        // Add a short stack trace
        $trace = $exception->getTraceAsString();
        $traceLines = explode("\n", $trace);
        $shortTrace = implode("\n", array_slice($traceLines, 0, 5));

        return $info . "\n\nStack trace:\n" . $this->truncate($shortTrace, 400);
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
