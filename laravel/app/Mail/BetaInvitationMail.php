<?php

namespace App\Mail;

use App\Models\BetaInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class BetaInvitationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public BetaInvitation $betaInvitation,
        public string $password
    ) {
        Log::channel('info')->info('Beta invitation mail queued', [
            'invitation_id' => $this->betaInvitation->id,
            'email' => $this->betaInvitation->email,
        ]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            to: [$this->betaInvitation->email],
            subject: 'Welcome to Sirius Beta - Your Account is Ready!',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.beta-invitation',
            with: [
                'invitation' => $this->betaInvitation,
                'password' => $this->password,
                'loginUrl' => url('/login'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        Log::channel('email')->error('Failed to send beta invitation email', [
            'invitation_id' => $this->betaInvitation->id,
            'email' => $this->betaInvitation->email,
            'error' => $exception->getMessage(),
            'error_class' => get_class($exception),
        ]);
    }
}
