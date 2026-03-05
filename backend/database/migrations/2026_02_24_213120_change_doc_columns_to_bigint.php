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
        // Drop foreign keys
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->dropForeign(['doc']);
        });
        Schema::table('registros', function (Blueprint $table) {
            $table->dropForeign(['doc']);
        });
        Schema::table('registros_equipos', function (Blueprint $table) {
            $table->dropForeign(['doc']);
        });
        Schema::table('asignaciones', function (Blueprint $table) {
            $table->dropForeign(['doc']);
        });
        Schema::table('detalle_ficha_usuarios', function (Blueprint $table) {
            $table->dropForeign(['doc']);
        });

        // Change types
        Schema::table('admins', function (Blueprint $table) {
            $table->bigInteger('doc')->change();
        });
        Schema::table('usuarios', function (Blueprint $table) {
            $table->bigInteger('doc')->change();
        });
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->bigInteger('doc')->change();
        });
        Schema::table('registros', function (Blueprint $table) {
            $table->bigInteger('doc')->change();
        });
        Schema::table('registros_equipos', function (Blueprint $table) {
            $table->bigInteger('doc')->change();
        });
        Schema::table('asignaciones', function (Blueprint $table) {
            $table->bigInteger('doc')->change();
        });
        Schema::table('detalle_ficha_usuarios', function (Blueprint $table) {
            $table->bigInteger('doc')->change();
        });

        // Recreate foreign keys
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->foreign('doc')->references('doc')->on('usuarios');
        });
        Schema::table('registros', function (Blueprint $table) {
            $table->foreign('doc')->references('doc')->on('usuarios')->onDelete('cascade');
        });
        Schema::table('registros_equipos', function (Blueprint $table) {
            $table->foreign('doc')->references('doc')->on('usuarios')->onDelete('cascade');
        });
        Schema::table('asignaciones', function (Blueprint $table) {
            $table->foreign('doc')->references('doc')->on('usuarios');
        });
        Schema::table('detalle_ficha_usuarios', function (Blueprint $table) {
            $table->foreign('doc')->references('doc')->on('usuarios');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse operations here (not fully implemented for brevity)
        // Would involve changing back to integer.
    }
};
