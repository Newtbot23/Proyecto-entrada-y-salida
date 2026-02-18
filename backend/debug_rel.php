<?php

use App\Models\Entidades;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $entity = Entidades::find('11');
    if (!$entity) {
        echo "Entity with NIT 11 not found.\n";
        exit;
    }

    echo "Entity NIT: " . $entity->nit . "\n";
    echo "Entity ID (if exists): " . ($entity->id ?? 'N/A') . "\n";
    
    $query = $entity->usuarios()->toSql();
    echo "SQL for usuarios relationship: " . $query . "\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
