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
        Schema::create('vehiculos', function (Blueprint $table) {
            $table->string('placa', 10)->primary();
            $table->foreignId('id_tipo_vehiculo')->constrained('tipos_vehiculo');
            $table->Integer('doc')->index();
            $table->string('marca', 100);
            $table->string('modelo', 100);
            $table->string('color', 50);
            $table->text('descripcion');
            $table->foreign('doc')->references('doc')->on('usuarios');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehiculos');
    }
};
