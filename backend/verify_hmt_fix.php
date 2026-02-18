<?php

use App\Models\Entidades;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $entity = Entidades::find('323232'); // londom (NIT: 323232)
    if (!$entity) {
        echo "Entity 323232 not found.\n";
        exit;
    }

    echo "Entity: " . $entity->nombre_entidad . " (ID: " . $entity->id . ")\n";
    
    $users = $entity->usuarios;
    echo "Users count found: " . $users->count() . "\n";
    foreach ($users as $user) {
        echo "- User: " . $user->primer_nombre . " (Doc: " . $user->doc . ")\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
