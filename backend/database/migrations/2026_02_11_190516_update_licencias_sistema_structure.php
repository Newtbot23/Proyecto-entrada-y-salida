<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('licencias_sistema', function (Blueprint $table) {
            // Add referencia_pago
            $table->string('referencia_pago')->nullable()->default(null)->after('id_entidad');
        });

        // Update estado column ENUM
        DB::statement("ALTER TABLE licencias_sistema MODIFY COLUMN estado ENUM('activo', 'inactivo', 'expirado', 'pendiente') DEFAULT 'pendiente'");
    }

    public function down(): void
    {
        Schema::table('licencias_sistema', function (Blueprint $table) {
            $table->dropColumn('referencia_pago');
        });

        // Restore old ENUM values if needed
        DB::statement("ALTER TABLE licencias_sistema MODIFY COLUMN estado ENUM('activa', 'suspendida', 'vencida', 'pendiente') DEFAULT 'activa'");
    }
};
