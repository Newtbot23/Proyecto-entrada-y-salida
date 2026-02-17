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
        Schema::create('asignaciones', function (Blueprint $table) {
            $table->id();
            $table->integer('doc');
            $table->string('serial_equipo', 100);
            $table->string('numero_ambiente', 20);
            $table->boolean('estado');
            $table->foreign('doc')->references('doc')->on('usuarios');
            $table->foreign('serial_equipo')->references('serial')->on('equipos');
            $table->foreign('numero_ambiente')->references('numero_ambiente')->on('ambientes');
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
