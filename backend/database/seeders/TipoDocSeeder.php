<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TipoDoc;

class TipoDocSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tipos = [
            ['nombre' => 'Cédula de Ciudadanía'],
            ['nombre' => 'Tarjeta de Identidad'],
            ['nombre' => 'Cédula de Extranjería'],
            ['nombre' => 'Pasaporte'],
            ['nombre' => 'NIT'],
        ];

        foreach ($tipos as $tipo) {
            TipoDoc::updateOrCreate(['nombre' => $tipo['nombre']], $tipo);
        }
    }
}
