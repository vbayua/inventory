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
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('batch_number')->unique();
            $table->date('manufacture_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamps();
            $table->index(['product_id', 'batch_number'], 'idx_product_batch');
        });

        Schema::table('stocks', function (Blueprint $table) {
            $table->foreignId('batch_id')->nullable()->after('product_id')->constrained('batches')->onDelete('set null');
        });

        Schema::table('stock_adjustments', function (Blueprint $table) {
            $table->foreignId('batch_id')->nullable()->after('product_id')->constrained('batches')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
