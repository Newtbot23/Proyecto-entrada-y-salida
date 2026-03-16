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
        // 1. Crear la tabla old_passwords
        Schema::create('old_passwords', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('usuario_doc'); // Relación con usuarios.doc
            $table->string('password');       // Hash de la contraseña vieja
            $table->timestamps();

            // Definir llave foránea
            $table->foreign('usuario_doc')
                  ->references('doc')
                  ->on('usuarios')
                  ->onDelete('cascade');
        });

        // 2. Crear el Trigger
        // Nota: El campo en la tabla 'usuarios' es 'contrasena'
        DB::unprepared("
            CREATE TRIGGER trg_respaldo_password
            AFTER UPDATE ON usuarios
            FOR EACH ROW
            BEGIN
                IF OLD.contrasena <> NEW.contrasena THEN
                    INSERT INTO old_passwords (usuario_doc, password, created_at, updated_at)
                    VALUES (OLD.doc, OLD.contrasena, NOW(), NOW());
                END IF;
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Eliminar el trigger primero
        DB::unprepared("DROP TRIGGER IF EXISTS trg_respaldo_password");

        // 2. Eliminar la tabla
        Schema::dropIfExists('old_passwords');
    }
};
