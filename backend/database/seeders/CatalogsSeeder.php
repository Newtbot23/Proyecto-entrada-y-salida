<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CatalogsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tipos de Vehículo
        $tiposVehiculo = [
            ['tipo_vehiculo' => 'Carro'],
            ['tipo_vehiculo' => 'Moto'],
            ['tipo_vehiculo' => 'Bicicleta'],
            ['tipo_vehiculo' => 'Camión'],
        ];
        foreach ($tiposVehiculo as $tipo) {
            DB::table('tipos_vehiculo')->updateOrInsert(['tipo_vehiculo' => $tipo['tipo_vehiculo']], $tipo);
        }

        // Marcas de Equipo
        $marcas = [
            ['marca' => 'HP'],
            ['marca' => 'Dell'],
            ['marca' => 'Lenovo'],
            ['marca' => 'Apple'],
            ['marca' => 'Asus'],
            ['marca' => 'Acer'],
        ];
        foreach ($marcas as $marca) {
            DB::table('marcas_equipo')->updateOrInsert(['marca' => $marca['marca']], $marca);
        }

        // Sistemas Operativos
        $sos = [
            ['sistema_operativo' => 'Windows 10'],
            ['sistema_operativo' => 'Windows 11'],
            ['sistema_operativo' => 'Linux (Ubuntu)'],
            ['sistema_operativo' => 'macOS'],
            ['sistema_operativo' => 'ChromeOS'],
            ['sistema_operativo' => 'N/A'],
        ];
        foreach ($sos as $so) {
            DB::table('sistemas_operativos')->updateOrInsert(['sistema_operativo' => $so['sistema_operativo']], $so);
        }
    }
}
