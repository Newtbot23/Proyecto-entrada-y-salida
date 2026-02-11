<?php

namespace Database\Seeders;

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
        Admins::create([
            'doc' => 123456789,
            'nombre' => 'Super Administrador',
            'telefono' => '3001234567',
            'correo' => 'admin@example.com',
            'contrasena' => Hash::make('admin123'),
        ]);
    }
}
