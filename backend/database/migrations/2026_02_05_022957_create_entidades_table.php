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
        Schema::create('entidades', function (Blueprint $table) {
            $table->string('nit', 15)->primary();
            $table->string('nombre_entidad', 200);
            $table->string('correo', 200);
            $table->string('direccion', 200);
            $table->string('nombre_titular', 100);
            $table->string('telefono', 15);
            $table->enum('estado', ['activo', 'pendiente','inactivo'])->default('pendiente');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entidades');
    }
};
