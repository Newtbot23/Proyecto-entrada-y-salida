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
        Schema::create('marcas_vehiculo', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->foreignId('id_tipo_vehiculo')->constrained('tipos_vehiculo')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marcas_vehiculo');
    }
};
