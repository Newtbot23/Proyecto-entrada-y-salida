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
        Schema::table('planes_licencia', function (Blueprint $table) {
            $table->string('periodo_facturacion')->default('monthly')->after('nombre_plan');
            $table->text('descripcion')->nullable()->after('caracteristicas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('planes_licencia', function (Blueprint $table) {
            $table->dropColumn(['periodo_facturacion', 'descripcion', 'estado', 'duracion_plan']);
        });

        Schema::table('planes_licencia', function (Blueprint $table) {
            $table->date('duracion_plan')->after('caracteristicas');
        });
    }
};
