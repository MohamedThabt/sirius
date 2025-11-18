<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Sirius Beta</title>
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
            font-size: 28px;
            margin-bottom: 10px;
        }
        h2 {
            color: #1F2937;
            font-size: 20px;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .credentials {
            background-color: #F3F4F6;
            border-left: 4px solid #4F46E5;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .credentials p {
            margin: 8px 0;
        }
        .credentials strong {
            color: #1F2937;
        }
        .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #4F46E5;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .button:hover {
            background-color: #4338CA;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        ul {
            list-style-type: none;
            padding-left: 0;
        }
        ul li {
            padding: 8px 0;
            position: relative;
            padding-left: 25px;
        }
        ul li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10B981;
            font-weight: bold;
        }
        .note {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 14px;
        }
        .greeting {
            font-size: 18px;
            color: #1F2937;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Welcome to Sirius Beta!</h1>
        </div>

        <div class="greeting">
            Hello <strong>{{ $invitation->name }}</strong>,
        </div>

        <p>Great news! Your account for the Sirius Beta program has been created and is ready to use.</p>

        <h2>Your Login Details</h2>
        <div class="credentials">
            <p><strong>Email:</strong> {{ $invitation->email }}</p>
            <p><strong>Password:</strong> {{ $password }}</p>
        </div>

        <h2>Getting Started</h2>
        <p>Click the button below to log in and start exploring the Sirius AI Planning Engine:</p>

        <div class="button-container">
            <a href="{{ $loginUrl }}" class="button">Log In to Sirius</a>
        </div>

        <h2>Important Notes</h2>
        <div class="note">
            <p><strong>⚠️ Change Your Password:</strong> Once you log in, we recommend changing your password from your profile settings for security.</p>
        </div>

        <p><strong>Beta Features:</strong> You now have full access to all Sirius beta features including:</p>
        <ul>
            <li>PRD Generation</li>
            <li>Database Design (ERD & C4)</li>
            <li>Architecture Diagrams</li>
            <li>User Stories & Feature Breakdown</li>
            <li>Wireframes & Sequence Diagrams</li>
            <li>Version Control with Diff History</li>
        </ul>

        <h2>Need Help?</h2>
        <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>

        <p style="margin-top: 30px;">Thank you for being part of the Sirius community! We're excited to have you on board. 🎉</p>

        <p style="margin-top: 20px;">
            Best regards,<br>
            <strong>The Sirius Team</strong>
        </p>

        <div class="footer">
            <p><em>This is a beta version. We appreciate your feedback as we continue to improve the platform.</em></p>
        </div>
    </div>
</body>
</html>

