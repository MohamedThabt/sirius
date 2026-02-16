<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class AdminUserEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $user,
        public string $subject,
        public string $messageBody
    ) {
        Log::info('Admin user email queued', [
            'user_id' => $this->user->id,
            'email' => $this->user->email,
            'subject' => $this->subject,
        ]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            to: [$this->user->email],
            subject: $this->subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-user-email',
            with: [
                'user' => $this->user,
                'messageBody' => $this->messageBody,
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
        $logoPath = public_path('images/logo.png');
        
        if (file_exists($logoPath)) {
            return [
                Attachment::fromPath($logoPath)
                    ->as('logo.png')
                    ->withMime('image/png'),
            ];
        }
        
        return [];
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        Log::error('Failed to send admin user email', [
            'user_id' => $this->user->id,
            'email' => $this->user->email,
            'subject' => $this->subject,
            'error' => $exception->getMessage(),
            'error_class' => get_class($exception),
        ]);
    }
}
