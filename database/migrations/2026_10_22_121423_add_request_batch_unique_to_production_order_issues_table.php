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
        Schema::table('production_order_issues', function (Blueprint $table) {
            $table->unique(['request_uuid', 'batch_id'], 'poi_request_batch_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('production_order_issues', function (Blueprint $table) {
            $table->dropUnique('poi_request_batch_unique');
        });
    }
};
