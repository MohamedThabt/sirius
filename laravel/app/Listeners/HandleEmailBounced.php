<?php

namespace App\Listeners;

use App\Services\Notification\TelegramNotificationService;
use Illuminate\Support\Facades\Log;
use Resend\Laravel\Events\EmailBounced;

class HandleEmailBounced
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
    public function handle(EmailBounced $event): void
    {
        $payload = $event->payload;

        $email = $payload['data']['to'][0] ?? 'unknown';
        $reason = $payload['data']['bounce']['message'] ?? 'No reason provided';

        Log::channel('email')->warning('Email bounced', [
            'email_id' => $payload['data']['email_id'] ?? null,
            'to' => $payload['data']['to'] ?? [],
            'subject' => $payload['data']['subject'] ?? null,
            'from' => $payload['data']['from'] ?? null,
            'bounce_reason' => $reason,
            'created_at' => $payload['created_at'] ?? null,
        ]);

        // Send Telegram alert
        $this->telegram->notifyEmailBounced($email, $reason);
    }
}
