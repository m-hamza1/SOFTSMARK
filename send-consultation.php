<?php
// send-consultation.php - Handle consultation form submission and send email

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
    $projectType = htmlspecialchars($_POST['projectType'] ?? '');
    $message = htmlspecialchars($_POST['message'] ?? '');
    $nda = isset($_POST['nda']) ? 'Yes' : 'No';

    // Debug: Log received data
    error_log("Consultation Form Data - Name: $name, Email: $email, Project: $projectType, NDA: $nda");

    // Validate required fields
    if (empty($name) || empty($email)) {
        echo "Please fill in all required fields.";
        exit;
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Please enter a valid email address.";
        exit;
    }

    // Project type names
    $projectTypeNames = [
        'product' => 'New product build',
        'feature' => 'Feature delivery',
        'advisory' => 'Advisory / audit',
        'ai' => 'AI integration'
    ];

    $projectTypeName = $projectTypeNames[$projectType] ?? $projectType;

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
    }

    // Send notification email to admin (you)
    $adminSubject = "New Consultation Request from $name";
    $adminMessage = "
    <html>
    <head>
        <title>New Consultation Request</title>
        <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <h2>New Consultation Request Received</h2>
        <table>
            <tr><th>Field</th><th>Value</th></tr>
            <tr><td><strong>Name:</strong></td><td>$name</td></tr>
            <tr><td><strong>Email:</strong></td><td>$email</td></tr>
            <tr><td><strong>Company:</strong></td><td>$company</td></tr>
            <tr><td><strong>Project Type:</strong></td><td>$projectTypeName</td></tr>
            <tr><td><strong>Message:</strong></td><td>$message</td></tr>
            <tr><td><strong>NDA Request:</strong></td><td>$nda</td></tr>
        </table>
        <p><strong>Timestamp:</strong> " . date('Y-m-d H:i:s') . "</p>
    </body>
    </html>";

    // Send notification email to admin (you)
    $adminEmailSent = sendEmail('multishellstechnology@gmail.com', $adminSubject, $adminMessage);

    // Send confirmation email to user
    $userSubject = "Thank you for your consultation request - SOFTSMARK";
    $userMessage = "
    <html>
    <head>
        <title>Consultation Request Received</title>
        <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>Thank You, $name!</h1>
                <p>Your consultation request has been received</p>
            </div>
            <div class='content'>
                <p>Hi $name,</p>
                <p>Thank you for reaching out to SOFTSMARK. We've received your consultation request and our team will review it shortly.</p>
                
                <h3>Your Request Details:</h3>
                <ul>
                    <li><strong>Name:</strong> $name</li>
                    <li><strong>Email:</strong> $email</li>
                    <li><strong>Company:</strong> $company</li>
                    <li><strong>Project Type:</strong> $projectTypeName</li>
                    <li><strong>Message:</strong> $message</li>
                    <li><strong>NDA Request:</strong> $nda</li>
                </ul>
                
                <p>We'll get back to you within 24 hours with next steps. In the meantime, feel free to check out our <a href='https://softsmark.com/solutions.html'>solutions</a> or <a href='https://softsmark.com/pricing.html'>pricing</a> pages.</p>
                
                <p>Best regards,<br>The SOFTSMARK Team</p>
                
                <a href='https://softsmark.com' class='button'>Visit Our Website</a>
            </div>
        </div>
    </body>
    </html>";

    // Send confirmation email to user
    $userEmailSent = sendEmail($email, $userSubject, $userMessage);

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

    // Return success or failure message
    if ($adminEmailSent && $userEmailSent) {
        echo "Thank you! Your consultation request has been sent. We've sent you a confirmation email as well.";
    } elseif ($adminEmailSent) {
        echo "Thank you! Your consultation request has been sent. We will contact you soon.";
    } else {
        // Log details to mail_errors.log for debugging
        logMailFailure('admin_email_failed', 'multishellstechnology@gmail.com', $adminSubject, $adminMessage);
        echo "Sorry, there was an error sending your consultation request. Please try again or contact us directly.";
    }
} else {
    // If not POST, redirect to home
    header("Location: index.html");
    exit;
}
?>