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
        Schema::table('fichas', function (Blueprint $table) {
            $table->dropForeign(['id_programa']);
        });

        Schema::table('programas', function (Blueprint $table) {
            $table->string('id', 20)->change();
            $table->string('programa', 150)->change();
        });

        Schema::table('fichas', function (Blueprint $table) {
            $table->string('id_programa', 20)->change();
            $table->foreign('id_programa')->references('id')->on('programas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fichas', function (Blueprint $table) {
            $table->dropForeign(['id_programa']);
        });

        Schema::table('programas', function (Blueprint $table) {
            $table->bigIncrements('id')->change();
            $table->string('programa', 30)->change();
        });

        Schema::table('fichas', function (Blueprint $table) {
            $table->unsignedBigInteger('id_programa')->change();
            $table->foreign('id_programa')->references('id')->on('programas');
        });
    }
};
