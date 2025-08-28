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
        Schema::table('product_types', function (Blueprint $table) {
            $table->unsignedInteger('batch_interval_days')->default(0)->after('type_code');
        });

        // Backfill default intervals
        \Illuminate\Support\Facades\DB::table('product_types')
            ->where('type_code', 'RMP')
            ->update(['batch_interval_days' => 90]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_types', function (Blueprint $table) {
            $table->dropColumn('batch_interval_days');
        });
    }
};
