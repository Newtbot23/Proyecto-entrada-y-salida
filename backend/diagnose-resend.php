<?php

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Resend Email Delivery Diagnostic\n";
echo "=================================\n\n";

// Check configuration
echo "1. Configuration Check:\n";
echo "   MAIL_MAILER: " . config('mail.default') . "\n";
echo "   RESEND_API_KEY: " . (config('services.resend.key') ? 'Set (✓)' : 'Not Set (✗)') . "\n";
echo "   MAIL_FROM_ADDRESS: " . config('mail.from.address') . "\n";
echo "   MAIL_FROM_NAME: " . config('mail.from.name') . "\n\n";

// Test email sending
$recipient = 'dilansantiortizm@gmail.com';

echo "2. Sending Test Email to: $recipient\n";

try {
    Mail::raw('This is a diagnostic test email from Laravel.', function ($message) use ($recipient) {
        $message->to($recipient)
                ->subject('Test Email - Resend Diagnostic');
    });
    
    echo "   [SUCCESS] Email sent without exceptions\n\n";
    
    // Check if email was actually sent or just logged
    echo "3. Verifying Delivery Method:\n";
    $mailer = config('mail.default');
    if ($mailer === 'log') {
        echo "   [WARNING] Emails are being LOGGED, not sent!\n";
        echo "   Check: storage/logs/laravel.log\n\n";
    } elseif ($mailer === 'resend') {
        echo "   [INFO] Using Resend mailer\n";
        echo "   Check Resend dashboard for delivery confirmation\n\n";
    }
    
} catch (\Exception $e) {
    echo "   [ERROR] Exception occurred:\n";
    echo "   Message: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
}

echo "4. Recommendations:\n";
echo "   - Check Resend dashboard: https://resend.com/emails\n";
echo "   - Verify API key is active\n";
echo "   - Confirm email is not in spam folder\n";
echo "   - Check that email matches verified address\n";
