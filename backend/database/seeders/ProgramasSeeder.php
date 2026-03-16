<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Programas;

class ProgramasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programas = [
            ['id' => '122115-1', 'programa' => 'GESTIÓN ADMINISTRATIVA'],
            ['id' => '122119-1', 'programa' => 'GESTIÓN DOCUMENTAL'],
            ['id' => '122120-1', 'programa' => 'GESTIÓN EMPRESARIAL'],
            ['id' => '122121-1', 'programa' => 'GESTIÓN DE LA PROPIEDAD HORIZONTAL'],
            ['id' => '122122-1', 'programa' => 'GESTIÓN COMERCIAL'],
            ['id' => '134500-1', 'programa' => 'SERVICIOS POSTALES Y TRANSPORTE DE MERCANCÍAS'],
            ['id' => '210101053-1', 'programa' => 'GESTIÓN DEL TALENTO HUMANO'],
            ['id' => '210101062-1', 'programa' => 'COORDINACIÓN DE PROCESOS LOGÍSTICOS'],
            ['id' => '210101066-1', 'programa' => 'GESTIÓN INTEGRAL DEL TRANSPORTE'],
            ['id' => '210101075-1', 'programa' => 'GESTIÓN DE MERCADOS'],
            ['id' => '225101-1', 'programa' => 'GESTIÓN DE LA SEGURIDAD Y SALUD EN EL TRABAJO'],
            ['id' => '228101-1', 'programa' => 'ANÁLISIS Y DESARROLLO DE SISTEMAS DE INFORMACIÓN'],
            ['id' => '228106-1', 'programa' => 'ANÁLISIS Y DESARROLLO DE SOFTWARE'],
            ['id' => '331110-1', 'programa' => 'CONTROL DE LA SEGURIDAD DIGITAL'],
            ['id' => '413115-1', 'programa' => 'ACTIVIDADES LÚDICAS Y RECREATIVAS'],
            ['id' => '413117-1', 'programa' => 'ENTRENAMIENTO DEPORTIVO'],
            ['id' => '524105-1', 'programa' => 'PRODUCCIÓN DE MULTIMEDIA'],
            ['id' => '524110-1', 'programa' => 'DESARROLLO DE COLECCIONES PARA LA INDUSTRIA DE LA MODA'],
            ['id' => '524301-1', 'programa' => 'COMUNICACIÓN COMERCIAL'],
            ['id' => '621113-1', 'programa' => 'GESTIÓN DE PROYECTOS DESARROLLADOS CON METODOLOGÍA BIM'],
            ['id' => '635600-1', 'programa' => 'CONSTRUCCIÓN DE EDIFICACIONES'],
            ['id' => '723119-1', 'programa' => 'MANTENIMIENTO MECATRÓNICO DE AUTOMOTORES'],
            ['id' => '733116-1', 'programa' => 'MANTENIMIENTO DE EQUIPOS DE CÓMPUTO'],
            ['id' => '821215-1', 'programa' => 'GESTIÓN DE LA PRODUCCIÓN AGRÍCOLA'],
            ['id' => '821222-1', 'programa' => 'AGROBIOTECNOLOGÍA VEGETAL'],
            ['id' => '821609-1', 'programa' => 'GESTIÓN DE EMPRESAS AGROPECUARIAS'],
            ['id' => '921206-1', 'programa' => 'PROCESAMIENTO DE ALIMENTOS'],
            ['id' => '935102-1', 'programa' => 'CONTROL DE CALIDAD EN LA INDUSTRIA DE ALIMENTOS'],
            ['id' => '936104-1', 'programa' => 'GESTIÓN PARA ESTABLECIMIENTOS DE ALIMENTOS Y BEBIDAS'],
            ['id' => '936111-1', 'programa' => 'GUÍANZA TURÍSTICA'],
        ];

        foreach ($programas as $programa) {
            Programas::updateOrCreate(['id' => $programa['id']], ['programa' => $programa['programa']]);
        }
    }
}
