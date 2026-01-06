<?php

namespace App\Listeners;

use App\Services\Notification\TelegramNotificationService;
use Illuminate\Support\Facades\Log;
use Resend\Laravel\Events\EmailComplained;

class HandleEmailComplained
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
    public function handle(EmailComplained $event): void
    {
        $payload = $event->payload;

        $email = $payload['data']['to'][0] ?? 'unknown';

        Log::channel('email')->warning('Email spam complaint received', [
            'email_id' => $payload['data']['email_id'] ?? null,
            'to' => $payload['data']['to'] ?? [],
            'subject' => $payload['data']['subject'] ?? null,
            'from' => $payload['data']['from'] ?? null,
            'created_at' => $payload['created_at'] ?? null,
        ]);

        // Send Telegram alert
        $this->telegram->notifyEmailComplaint($email);
    }
}
