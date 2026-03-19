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
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->enum('estado_aprobacion', ['pendiente', 'activo', 'inactivo'])->default('pendiente')->after('descripcion');
        });

        Schema::table('equipos', function (Blueprint $table) {
            $table->enum('estado_aprobacion', ['pendiente', 'activo', 'inactivo'])->default('pendiente')->after('id_sistema_operativo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->dropColumn('estado_aprobacion');
        });

        Schema::table('equipos', function (Blueprint $table) {
            $table->dropColumn('estado_aprobacion');
        });
    }
};
