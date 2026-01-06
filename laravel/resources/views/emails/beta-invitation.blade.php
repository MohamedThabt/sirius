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
            @if(file_exists(public_path('images/logo.png')))
                <img src="{{ $message->embed(public_path('images/logo.png')) }}" alt="Sirius Logo" style="max-width: 200px; height: auto; margin-bottom: 20px;">
            @endif
            <h1>Welcome to Sirius Beta!</h1>
        </div>

        <div class="greeting">
            Dear <strong>{{ $invitation->name }}</strong>,
        </div>

        <p>We are pleased to inform you that your account for the Sirius Beta program has been successfully created. You now have exclusive access to our advanced AI-powered planning platform.</p>

        <h2>Your Account Credentials</h2>
        <div class="credentials">
            <p><strong>Email:</strong> {{ $invitation->email }}</p>
            <p><strong>Temporary Password:</strong> {{ $password }}</p>
        </div>

        <div class="note">
            <p><strong>Security Notice:</strong> For your protection, please change your password immediately after your first login. Navigate to your profile settings to update your credentials.</p>
        </div>

        <h2>Access Your Account</h2>
        <p>To begin using Sirius, please click the button below to access the platform:</p>

        <div class="button-container">
            <a href="{{ $loginUrl }}" class="button">Access Sirius Platform</a>
        </div>

        <h2>Platform Capabilities</h2>
        <p>As a beta participant, you have full access to our comprehensive suite of features:</p>
        <ul>
            <li>Product Requirements Document (PRD) Generation</li>
            <li>Database Design & Entity Relationship Diagrams (ERD)</li>
            <li>C4 Architecture Modeling</li>
            <li>User Story Development & Feature Breakdown</li>
            <li>Interactive Wireframes & Prototyping</li>
            <li>Sequence & Flow Diagrams</li>
            <li>Version Control with Comprehensive Diff History</li>
        </ul>

        <h2>Support & Assistance</h2>
        <p>Should you require any assistance or have questions about the platform, our support team is available to help. We value your feedback as it helps us enhance the Sirius experience.</p>

        <p style="margin-top: 30px;">Thank you for joining us as an early adopter. We look forward to your valuable insights and contributions to the development of Sirius.</p>

        <p style="margin-top: 20px;">
            Best regards,<br>
            <strong>The Sirius Team</strong>
        </p>

        <div class="footer">
            <p><em>This email contains confidential information intended solely for the addressee. As a beta participant, we appreciate your feedback to help us refine and improve the platform.</em></p>
        </div>
    </div>
</body>
</html>

