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
        Schema::table('products', function (Blueprint $table) {
            $table->string('sku')->nullable()->after('name');
            $table->string('unit')->nullable()->after('sku');
            $table->decimal('price', 10, 2)->default(0.00)->after('unit');
            $table->integer('quantity')->default(0)->after('price');
            $table->boolean('is_active')->default(true)->after('quantity');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['sku', 'unit', 'price', 'quantity', 'is_active', 'deleted_at']);
            $table->dropSoftDeletes();
        });
    }
};
