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
        Schema::table('asignaciones', function (Blueprint $table) {
            // Check if column exists before dropping to avoid errors if already modified
            if (Schema::hasColumn('asignaciones', 'estado')) {
                $table->dropColumn('estado');
            }
        });

        Schema::table('asignaciones', function (Blueprint $table) {
            $table->enum('estado', ['activo', 'inactivo'])->default('activo')->after('numero_ambiente');
            $table->string('codigo_asignacion')->nullable()->after('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asignaciones', function (Blueprint $table) {
            $table->dropColumn(['estado', 'codigo_asignacion']);
        });

        Schema::table('asignaciones', function (Blueprint $table) {
            $table->boolean('estado')->default(true)->after('numero_ambiente');
        });
    }
};
