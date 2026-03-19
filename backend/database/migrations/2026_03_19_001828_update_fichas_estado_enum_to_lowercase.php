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
        // 1. Change column definition to string temporary to avoid enum constraint errors during case change
        Schema::table('fichas', function (Blueprint $table) {
            $table->string('estado')->change();
        });

        // 2. Data Migration: Convert existing values to lowercase and 'Practica' to 'productiva'
        DB::table('fichas')->where('estado', 'Lectiva')->update(['estado' => 'lectiva']);
        DB::table('fichas')->where('estado', 'Practica')->update(['estado' => 'productiva']);
        DB::table('fichas')->where('estado', 'Finalizada')->update(['estado' => 'finalizada']);
        
        // Ensure all are lowercase just in case
        DB::statement("UPDATE fichas SET estado = LOWER(estado)");
        // Final fix for naming
        DB::table('fichas')->where('estado', 'practica')->update(['estado' => 'productiva']);

        // 3. Set back to enum with new values
        Schema::table('fichas', function (Blueprint $table) {
            $table->enum('estado', ['lectiva', 'productiva', 'finalizada'])->default('lectiva')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fichas', function (Blueprint $table) {
            $table->string('estado')->change();
        });

        DB::statement("UPDATE fichas SET estado = CASE 
            WHEN estado = 'lectiva' THEN 'Lectiva'
            WHEN estado = 'productiva' THEN 'Practica'
            WHEN estado = 'finalizada' THEN 'Finalizada'
            ELSE 'Lectiva'
        END");

        Schema::table('fichas', function (Blueprint $table) {
            $table->enum('estado', ['Lectiva', 'Practica', 'Finalizada'])->default('Lectiva')->change();
        });
    }
};

