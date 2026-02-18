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
        Schema::create('pagos_licencia', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            
            $table->id();
            $table->string('id_licencia', 25);
            $table->foreign('id_licencia', 'fk_pagos_lic_sis_id')->references('id')->on('licencias_sistema');
            $table->dateTime('fecha_pago');
            $table->enum('metodo_pago', ['efectivo', 'transferencia', 'tarjeta']);
            $table->string('referencia', 100)->nullable();
            $table->decimal('monto', 10, 2);
            $table->string('stripe_session_id')->nullable();
            $table->enum('estado', ['pagado', 'pendiente', 'anulado']);
            $table->dateTime('creado_en');
            $table->timestamps();
            $table->enum('tipo_pago', ['compra', 'renovacion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagos_licencia');
    }
};
