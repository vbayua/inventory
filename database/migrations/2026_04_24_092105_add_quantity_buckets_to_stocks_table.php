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
        Schema::table('stocks', function (Blueprint $table) {
            $table->decimal('quantity', 15, 2)->default(0)->change();
            $table->decimal('minimum_quantity', 15, 2)->default(0)->change();
            $table->decimal('quantity_reserved', 15, 2)->default(0)->after('quantity');
            $table->decimal('quantity_on_hold', 15, 2)->default(0)->after('quantity_reserved');
            $table->decimal('quantity_rejected', 15, 2)->default(0)->after('quantity_on_hold');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropColumn(['quantity_reserved', 'quantity_on_hold', 'quantity_rejected']);
        });
    }
};
