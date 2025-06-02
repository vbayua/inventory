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
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('location_id')->constrained('locations')->onDelete('cascade');
            $table->foreignId('batch_id')->nullable()->constrained('batches')->onDelete('set null');
            $table->decimal('quantity', 10, 2)->default(0);
            $table->string('unit')->default('pcs'); // Assuming 'pcs' as the default unit
            $table->decimal('container_capacity', 10, 2)->nullable(); // Optional field for container capacity
            $table->string('container_unit')->nullable(); // Optional field for container unit
            $table->enum('status', ['available', 'reserved', 'expired'])->default('available');
            $table->string('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
