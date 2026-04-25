<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProUpgradeAcceptedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly int $creditsAdded,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Sirius Pro Plan is Now Active!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.pro-upgrade-accepted',
        );
    }
}
