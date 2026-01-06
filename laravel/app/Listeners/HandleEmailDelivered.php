<?php

namespace App\Listeners;

use Illuminate\Support\Facades\Log;
use Resend\Laravel\Events\EmailDelivered;

class HandleEmailDelivered
{
    /**
     * Handle the event.
     */
    public function handle(EmailDelivered $event): void
    {
        $payload = $event->payload;

        Log::channel('email')->info('Email delivered successfully', [
            'email_id' => $payload['data']['email_id'] ?? null,
            'to' => $payload['data']['to'] ?? [],
            'subject' => $payload['data']['subject'] ?? null,
            'from' => $payload['data']['from'] ?? null,
            'created_at' => $payload['created_at'] ?? null,
        ]);
    }
}
