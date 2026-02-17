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
            if (!Schema::hasColumn('planes_licencia', 'periodo_facturacion')) {
                $table->string('periodo_facturacion')->default('monthly')->after('nombre_plan');
            }
            if (!Schema::hasColumn('planes_licencia', 'descripcion')) {
                $table->text('descripcion')->nullable()->after('caracteristicas');
            }
            if (!Schema::hasColumn('planes_licencia', 'estado')) {
                $table->string('estado')->default('active')->after('precio_plan');
            }
            
            if (Schema::hasColumn('planes_licencia', 'duracion_plan')) {
                // Changing duration from date to integer (months)
                // It's safe to drop and recreate since the table is empty
                 try {
                    $table->dropColumn('duracion_plan');
                } catch (\Exception $e) {
                    // Ignore if it fails (e.g. if it's already an integer) or handle differently
                }
            }
        });

        Schema::table('planes_licencia', function (Blueprint $table) {
            if (!Schema::hasColumn('planes_licencia', 'duracion_plan')) {
                $table->integer('duracion_plan')->default(12)->after('descripcion');
            }
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
