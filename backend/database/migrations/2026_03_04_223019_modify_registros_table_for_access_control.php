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
        Schema::table('registros', function (Blueprint $table) {
            $table->string('serial_equipo', 100)->nullable()->change();
            $table->string('placa', 10)->nullable()->after('serial_equipo');
            
            $table->foreign('placa')
                  ->references('placa')
                  ->on('vehiculos')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registros', function (Blueprint $table) {
            $table->string('serial_equipo', 100)->nullable(false)->change();
            $table->dropForeign(['placa']);
            $table->dropColumn('placa');
        });
    }
};
