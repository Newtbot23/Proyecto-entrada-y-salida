<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lotes', function (Blueprint $table) {
            $table->string('id_ambiente', 20)->nullable()->after('fecha_importacion');
            $table->foreign('id_ambiente')
                  ->references('numero_ambiente')
                  ->on('ambientes')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('lotes', function (Blueprint $table) {
            $table->dropForeign(['id_ambiente']);
            $table->dropColumn('id_ambiente');
        });
    }
};
