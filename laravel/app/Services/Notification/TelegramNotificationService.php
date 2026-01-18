<?php

namespace App\Services\Notification;

use App\Models\BetaInvitation;
use App\Models\Feedback;
use App\Models\IssueReport;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class TelegramNotificationService
{
    private string $botToken;
    private string $chatId;
    private ?int $topicId;
    private bool $enabled;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token', '');
        $this->chatId = config('services.telegram.chat_id', '');
        $this->topicId = config('services.telegram.topic_id') ? (int) config('services.telegram.topic_id') : null;
        $this->enabled = config('services.telegram.enabled', false) 
            && !empty($this->botToken) 
            && !empty($this->chatId);
    }

    /**
     * Send a notification for new feedback.
     *
     * @param Feedback $feedback The feedback instance
     * @param User $user The user who submitted the feedback
     * @return bool Whether the notification was sent successfully
     */
    public function notifyNewFeedback(Feedback $feedback, User $user): bool
    {
        if (!$this->enabled) {
            return false;
        }

        $typeEmoji = match ($feedback->type) {
            'suggestion' => '💡',
            'ux' => '🎨',
            'confusion' => '❓',
            default => '📝',
        };

        $appUrl = config('app.url');
        $escapedMessage = $this->escapeMarkdown($feedback->message);

        $message = <<<MSG
{$typeEmoji} *New Feedback Received*

*Type:* {$feedback->type}
*From:* {$user->name} ({$user->email})
*Page:* {$feedback->page_url}

*Message:*
{$escapedMessage}

🔗 [View in Dashboard]({$appUrl}/admin/feedback/{$feedback->id})
MSG;

        return $this->sendMessage($message);
    }

    /**
     * Send a notification for new issue report.
     *
     * @param IssueReport $issue The issue report instance
     * @param User $user The user who reported the issue
     * @return bool Whether the notification was sent successfully
     */
    public function notifyNewIssue(IssueReport $issue, User $user): bool
    {
        if (!$this->enabled) {
            return false;
        }

        $severityEmoji = match ($issue->severity) {
            'blocker' => '🚨',
            'high' => '🔴',
            'medium' => '🟡',
            'low' => '🟢',
            default => '⚪',
        };

        $appUrl = config('app.url');
        $escapedTitle = $this->escapeMarkdown($issue->title);
        $escapedDescription = $this->escapeMarkdown($this->truncate($issue->description, 300));

        $message = <<<MSG
{$severityEmoji} *New Issue Reported*

*Title:* {$escapedTitle}
*Severity:* {$issue->severity}
*From:* {$user->name} ({$user->email})
*Page:* {$issue->page_url}

*Description:*
{$escapedDescription}

🔗 [View in Dashboard]({$appUrl}/admin/issues/{$issue->id})
MSG;

        return $this->sendMessage($message);
    }

    /**
     * Send a raw message to the Telegram chat.
     *
     * @param string $message The message to send
     * @param string $parseMode Parse mode (Markdown or HTML)
     * @return bool Whether the message was sent successfully
     */
    public function sendMessage(string $message, string $parseMode = 'Markdown'): bool
    {
        if (!$this->enabled) {
            Log::debug('Telegram notifications are disabled');
            return false;
        }

        try {
            $url = "https://api.telegram.org/bot{$this->botToken}/sendMessage";

            $payload = [
                'chat_id' => $this->chatId,
                'text' => $message,
                'parse_mode' => $parseMode,
                'disable_web_page_preview' => true,
            ];

            // Add topic_id if configured (for group topics)
            if ($this->topicId !== null) {
                $payload['message_thread_id'] = $this->topicId;
            }

            $response = Http::timeout(10)->post($url, $payload);

            if ($response->successful()) {
                Log::info('Telegram notification sent successfully');
                return true;
            }

            Log::warning('Telegram notification failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return false;
        } catch (Throwable $e) {
            Log::error('Telegram notification error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    /**
     * Escape special Markdown characters.
     *
     * @param string $text The text to escape
     * @return string The escaped text
     */
    private function escapeMarkdown(string $text): string
    {
        // Escape Markdown special characters
        $specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
        
        foreach ($specialChars as $char) {
            $text = str_replace($char, '\\' . $char, $text);
        }

        return $text;
    }

    /**
     * Truncate text to a maximum length.
     *
     * @param string $text The text to truncate
     * @param int $maxLength Maximum length
     * @return string The truncated text
     */
    private function truncate(string $text, int $maxLength): string
    {
        if (strlen($text) <= $maxLength) {
            return $text;
        }

        return substr($text, 0, $maxLength) . '...';
    }

    /**
     * Check if Telegram notifications are enabled.
     *
     * @return bool Whether notifications are enabled
     */
    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    /**
     * Send a notification for email bounce.
     *
     * @param string $email The email address that bounced
     * @param string $reason The bounce reason
     * @return bool Whether the notification was sent successfully
     */
    public function notifyEmailBounced(string $email, string $reason): bool
    {
        if (!$this->enabled) {
            return false;
        }

        $escapedReason = $this->escapeMarkdown($this->truncate($reason, 200));

        $message = <<<MSG
🔴 *Email Bounced*

*Email:* {$email}
*Reason:* {$escapedReason}

⚠️ This email address may be invalid or the mailbox is full\\.
MSG;

        return $this->sendMessage($message);
    }

    /**
     * Send a notification for email failure.
     *
     * @param string $email The email address that failed
     * @param string $error The error message
     * @return bool Whether the notification was sent successfully
     */
    public function notifyEmailFailed(string $email, string $error): bool
    {
        if (!$this->enabled) {
            return false;
        }

        $escapedError = $this->escapeMarkdown($this->truncate($error, 200));

        $message = <<<MSG
🚨 *Email Failed to Send*

*Email:* {$email}
*Error:* {$escapedError}

🔧 Please check the email configuration and Resend API status\\.
MSG;

        return $this->sendMessage($message);
    }

    /**
     * Send a notification for spam complaint.
     *
     * @param string $email The email address that complained
     * @return bool Whether the notification was sent successfully
     */
    public function notifyEmailComplaint(string $email): bool
    {
        if (!$this->enabled) {
            return false;
        }

        $message = <<<MSG
⚠️ *Email Complaint Received*

*Email:* {$email}

📌 This user marked our email as spam\\. Consider removing them from future mailings\\.
MSG;

        return $this->sendMessage($message);
    }

    /**
     * Send a notification for new beta invitation request.
     *
     * @param BetaInvitation $betaInvitation The beta invitation instance
     * @return bool Whether the notification was sent successfully
     */
    public function notifyNewBetaRequest(BetaInvitation $betaInvitation): bool
    {
        if (!$this->enabled) {
            return false;
        }

        $escapedName = $this->escapeMarkdown($betaInvitation->name);
        $appUrl = config('app.url');

        $message = <<<MSG
🚀 *New Beta Request*

*Name:* {$escapedName}
*Email:* {$betaInvitation->email}

📋 [View Beta Invitations]({$appUrl}/admin/beta)
MSG;

        return $this->sendMessage($message);
    }
}

