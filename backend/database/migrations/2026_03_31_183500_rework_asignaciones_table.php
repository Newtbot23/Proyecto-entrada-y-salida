<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Recreamos la tabla asignaciones para el nuevo flujo
        Schema::dropIfExists('asignaciones');

        Schema::create('asignaciones', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('doc');
            $table->string('serial_equipo', 100);
            $table->unsignedBigInteger('id_ficha');
            $table->unsignedBigInteger('id_lote');
            $table->enum('estado', ['EN_USO', 'DEVUELTO', 'MANTENIMIENTO', 'EXTRAVIADO'])->default('EN_USO');
            $table->string('codigo_asignacion')->nullable();
            
            // Columna virtual para garantizar que un equipo no esté 'EN_USO' más de una vez
            // Si el estado es 'EN_USO', esta columna toma el serial. Si no, es NULL.
            // Los índices UNIQUE en base de datos ignoran los valores NULL.
            $table->string('serial_en_uso')->virtualAs("IF(estado = 'EN_USO', serial_equipo, NULL)")->nullable();
            $table->unique('serial_en_uso');

            $table->foreign('doc')->references('doc')->on('usuarios');
            $table->foreign('serial_equipo')->references('serial')->on('equipos');
            $table->foreign('id_ficha')->references('id')->on('fichas');
            $table->foreign('id_lote')->references('id')->on('lotes');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asignaciones');
    }
};
