<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Using raw SQL to avoid type-mismatch issues with the FK on usuarios.doc.
        // The usuarios.doc column may be defined differently across installations,
        // so we skip the FK on id_usuario and rely on application-level referential integrity.
        DB::statement("
            CREATE TABLE IF NOT EXISTS area_usuario (
                id_area    BIGINT UNSIGNED NOT NULL,
                id_usuario INT UNSIGNED    NOT NULL,
                PRIMARY KEY (id_area, id_usuario),
                CONSTRAINT fk_area_usuario_area
                    FOREIGN KEY (id_area)
                    REFERENCES areas(id)
                    ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS area_usuario');
    }
};
