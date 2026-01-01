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
        // #region agent log
        $logFile = base_path('.cursor/debug.log');
        $logData = json_encode([
            'sessionId' => 'debug-session',
            'runId' => 'run1',
            'hypothesisId' => 'B',
            'location' => 'BetaInvitationMail.php:22',
            'message' => 'Mail class instantiated',
            'data' => [
                'invitation_id' => $this->betaInvitation->id,
                'email' => $this->betaInvitation->email,
                'queue_connection' => config('queue.default'),
            ],
            'timestamp' => (int) (microtime(true) * 1000),
        ]) . "\n";
        file_put_contents($logFile, $logData, FILE_APPEND);
        // #endregion
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        // #region agent log
        $logFile = base_path('.cursor/debug.log');
        $logData = json_encode([
            'sessionId' => 'debug-session',
            'runId' => 'run1',
            'hypothesisId' => 'C',
            'location' => 'BetaInvitationMail.php:30',
            'message' => 'Envelope method called',
            'data' => [
                'invitation_id' => $this->betaInvitation->id,
                'to_email' => $this->betaInvitation->email,
                'mail_from_address' => config('mail.from.address'),
                'mail_from_name' => config('mail.from.name'),
            ],
            'timestamp' => (int) (microtime(true) * 1000),
        ]) . "\n";
        file_put_contents($logFile, $logData, FILE_APPEND);
        // #endregion
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
        // #region agent log
        $logFile = base_path('.cursor/debug.log');
        $logData = json_encode([
            'sessionId' => 'debug-session',
            'runId' => 'run1',
            'hypothesisId' => 'C',
            'location' => 'BetaInvitationMail.php:41',
            'message' => 'Content method called',
            'data' => [
                'invitation_id' => $this->betaInvitation->id,
                'view_exists' => view()->exists('emails.beta-invitation'),
            ],
            'timestamp' => (int) (microtime(true) * 1000),
        ]) . "\n";
        file_put_contents($logFile, $logData, FILE_APPEND);
        // #endregion
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
        // #region agent log
        $logFile = base_path('.cursor/debug.log');
        $logData = json_encode([
            'sessionId' => 'debug-session',
            'runId' => 'run1',
            'hypothesisId' => 'D',
            'location' => 'BetaInvitationMail.php:66',
            'message' => 'Mail job failed',
            'data' => [
                'invitation_id' => $this->betaInvitation->id,
                'email' => $this->betaInvitation->email,
                'error_message' => $exception->getMessage(),
                'error_class' => get_class($exception),
                'queue_connection' => config('queue.default'),
                'mail_mailer' => config('mail.default'),
            ],
            'timestamp' => (int) (microtime(true) * 1000),
        ]) . "\n";
        file_put_contents($logFile, $logData, FILE_APPEND);
        // #endregion
        Log::error('Failed to send beta invitation email', [
            'email' => $this->betaInvitation->email,
            'invitation_id' => $this->betaInvitation->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
