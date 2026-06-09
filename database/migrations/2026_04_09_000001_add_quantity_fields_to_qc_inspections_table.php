<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('qc_inspections', function (Blueprint $table) {
            $table->integer('quantity_passed')->nullable()->after('rejection_reason');
            $table->integer('quantity_rejected')->nullable()->after('quantity_passed');
        });
    }

    public function down(): void
    {
        Schema::table('qc_inspections', function (Blueprint $table) {
            $table->dropColumn(['quantity_passed', 'quantity_rejected']);
        });
    }
};
