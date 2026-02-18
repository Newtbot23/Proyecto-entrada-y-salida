<?php

use App\Models\Entidades;
use App\Models\LicenciasSistema;
use App\Models\Usuarios;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $entity = Entidades::find('11');
    echo "Entity: " . $entity->nombre_entidad . " (ID: " . $entity->id . ")\n";

    $license = LicenciasSistema::where('id_entidad', $entity->id)->first();
    if ($license) {
        echo "License found: ID " . $license->id . ", Name: " . $license->nombre . "\n";
        
        $users = Usuarios::where('id_licencia_sistema', $license->id)->get();
        echo "Users found for this license: " . $users->count() . "\n";
        foreach ($users as $user) {
            echo "- User: " . $user->primer_nombre . " (Doc: " . $user->doc . ")\n";
        }
    } else {
        echo "No license found for this entity.\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
