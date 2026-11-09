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
        Schema::create('production_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('product_id'); // FG
            $table->foreignId('bom_id')->onDelete('cascade');
            $table->foreignId('location_id')->nullable();
            $table->integer('target_quantity');
            $table->string('status');
            $table->decimal('produced_quantity', 10, 2)->nullable();
            $table->foreignId('user_id')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->foreignId('released_by')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->foreignId('started_by')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('completed_by')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable();
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->text('notes')->nullable();
            $table->text('variance_notes')->nullable();
            $table->text('cancel_note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_orders');
    }
};
