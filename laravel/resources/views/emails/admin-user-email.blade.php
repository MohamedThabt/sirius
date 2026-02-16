<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $messageBody }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        h1 {
            color: #4F46E5;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .message-content {
            background-color: #F9FAFB;
            border-left: 4px solid #4F46E5;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .greeting {
            font-size: 16px;
            color: #1F2937;
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{ $message->embed(public_path('images/logo.png')) }}" alt="Sirius Logo" style="max-width: 200px; height: auto; margin-bottom: 20px;">
            <h1>Message from Sirius Team</h1>
        </div>

        <div class="greeting">
            Dear <strong>{{ $user->name }}</strong>,
        </div>

        <div class="message-content">
            {{ $messageBody }}
        </div>

        <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The Sirius Team</strong>
        </p>

        <div class="footer">
            <p><em>This email was sent to you by the Sirius administrative team. If you have any questions, please contact our support team.</em></p>
        </div>
    </div>
</body>
</html>
