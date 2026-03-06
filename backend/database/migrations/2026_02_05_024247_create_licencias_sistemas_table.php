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
        Schema::create('licencias_sistema', function (Blueprint $table) {
            $table->string('id', 25)->primary();
            $table->date('fecha_inicio');
            $table->date('fecha_vencimiento');
            $table->enum('estado', ['activa', 'suspendida', 'vencida', 'pendiente'])->default('pendiente');
            $table->dateTime('fecha_ultima_validacion');
            $table->foreignId('id_plan_lic')->constrained('planes_licencia');
            $table->string('nit_entidad', 15);
            $table->foreign('nit_entidad')->references('nit')->on('entidades');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('licencias_sistema');
    }
};
