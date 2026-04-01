<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Pasos:
     * 1. Agregar columna nullable id_marca a vehiculos
     * 2. Migrar datos: extraer combinaciones únicas de (marca_texto, id_tipo_vehiculo),
     *    limpiarlas e insertarlas en marcas_vehiculo
     * 3. Actualizar id_marca en vehiculos basándose en la coincidencia del texto
     * 4. Hacer id_marca NOT NULL y agregar FK
     * 5. Eliminar la columna vieja marca (texto)
     */
    public function up(): void
    {
        // PASO 1: Agregar id_marca nullable
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->unsignedBigInteger('id_marca')->nullable()->after('id_tipo_vehiculo');
        });

        // PASO 2: Migrar datos — extraer combos únicos y poblar marcas_vehiculo
        $combos = DB::table('vehiculos')
            ->select('marca', 'id_tipo_vehiculo')
            ->whereNotNull('marca')
            ->where('marca', '!=', '')
            ->distinct()
            ->get();

        foreach ($combos as $combo) {
            $nombreLimpio = ucwords(strtolower(trim($combo->marca)));

            // Evitar duplicados si ya existe el mismo nombre para el mismo tipo
            $existe = DB::table('marcas_vehiculo')
                ->where('nombre', $nombreLimpio)
                ->where('id_tipo_vehiculo', $combo->id_tipo_vehiculo)
                ->exists();

            if (!$existe) {
                DB::table('marcas_vehiculo')->insert([
                    'nombre'           => $nombreLimpio,
                    'id_tipo_vehiculo' => $combo->id_tipo_vehiculo,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            }
        }

        // PASO 3: Actualizar id_marca en vehiculos
        $marcas = DB::table('marcas_vehiculo')->get();

        foreach ($marcas as $marca) {
            DB::table('vehiculos')
                ->whereRaw('LOWER(TRIM(marca)) = ?', [strtolower(trim($marca->nombre))])
                ->where('id_tipo_vehiculo', $marca->id_tipo_vehiculo)
                ->update(['id_marca' => $marca->id]);
        }

        // PASO 4: Hacer id_marca NOT NULL y agregar FK
        Schema::table('vehiculos', function (Blueprint $table) {
            // Primero cambiar a NOT NULL
            $table->unsignedBigInteger('id_marca')->nullable(false)->change();
            // Agregar FK
            $table->foreign('id_marca')
                  ->references('id')
                  ->on('marcas_vehiculo')
                  ->onDelete('restrict');
        });

        // PASO 5: Eliminar la columna de texto 'marca'
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->dropColumn('marca');
        });
    }

    /**
     * Reverse the migrations.
     *
     * Recrea el campo varchar marca y rellena con el nombre de la marca relacionada.
     */
    public function down(): void
    {
        // PASO A: Restaurar columna marca como varchar nullable primero
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->string('marca', 100)->nullable()->after('id_tipo_vehiculo');
        });

        // PASO B: Rellenar marca a partir de marcas_vehiculo
        DB::statement('
            UPDATE vehiculos v
            JOIN marcas_vehiculo mv ON v.id_marca = mv.id
            SET v.marca = mv.nombre
        ');

        // PASO C: Hacer marca NOT NULL
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->string('marca', 100)->nullable(false)->change();
        });

        // PASO D: Eliminar FK y columna id_marca
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->dropForeign(['id_marca']);
            $table->dropColumn('id_marca');
        });
    }
};
