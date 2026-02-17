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
        Schema::create('detalle_ficha_usuarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_ficha')->constrained('fichas');
            $table->integer('doc');
            $table->enum('tipo_participante', ['aprendiz', 'instructor']);
            $table->foreign('doc')->references('doc')->on('usuarios');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_ficha_usuarios');
    }
};
