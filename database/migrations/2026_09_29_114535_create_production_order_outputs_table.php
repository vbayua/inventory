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
        Schema::create('production_order_outputs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('production_order_id');
            $table->foreignId('batch_id')->unique();
            $table->string('output_type')->default('primary'); // primary, byproduct, waste
            $table->decimal('quantity', 10, 2);
            $table->decimal('cost', 18, 2)->nullable();
            $table->foreignId('operation_id');
            $table->timestamp('produced_at')->nullable();
            $table->foreignId('user_id');
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_order_outputs');
    }
};
