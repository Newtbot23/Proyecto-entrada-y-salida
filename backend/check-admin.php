<?php

use App\Models\Admins;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'dilansantiortizm@gmail.com'; // The email verified in Resend implementation plan

$admin = Admins::where('correo', $email)->first();

if ($admin) {
    echo "Admin found: " . $admin->correo . "\n";
} else {
    echo "Admin NOT found for email: " . $email . "\n";
    // List all admins to see what's available
    $admins = Admins::all();
    echo "Available admins:\n";
    foreach ($admins as $a) {
        echo "- " . $a->correo . "\n";
    }
}
