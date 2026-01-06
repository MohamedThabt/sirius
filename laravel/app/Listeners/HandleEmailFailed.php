<?php

namespace App\Listeners;

use App\Services\Notification\TelegramNotificationService;
use Illuminate\Support\Facades\Log;
use Resend\Laravel\Events\EmailFailed;

class HandleEmailFailed
{
    /**
     * Create the event listener.
     */
    public function __construct(
        protected TelegramNotificationService $telegram
    ) {}

    /**
     * Handle the event.
     */
    public function handle(EmailFailed $event): void
    {
        $payload = $event->payload;

        $email = $payload['data']['to'][0] ?? 'unknown';
        $error = $payload['data']['error']['message'] ?? 'Unknown error';

        Log::channel('email')->error('Email failed to send', [
            'email_id' => $payload['data']['email_id'] ?? null,
            'to' => $payload['data']['to'] ?? [],
            'subject' => $payload['data']['subject'] ?? null,
            'from' => $payload['data']['from'] ?? null,
            'error' => $error,
            'created_at' => $payload['created_at'] ?? null,
        ]);

        // Send Telegram alert
        $this->telegram->notifyEmailFailed($email, $error);
    }
}
