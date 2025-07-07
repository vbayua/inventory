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
            $table->decimal('minimum_quantity', 10, 2)->default(0)->after('quantity');
            $table->enum('status', ['available', 'reserved', 'expired', 'out_of_stock', 'low_stock'])
                ->default('available')
                ->after('container_unit')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropColumn('minimum_quantity');
            $table->dropColumn('status');
        });
    }
};
