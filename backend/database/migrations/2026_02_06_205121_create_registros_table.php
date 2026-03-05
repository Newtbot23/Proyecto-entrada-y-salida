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
        Schema::create('registros', function (Blueprint $table) {
    $table->id();

    $table->integer('doc')->index();  

    $table->string('serial_equipo', 100);

    $table->date('fecha');
    $table->time('hora_entrada');
    $table->time('hora_salida')->nullable();

    $table->foreign('doc')
          ->references('doc')
          ->on('usuarios')
          ->onDelete('cascade');

    $table->foreign('serial_equipo')
          ->references('serial')
          ->on('equipos')
          ->onDelete('cascade');

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registros');
    }
};
