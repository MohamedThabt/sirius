<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Sirius Pro Plan is Active!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
        .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        h1 { color: #4F46E5; font-size: 22px; margin-bottom: 6px; }
        .badge { display: inline-block; background: #D1FAE5; color: #065F46; border-radius: 9999px; padding: 2px 12px; font-size: 13px; font-weight: 600; }
        .highlight-box { background: #F5F3FF; border-left: 4px solid #4F46E5; padding: 16px 20px; border-radius: 4px; margin: 24px 0; }
        .highlight-box p { margin: 0; font-size: 15px; }
        .credits-chip { display: inline-block; background: #4F46E5; color: #fff; padding: 4px 14px; border-radius: 9999px; font-weight: 700; font-size: 14px; }
        .cta-btn { display: inline-block; margin: 18px 0; background: #4F46E5; color: #fff !important; padding: 10px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #6B7280; font-size: 13px; }
        .no-reply-note { background: #FFF7ED; border: 1px solid #FED7AA; color: #92400E; border-radius: 6px; padding: 12px 16px; font-size: 13px; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Sirius Pro!</h1>
            <span class="badge">Plan Activated</span>
        </div>

        <p>Dear <strong>{{ $user->name }}</strong>,</p>

        <p>Great news! Your payment has been verified and your Sirius account has been upgraded to the <strong>Pro plan</strong>.</p>

        <div class="highlight-box">
            <p><strong>Your Pro plan is now active.</strong> You have been credited with:</p>
            <p style="margin-top:10px;">
                <span class="credits-chip">{{ number_format($creditsAdded) }} AI Credits</span>
            </p>
        </div>

        <p><strong>What's included in your Pro plan:</strong></p>
        <ul>
            <li>{{ number_format($creditsAdded) }} AI Credits per month</li>
            <li>Unlimited projects</li>
            <li>All AI-powered features</li>
            <li>Priority support</li>
        </ul>

        <p style="text-align:center;">
            <a href="{{ config('app.url') }}/projects" class="cta-btn">
                Start Building
            </a>
        </p>

        <div class="no-reply-note">
            <strong>Note:</strong> This email was sent from a no-reply address. For any questions or support, please contact us at
            <a href="mailto:mohamedthabetthabet36@gmail.com">mohamedthabetthabet36@gmail.com</a>.
        </div>

        <div class="footer">
            <p>Best regards,<br><strong>Sirius Team</strong></p>
            <p><em>If you believe this was a mistake, please contact us immediately at mohamedthabetthabet36@gmail.com.</em></p>
        </div>
    </div>
</body>
</html>
