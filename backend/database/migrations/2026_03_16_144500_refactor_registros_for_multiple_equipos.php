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
        // 1. Alter 'registros' table: Remove serial_equipo
        Schema::table('registros', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['serial_equipo']);
            $table->dropColumn('serial_equipo');
        });

        // 2. Alter 'registros_equipos' table: Structural change
        Schema::table('registros_equipos', function (Blueprint $table) {
            // Drop redundant fields
            $table->dropForeign(['doc']);
            $table->dropColumn(['doc', 'fecha', 'observacion']);

            // Add relationship to registros
            $table->unsignedBigInteger('id_registro')->after('id');
            $table->foreign('id_registro')
                  ->references('id')
                  ->on('registros')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registros', function (Blueprint $table) {
            $table->string('serial_equipo', 100)->nullable()->after('doc');
            $table->foreign('serial_equipo')->references('serial')->on('equipos')->onDelete('cascade');
        });

        Schema::table('registros_equipos', function (Blueprint $table) {
            $table->dropForeign(['id_registro']);
            $table->dropColumn('id_registro');

            $table->integer('doc')->index();
            $table->date('fecha');
            $table->text('observacion');
            $table->foreign('doc')->references('doc')->on('usuarios')->onDelete('cascade');
        });
    }
};
