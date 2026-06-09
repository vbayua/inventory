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
            $table->unsignedBigInteger('approval_id')->nullable();
            $table->foreign('approval_id')->references('id')->on('qc_approvals');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('qc_inspections', function (Blueprint $table) {
            $table->dropForeign(['approval_id']);
            $table->dropColumn('approval_id');
        });
    }
};
