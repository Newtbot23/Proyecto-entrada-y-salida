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
        Schema::table('equipos', function (Blueprint $col) {
            $col->unsignedBigInteger('id_lote')->nullable()->after('lote_importacion');
            $col->foreign('id_lote')->references('id')->on('lotes')->onDelete('set null');
        });

        // Optional: Data migration from old column if needed
        // Assuming old names could be used to seed the new Lote table, but keeping it simple for now.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipos', function (Blueprint $col) {
            $col->dropForeign(['id_lote']);
            $col->dropColumn('id_lote');
        });
    }
};
