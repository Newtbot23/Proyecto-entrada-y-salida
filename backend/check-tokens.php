<?php

use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Password Reset Tokens Check\n";
echo "============================\n\n";

try {
    $tokens = DB::table('password_reset_tokens')
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get();
    
    if ($tokens->count() > 0) {
        echo "Recent password reset tokens:\n\n";
        foreach ($tokens as $token) {
            echo "Email: " . $token->email . "\n";
            echo "Token: " . substr($token->token, 0, 20) . "...\n";
            echo "Created: " . $token->created_at . "\n";
            echo "---\n";
        }
    } else {
        echo "[INFO] No password reset tokens found in database\n";
        echo "This means the password broker is NOT creating tokens\n";
    }
} catch (\Exception $e) {
    echo "[ERROR] " . $e->getMessage() . "\n";
}
