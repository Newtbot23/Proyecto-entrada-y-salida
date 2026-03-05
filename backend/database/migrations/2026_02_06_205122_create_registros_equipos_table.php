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

    $table->string('serial_equipo', 100);

    $table->integer('doc')->index();   

    $table->date('fecha');
    $table->text('observacion');

    $table->foreign('serial_equipo')
          ->references('serial')
          ->on('equipos')
          ->onDelete('cascade');

    $table->foreign('doc')
          ->references('doc')
          ->on('usuarios')
          ->onDelete('cascade');

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
