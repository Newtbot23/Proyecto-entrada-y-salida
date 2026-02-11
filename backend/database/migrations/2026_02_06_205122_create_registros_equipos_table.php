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
        Schema::create('registros_equipos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_equipo')->constrained('equipos');
            $table->string('doc', 20);
            $table->date('fecha');
            $table->text('observacion');
            $table->foreign('doc')->references('doc')->on('usuarios');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registros_equipos');
    }
};
