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
        Schema::table('usuarios', function (Blueprint $table) {
            // Drop foreign key and column id_entidad
            $table->dropForeign(['id_entidad']);
            $table->dropColumn('id_entidad');

            // Add foreign key id_licencia_sistema
            // We use nullable() temporarily if there are existing users, 
            // but since this is a refactor and we'll probably clear data or handle it, 
            // let's follow the requirement.
            $table->foreignId('id_licencia_sistema')->nullable()->after('id_tip_doc')
                ->constrained('licencias_sistema');
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropForeign(['id_licencia_sistema']);
            $table->dropColumn('id_licencia_sistema');

            $table->foreignId('id_entidad')->nullable()->after('id_tip_doc')
                ->constrained('entidades');
        });
    }
};
