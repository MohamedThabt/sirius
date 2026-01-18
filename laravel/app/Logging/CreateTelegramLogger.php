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
        $handler = new TelegramLogHandler(
            botToken: config('services.telegram.bot_token', ''),
            chatId: config('services.telegram.chat_id', ''),
            // replace it with topic_id of errors topic 
            topicId: config('services.telegram.topic_id') 
                ? (int) config('services.telegram.topic_id') 
                : null,
            level: $config['level'] ?? 'error',
        );

        return new Logger('telegram', [$handler]);
    }
}
