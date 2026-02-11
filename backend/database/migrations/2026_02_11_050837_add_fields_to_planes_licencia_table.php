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
            $table->string('estado')->default('active')->after('precio_plan');
            
            // Changing duration from date to integer (months)
            // It's safe to drop and recreate since the table is empty
            $table->dropColumn('duracion_plan');
        });

        Schema::table('planes_licencia', function (Blueprint $table) {
            $table->integer('duracion_plan')->default(12)->after('descripcion');
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
