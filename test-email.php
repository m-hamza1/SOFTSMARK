<?php
// test-email.php - Simple test to verify PHPMailer is working

require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';
require_once __DIR__ . '/PHPMailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function testSendEmail($to, $subject, $message) {
    try {
        $mail = new PHPMailer(true);
        $mail->SMTPDebug = SMTP::DEBUG_SERVER; // Enable debugging
        $mail->isSMTP();

        // Server settings
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'multishellstechnology@gmail.com';
        $mail->Password = 'gyooyrnhaxymopkn';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        // Recipients
        $mail->setFrom('multishellstechnology@gmail.com', 'SOFTSMARK Test');
        $mail->addAddress($to);
        $mail->addReplyTo('multishellstechnology@gmail.com', 'SOFTSMARK');

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $message;
        $mail->AltBody = strip_tags($message);

        if ($mail->send()) {
            echo "Email sent successfully to $to";
            return true;
        } else {
            echo "Failed to send email: " . $mail->ErrorInfo;
            return false;
        }
    } catch (Exception $e) {
        echo "Exception: " . $e->getMessage();
        return false;
    }
}

// Test the email functionality
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $testEmail = $_POST['test_email'] ?? '';
    if (filter_var($testEmail, FILTER_VALIDATE_EMAIL)) {
        $subject = "SOFTSMARK Email Test";
        $message = "<h2>Email Test Successful!</h2><p>This is a test email from SOFTSMARK.</p><p>Timestamp: " . date('Y-m-d H:i:s') . "</p>";

        if (testSendEmail($testEmail, $subject, $message)) {
            echo "<script>alert('Test email sent successfully!'); window.location.href='test-email.php';</script>";
        } else {
            echo "<script>alert('Failed to send test email. Check the output above.'); window.history.back();</script>";
        }
    } else {
        echo "<script>alert('Please enter a valid email address.'); window.history.back();</script>";
    }
} else {
    // Show test form
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Test - SOFTSMARK</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            form { background: #f5f5f5; padding: 20px; border-radius: 8px; }
            input[type="email"] { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
            button { background: #8b5cf6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #7c3aed; }
        </style>
    </head>
    <body>
        <h1>SOFTSMARK Email Test</h1>
        <p>Test if the email functionality is working properly.</p>

        <form method="POST">
            <label for="test_email">Enter your email address to receive a test email:</label><br>
            <input type="email" id="test_email" name="test_email" required placeholder="your-email@example.com">
            <br><br>
            <button type="submit">Send Test Email</button>
        </form>

        <p><strong>Note:</strong> Make sure your Gmail account has "Less secure app access" enabled or use an App Password.</p>
        <p><a href="index.html">← Back to main site</a></p>
    </body>
    </html>
    <?php
}
?>