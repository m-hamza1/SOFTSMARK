<?php
// send-quote.php - Handle quote form submission and send email

// Load PHPMailer classes directly (since composer autoloader may not be available)
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';
require_once __DIR__ . '/PHPMailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $name = htmlspecialchars($_POST['name'] ?? '');
    $email = htmlspecialchars($_POST['email'] ?? '');
    $company = htmlspecialchars($_POST['company'] ?? '');
    $service = htmlspecialchars($_POST['service'] ?? '');
    $budget_amount = htmlspecialchars($_POST['budget_amount'] ?? '');
    $budget_currency = htmlspecialchars($_POST['budget_currency'] ?? '');
    $timeline = htmlspecialchars($_POST['timeline'] ?? '');
    $requirements = htmlspecialchars($_POST['requirements'] ?? '');
    $newsletter = isset($_POST['newsletter']) ? 'Yes' : 'No';

    // Debug: Log received data
    error_log("Quote Form Data - Name: $name, Email: $email, Service: $service, Budget: $budget_amount $budget_currency, Timeline: $timeline");

    // Validate required fields
    if (empty($name) || empty($email) || empty($service) || empty($budget_amount)) {
        echo "<script>alert('Please fill in all required fields.'); window.history.back();</script>";
        exit;
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "<script>alert('Please enter a valid email address.'); window.history.back();</script>";
        exit;
    }

    // Combine budget
    $budget = $budget_amount && $budget_currency ? "$budget_amount $budget_currency" : '';

    // Calculate quote - use user's budget as the quoted price if provided, otherwise use service base price
    $basePrice = 0;

    // If user provided a budget, use that as the quoted price
    if ($budget_amount && $budget_currency) {
        $amount = (float)$budget_amount;
        if ($budget_currency === 'PKR') {
            $basePrice = $amount / 280; // Convert PKR to USD
        } else {
            $basePrice = $amount; // Already in USD
        }
    } else {
        // Use fixed prices per service if no budget provided
        $servicePrices = [
            'ai-automation' => 15000,
            'mobile-app' => 25000,
            'web-app' => 20000,
            'custom-software' => 30000,
            'ai-chatbot' => 12000,
            'ai-integration' => 18000
        ];
        $basePrice = $servicePrices[$service] ?? 20000;
    }

    // Simple timeline adjustment (optional - can be removed if not wanted)
    $timelineMultipliers = [
        'asap' => 1.1,  // Small increase for rush jobs
        '1-3-months' => 1.0,
        '3-6-months' => 1.0,
        '6-months-plus' => 0.9  // Small discount for longer timelines
    ];

    $basePrice *= $timelineMultipliers[$timeline] ?? 1.0;

    $formattedPrice = '$' . number_format(round($basePrice), 0);

    // Debug: Log calculated price
    error_log("Calculated Price: $formattedPrice (Base: $basePrice, Service: $service, Budget: $budget_amount $budget_currency)");

    // Service names
    $serviceNames = [
        'ai-automation' => 'AI Automation',
        'mobile-app' => 'Mobile App Development',
        'web-app' => 'Web Application',
        'custom-software' => 'Custom Software',
        'ai-chatbot' => 'AI Chatbot',
        'ai-integration' => 'AI Integration'
    ];

    $serviceName = $serviceNames[$service] ?? $service;

    // Timeline names
    $timelineNames = [
        'asap' => 'ASAP (2-4 weeks)',
        '1-3-months' => '1-3 months',
        '3-6-months' => '3-6 months',
        '6-months-plus' => '6+ months'
    ];

    $timelineName = $timelineNames[$timeline] ?? $timeline;

    function sendEmail($to, $subject, $message, $isHTML = true) {
        try {
            $mail = new PHPMailer(true);
            $mail->SMTPDebug = SMTP::DEBUG_OFF; // Disabled for speed
            $mail->isSMTP();

            // Server settings for Gmail SMTP - optimized for speed
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'multishellstechnology@gmail.com';
            $mail->Password = 'gyooyrnhaxymopkn';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            // Performance optimizations
            $mail->SMTPKeepAlive = false; // Close connection after sending
            $mail->Timeout = 10; // 10 second timeout
            $mail->SMTPAutoTLS = false; // Disable auto TLS for speed

            // Set UTF-8 encoding
            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';

            // Recipients
            $mail->setFrom('multishellstechnology@gmail.com', 'SOFTSMARK');
            $mail->addAddress($to);
            $mail->addReplyTo('multishellstechnology@gmail.com', 'SOFTSMARK');

            // Content
            $mail->isHTML($isHTML);
            $mail->Subject = $subject;
            $mail->Body = $message;
            $mail->AltBody = strip_tags($message);

            // Send email
            if (!$mail->send()) {
                logMailFailure('phpmailer_error', $to, $subject, $mail->ErrorInfo);
                return false;
            }

            return true;
        } catch (Exception $e) {
            logMailFailure('phpmailer_exception', $to, $subject, $e->getMessage());
            return false;
        }
    }    // Email content for user
    $subject = "Your Custom Quote from SOFTSMARK - $formattedPrice";

    $message = "
    <html>
    <head>
        <title>Your Custom Quote from SOFTSMARK</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .quote-box { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .price { font-size: 3em; font-weight: bold; color: #10b981; margin: 10px 0; }
            .service { font-size: 1.2em; color: #6c757d; margin-bottom: 20px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 0.9em; color: #6c757d; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>SOFTSMARK</h1>
            <p>Your Custom Quote</p>
        </div>

        <div class='content'>
            <p>Dear $name,</p>

            <p>Thank you for your interest in our services! Based on your requirements, here's your custom quote:</p>

            <div class='quote-box'>
                <div class='price'>$formattedPrice</div>
                <div class='service'>For: $serviceName</div>
                " . ($budget ? "<div class='service'>Your Budget: $budget</div>" : "") . "
            </div>

            <p>This quote is valid for 30 days. To proceed with your project, please reply to this email or contact us at multishellstechnology@gmail.com.</p>

            <p>We'd love to discuss your project in more detail and answer any questions you may have.</p>

            <p>Best regards,<br>
            The SOFTSMARK Team<br>
            multishellstechnology@gmail.com<br>
            +1 (415) 555-1234</p>
        </div>

        <div class='footer'>
            <p>This is an automated email. Please do not reply directly to this message.</p>
            <p>© 2025 SOFTSMARK. All rights reserved.</p>
        </div>
    </body>
    </html>";

    // Send email to user
    $userEmailSent = sendEmail($email, $subject, $message);

    // Send notification email to admin (you)
    $adminSubject = "New Quote Request from $name";
    $adminMessage = "
    <html>
    <head>
        <title>New Quote Request</title>
        <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <h2>New Quote Request Received</h2>
        <table>
            <tr><th>Field</th><th>Value</th></tr>
            <tr><td><strong>Name:</strong></td><td>$name</td></tr>
            <tr><td><strong>Email:</strong></td><td>$email</td></tr>
            <tr><td><strong>Company:</strong></td><td>$company</td></tr>
            <tr><td><strong>Service:</strong></td><td>$serviceName</td></tr>
            <tr><td><strong>Budget:</strong></td><td>$budget</td></tr>
            <tr><td><strong>Timeline:</strong></td><td>$timelineName</td></tr>
            <tr><td><strong>Requirements:</strong></td><td>$requirements</td></tr>
            <tr><td><strong>Newsletter:</strong></td><td>$newsletter</td></tr>
            <tr><td><strong>Quoted Price:</strong></td><td>$formattedPrice</td></tr>
        </table>
        <p><strong>Timestamp:</strong> " . date('Y-m-d H:i:s') . "</p>
    </body>
    </html>";

    // Send notification email to admin (you)
    $adminEmailSent = sendEmail('multishellstechnology@gmail.com', $adminSubject, $adminMessage);

    // Helper: log mail failures for debugging (useful on local dev / XAMPP)
    function logMailFailure($type, $to, $subject, $body) {
        $logDir = __DIR__;
        $logFile = $logDir . DIRECTORY_SEPARATOR . 'mail_errors.log';
        $entry = "[" . date('Y-m-d H:i:s') . "] TYPE: $type\n";
        $entry .= "TO: $to\nSUBJECT: $subject\n";
        $entry .= "BODY:\n" . $body . "\n";
        $entry .= "REQUEST: " . json_encode(array(
            'REMOTE_ADDR' => $_SERVER['REMOTE_ADDR'] ?? '',
            'HTTP_USER_AGENT' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? ''
        )) . "\n";
        $entry .= str_repeat('-', 80) . "\n";
        @file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
    }

    // Redirect back with success message; log failures for debugging
    if ($userEmailSent && $adminEmailSent) {
        echo "<script>
            alert('Thank you! Your quote has been sent to your email address. Please check your inbox.');
            window.location.href = 'index.html';
        </script>";
    } else {
        // Log details to mail_errors.log for debugging
        if (! $userEmailSent) {
            logMailFailure('user_email_failed', $email, $subject, $message);
        }
        if (! $adminEmailSent) {
            logMailFailure('admin_email_failed', 'multishellstechnology@gmail.com', $adminSubject, $adminMessage);
        }

        echo "<script>
            alert('Sorry, there was an error sending your quote. The issue has been logged and we will investigate. Please try again or contact us directly.');
            window.history.back();
        </script>";
    }
} else {
    // If not POST, redirect to home
    header("Location: index.html");
    exit;
}
?>