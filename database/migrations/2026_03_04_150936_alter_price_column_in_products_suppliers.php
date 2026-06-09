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
        Schema::table('products_suppliers', function (Blueprint $table) {
            $table->decimal('price', 15, 0)->change(); // Change price to decimal(15,4)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products_suppliers', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->change(); // Revert price to decimal(10,2)
        });
    }
};
