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
            if (!Schema::hasColumn('licencias_sistema', 'referencia_pago')) {
                // Add referencia_pago
                $table->string('referencia_pago')->nullable()->default(null)->after('id_entidad');
            }
        });

        // Update estado column ENUM safely
        // 1. Change to varchar to allow data migration
        DB::statement("ALTER TABLE licencias_sistema MODIFY COLUMN estado VARCHAR(50) DEFAULT 'pendiente'");
        
        // 2. Update existing values
        DB::table('licencias_sistema')->where('estado', 'activa')->update(['estado' => 'activo']);
        DB::table('licencias_sistema')->where('estado', 'vencida')->update(['estado' => 'expirado']);
        DB::table('licencias_sistema')->where('estado', 'suspendida')->update(['estado' => 'inactivo']);

        // 3. Apply new ENUM
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
