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
        Schema::create('production_order_issues', function (Blueprint $table) {
            $table->id();
            $table->uuid('request_uuid');
            $table->foreignId('production_order_id');
            $table->foreignId('production_order_material_id');
            $table->foreignId('batch_id');
            $table->string('type');
            $table->decimal('quantity', 10, 2);
            $table->foreignId('operation_id')->nullable();
            $table->boolean('is_override')->default(false);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['production_order_material_id', 'batch_id', 'operation_id'], 'poi_material_batch_operation_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_order_issues');
    }
};
