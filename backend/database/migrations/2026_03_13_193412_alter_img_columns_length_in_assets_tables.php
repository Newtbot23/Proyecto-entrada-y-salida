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
            $table->string('img_vehiculo', 1000)->nullable()->change();
        });

        Schema::table('equipos', function (Blueprint $table) {
            $table->string('img_serial', 1000)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->string('img_vehiculo', 255)->nullable()->change();
        });

        Schema::table('equipos', function (Blueprint $table) {
            $table->string('img_serial', 255)->nullable()->change();
        });
    }
};
