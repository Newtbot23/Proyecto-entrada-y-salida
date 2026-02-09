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
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_tip_doc')
            ->constrained('tipo_doc', 'id_tip_doc');
            $table->string('doc', 20)->unique();
            $table->string('primer_nombre', 50);
            $table->string('segundo_nombre', 50)->nullable();
            $table->string('primer_apellido', 50);
            $table->string('segundo_apellido', 50)->nullable();
            $table->string('telefono', 13);
            $table->string('correo', 100)->unique();
            $table->string('imagen', 300)->nullable();
            $table->string('codigo_qr', 300)->nullable();
            $table->string('contrasena', 300);
            $table->foreignId('id_rol')->constrained('roles');
            $table->foreignId('id_entidad')->constrained('entidades');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
