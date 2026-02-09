<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LicenciasSistemaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('licencias_sistemas')->insert([
            [
                'nombre' => 'Trial',
                'descripcion' => 'Licencia de prueba por 30 días',
                'duracion_dias' => 30,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Basic',
                'descripcion' => 'Licencia básica para uso individual',
                'duracion_dias' => 365,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Enterprise',
                'descripcion' => 'Licencia empresarial con soporte',
                'duracion_dias' => 365,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
