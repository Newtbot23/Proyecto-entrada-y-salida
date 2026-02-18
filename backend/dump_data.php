<?php

use App\Models\Usuarios;
use App\Models\LicenciasSistema;
use App\Models\Entidades;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "--- Usuarios ---\n";
    foreach (Usuarios::all() as $u) {
        echo "Doc: {$u->doc}, Name: {$u->primer_nombre}, LicenseID: {$u->id_licencia_sistema}\n";
    }

    echo "\n--- Licencias ---\n";
    foreach (LicenciasSistema::all() as $l) {
        echo "ID: {$l->id}, EntityID: {$l->id_entidad}\n";
    }

    echo "\n--- Entidades ---\n";
    foreach (Entidades::all() as $e) {
        echo "ID: {$e->id}, NIT: {$e->nit}, Name: {$e->nombre_entidad}\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
