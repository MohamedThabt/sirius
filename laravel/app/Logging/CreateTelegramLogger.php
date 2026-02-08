<?php

namespace App\Logging;

use Monolog\Logger;

/**
 * Factory class to create the Telegram logger for Laravel's logging system.
 */
class CreateTelegramLogger
{
    /**
     * Create a custom Monolog instance for Telegram logging.
     *
     * @param array $config The logging channel configuration
     * @return Logger
     */
    public function __invoke(array $config): Logger
    {
        // Safely retrieve config values, ensuring they're strings
        $botToken = config('services.telegram.bot_token');
        $chatId = config('services.telegram.chat_id');
        
        // If Telegram is not configured, return a logger without handlers
        // This prevents the logger from throwing exceptions when config is missing
        if (empty($botToken) || empty($chatId)) {
            return new Logger('telegram', []);
        }

        $handler = new TelegramLogHandler(
            botToken: (string) $botToken,
            chatId: (string) $chatId,
            topicId: config('services.telegram.topic_id') 
                ? (int) config('services.telegram.topic_id') 
                : null,
            level: $config['level'] ?? 'error',
        );

        return new Logger('telegram', [$handler]);
    }
}
