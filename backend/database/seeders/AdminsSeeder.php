<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Admins;
use Illuminate\Support\Facades\Hash;

class AdminsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin 1
        if (!Admins::where('correo', 'admin1@correo.com')->exists()) {
            Admins::create([
                'doc' => 1001,
                'nombre' => 'Juan Pérez',
                'telefono' => '+57 300 123 4567',
                'correo' => 'admin1@correo.com',
                'contrasena' => Hash::make('password123'),
            ]);
        }
    }
}
