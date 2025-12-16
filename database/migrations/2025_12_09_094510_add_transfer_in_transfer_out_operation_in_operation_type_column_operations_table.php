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
        Schema::table('operations', function (Blueprint $table) {
            $table->enum('operation_type', ['initial', 'inbound', 'outbound', 'transfer_in', 'transfer_out', 'adjustment'])->default('inbound')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            $table->enum('operation_type', ['initial', 'inbound', 'outbound', 'transfer', 'adjustment'])->default('inbound')->change();
        });
    }
};
