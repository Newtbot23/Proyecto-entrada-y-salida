<?php

namespace Database\Seeders;

use App\Models\MarcaVehiculo;
use Illuminate\Database\Seeder;

class MarcasVehiculoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Usa firstOrCreate para que sea idempotente: ejecutar db:seed
     * varias veces no duplica registros.
     *
     * IDs de tipos de vehículo:
     *   1 = Carro | 2 = Moto | 3 = Bicicleta | 4 = Camión
     */
    public function run(): void
    {
        $marcas = [

            // ── CARROS (id_tipo_vehiculo = 1) ─────────────────────────────────
            ['nombre' => 'Chevrolet',        'id_tipo_vehiculo' => 1],
            ['nombre' => 'Renault',          'id_tipo_vehiculo' => 1],
            ['nombre' => 'Mazda',            'id_tipo_vehiculo' => 1],
            ['nombre' => 'Toyota',           'id_tipo_vehiculo' => 1],
            ['nombre' => 'Kia',              'id_tipo_vehiculo' => 1],
            ['nombre' => 'Hyundai',          'id_tipo_vehiculo' => 1],
            ['nombre' => 'Nissan',           'id_tipo_vehiculo' => 1],
            ['nombre' => 'Ford',             'id_tipo_vehiculo' => 1],
            ['nombre' => 'Volkswagen',       'id_tipo_vehiculo' => 1],
            ['nombre' => 'Suzuki',           'id_tipo_vehiculo' => 1],
            ['nombre' => 'Jeep',             'id_tipo_vehiculo' => 1],
            ['nombre' => 'Mitsubishi',       'id_tipo_vehiculo' => 1],
            ['nombre' => 'BMW',              'id_tipo_vehiculo' => 1],
            ['nombre' => 'Mercedes-Benz',    'id_tipo_vehiculo' => 1],
            ['nombre' => 'Honda',            'id_tipo_vehiculo' => 1],

            // ── MOTOS (id_tipo_vehiculo = 2) ──────────────────────────────────
            ['nombre' => 'Yamaha',           'id_tipo_vehiculo' => 2],
            ['nombre' => 'Bajaj',            'id_tipo_vehiculo' => 2],
            ['nombre' => 'Honda',            'id_tipo_vehiculo' => 2],
            ['nombre' => 'Suzuki',           'id_tipo_vehiculo' => 2],
            ['nombre' => 'AKT',              'id_tipo_vehiculo' => 2],
            ['nombre' => 'Kawasaki',         'id_tipo_vehiculo' => 2],
            ['nombre' => 'Royal Enfield',    'id_tipo_vehiculo' => 2],
            ['nombre' => 'TVS',              'id_tipo_vehiculo' => 2],
            ['nombre' => 'Hero',             'id_tipo_vehiculo' => 2],
            ['nombre' => 'KTM',              'id_tipo_vehiculo' => 2],

            // ── BICICLETAS (id_tipo_vehiculo = 3) ─────────────────────────────
            ['nombre' => 'GW',               'id_tipo_vehiculo' => 3],
            ['nombre' => 'Trek',             'id_tipo_vehiculo' => 3],
            ['nombre' => 'Specialized',      'id_tipo_vehiculo' => 3],
            ['nombre' => 'Giant',            'id_tipo_vehiculo' => 3],
            ['nombre' => 'Cannondale',       'id_tipo_vehiculo' => 3],
            ['nombre' => 'Scott',            'id_tipo_vehiculo' => 3],
            ['nombre' => 'Merida',           'id_tipo_vehiculo' => 3],

            // ── CAMIONES (id_tipo_vehiculo = 4) ───────────────────────────────
            ['nombre' => 'Hino',             'id_tipo_vehiculo' => 4],
            ['nombre' => 'Kenworth',         'id_tipo_vehiculo' => 4],
            ['nombre' => 'Freightliner',     'id_tipo_vehiculo' => 4],
            ['nombre' => 'Volvo',            'id_tipo_vehiculo' => 4],
            ['nombre' => 'Scania',           'id_tipo_vehiculo' => 4],
            ['nombre' => 'Mercedes-Benz',    'id_tipo_vehiculo' => 4],
            ['nombre' => 'Mack',             'id_tipo_vehiculo' => 4],
            ['nombre' => 'International',    'id_tipo_vehiculo' => 4],
        ];

        foreach ($marcas as $marca) {
            MarcaVehiculo::firstOrCreate(
                // Clave de búsqueda — evita duplicados por nombre + tipo
                [
                    'nombre'           => $marca['nombre'],
                    'id_tipo_vehiculo' => $marca['id_tipo_vehiculo'],
                ],
                // Valores a asignar solo si se CREA el registro
                [
                    'nombre'           => $marca['nombre'],
                    'id_tipo_vehiculo' => $marca['id_tipo_vehiculo'],
                ]
            );
        }

        $this->command->info('✅ MarcasVehiculoSeeder: ' . count($marcas) . ' marcas procesadas (sin duplicados).');
    }
}
