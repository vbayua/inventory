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
            $table->decimal('quantity', 15, 4)->change();
            $table->decimal('minimum_quantity', 15, 4)->default(0)->change();
        });

        Schema::table('operations', function (Blueprint $table) {
            $table->decimal('quantity', 15, 4)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->change();
            $table->decimal('minimum_quantity', 10, 2)->default(0)->change();
        });

        Schema::table('operations', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->change();
        });
    }
};
