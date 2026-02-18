<?php

use App\Models\Entidades;
use App\Models\LicenciasSistema;
use App\Models\Usuarios;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

class EntidadesTest extends Entidades {
    public function usuariosTest() {
        return $this->hasManyThrough(
            Usuarios::class,
            LicenciasSistema::class,
            'id_entidad',
            'id_licencia_sistema',
            'id',
            'id'
        );
    }
}

try {
    $entity = EntidadesTest::find('11'); // fdfcsvf (NIT: 11)
    if (!$entity) {
        echo "Entity 11 not found.\n";
        exit;
    }

    echo "Entity: " . $entity->nombre_entidad . " (ID: " . $entity->id . ")\n";
    
    $usersCount = $entity->usuariosTest()->count();
    echo "Users count (Through License): " . $usersCount . "\n";
    
    foreach ($entity->usuariosTest as $user) {
        echo "User: " . $user->primer_nombre . "\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
