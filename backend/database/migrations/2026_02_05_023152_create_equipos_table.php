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
        Schema::create('equipos', function (Blueprint $table) {
            $table->string('serial', 100)->primary();
            $table->enum('tipo_equipo', ['sena', 'propio']);
            $table->string('placa_sena', 50);
            $table->foreignId('id_marca')->constrained('marcas_equipo');
            $table->enum('estado', ['asignado', 'no_asignado', 'inhabilitado']);
            $table->string('modelo', 100);
            $table->string('tipo_equipo_desc', 200);
            $table->text('caracteristicas');
            $table->foreignId('id_sistema_operativo')->constrained('sistemas_operativos');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipos');
    }
};
