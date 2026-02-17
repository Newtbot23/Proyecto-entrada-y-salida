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
        Schema::create('fichas', function (Blueprint $table) {
            $table->id();
            $table->integer('numero_ficha')->unique();
            $table->foreignId('id_programa')->constrained('programas');
            $table->string('numero_ambiente', 20);
            $table->foreignId('id_jornada')->constrained('jornadas');
            $table->foreign('numero_ambiente')->references('numero_ambiente')->on('ambientes');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fichas');
    }
};
