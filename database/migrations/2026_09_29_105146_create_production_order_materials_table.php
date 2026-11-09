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
        Schema::create('production_order_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('production_order_id');
            $table->foreignId('component_product_id');
            $table->foreignId('location_id');
            $table->string('unit');
            $table->decimal('quantity_per_unit', 10, 2);
            $table->decimal('scrap_percentage', 5, 2)->default(0);
            $table->decimal('quantity_required', 10, 2);
            $table->decimal('quantity_issued', 10, 2)->default(0);
            $table->decimal('quantity_reserved')->default(0);
            $table->timestamps();

            $table->unique(['production_order_id', 'component_product_id'], 'pom_order_component_unique');
            $table->index(['component_product_id', 'location_id'], 'pom_component_location_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_order_materials');
    }
};
