<?php

use App\Models\Admins;
use App\Models\Usuarios;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'dilansantiortizm@gmail.com';

echo "Verifying Test Users\n";
echo "===================\n\n";

// Check Admin
$admin = Admins::where('correo', $email)->first();
if ($admin) {
    echo "✓ Admin exists: " . $admin->correo . "\n";
    echo "  ID: " . $admin->id . "\n";
    echo "  Name: " . $admin->nombre . "\n\n";
} else {
    echo "✗ Admin NOT found\n\n";
}

// Check Usuario
$usuario = Usuarios::where('correo', $email)->first();
if ($usuario) {
    echo "✓ Usuario exists: " . $usuario->correo . "\n";
    echo "  ID: " . $usuario->id . "\n";
    echo "  Name: " . $usuario->primer_nombre . " " . $usuario->primer_apellido . "\n\n";
} else {
    echo "✗ Usuario NOT found\n\n";
}

echo "===================\n";
if ($admin || $usuario) {
    echo "You can now test password recovery with: $email\n";
} else {
    echo "ERROR: No test users found. Run create scripts.\n";
}
