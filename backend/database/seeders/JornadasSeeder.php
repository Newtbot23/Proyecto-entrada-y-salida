<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Jornadas;

class JornadasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jornadas = [
            'Mañana',
            'Tarde',
            'Nocturna',
            'Sabatina Nocturna',
        ];

        foreach ($jornadas as $jornada) {
            Jornadas::updateOrCreate(['jornada' => $jornada]);
        }
    }
}
