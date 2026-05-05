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
        Schema::table('qc_inspections', function (Blueprint $table) {
            $table->foreignId('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('qc_inspections', function (Blueprint $table) {
            $table->dropForeignId('approved_by');
            $table->dropColumn('approved_at');
        });
    }
};
