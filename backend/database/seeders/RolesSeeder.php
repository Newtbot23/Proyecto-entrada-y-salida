<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RolesSeeder extends Seeder
{
    /**
     * Seed the application's database with roles.
     * These roles define user access levels within the system.
     */
    public function run(): void
    {
        $roles = [
            'admin',           // System administrator with full access
            'user',            // Regular user
            'puerta_personas', // Specialized role for person access control
            'puerta_vehiculos' // Specialized role for vehicle access control
        ];

        foreach ($roles as $rol) {
            // firstOrCreate ensures we don't duplicate records if the seeder is run multiple times
            DB::table('roles')->updateOrInsert(
                ['rol' => $rol],
                [
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now()
                ]
            );
        }
    }
}
