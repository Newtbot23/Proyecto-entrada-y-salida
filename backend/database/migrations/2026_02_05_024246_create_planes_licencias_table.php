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
        Schema::create('planes_licencia', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_plan', 200);
            $table->string('caracteristicas', 1000);
            $table->integer('duracion_plan');
            $table->float('precio_plan');
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planes_licencia');
    }
};
