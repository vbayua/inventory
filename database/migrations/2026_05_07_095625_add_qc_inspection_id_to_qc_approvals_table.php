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
        Schema::table('qc_approvals', function (Blueprint $table) {
            $table->foreignId('qc_inspection_id')->constrained('qc_inspections')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('qc_approvals', function (Blueprint $table) {
            $table->dropForeign(['qc_inspection_id']);
            $table->dropColumn('qc_inspection_id');
        });
    }
};
