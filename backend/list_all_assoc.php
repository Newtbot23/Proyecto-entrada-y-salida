<?php

use App\Models\Entidades;
use App\Models\LicenciasSistema;
use App\Models\Usuarios;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $entities = Entidades::all();
    echo "Total Entities: " . $entities->count() . "\n\n";

    foreach ($entities as $entity) {
        echo "Entity: " . $entity->nombre_entidad . " (NIT: " . $entity->nit . ", ID: " . $entity->id . ")\n";
        
        $license = LicenciasSistema::where('id_entidad', $entity->id)->first();
        if ($license) {
            echo "  - License found: ID " . $license->id . "\n";
            $usersCount = Usuarios::where('id_licencia_sistema', $license->id)->count();
            echo "  - Users count: " . $usersCount . "\n";
        } else {
            echo "  - No license found.\n";
        }
        echo "------------------\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
