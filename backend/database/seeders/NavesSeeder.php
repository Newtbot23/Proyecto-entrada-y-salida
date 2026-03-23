<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Naves;

class NavesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $naves = [
            'Nave 1',
            'Nave 2',
            'Nave 3',
            'Nave 4',
            'Nave 5',
            'Nave 6',
            'Nave 7',
        ];

        foreach ($naves as $nave) {
            Naves::updateOrCreate(['nave' => $nave]);
        }
    }
}
