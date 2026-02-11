<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Admins;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
        public function run(): void
    {
        // Evita duplicados
        if (!Admins::where('correo', 'admin@correo.com')->exists()) {

            Admins::create([
                'doc' => '99999',
                'correo' => 'admin@gmail.com',
                'contrasena' => Hash::make('1234567'),
                'nombre' => 'Super Admin',
                'telefono' => '123456',
            ]);
        }
    }
    }

