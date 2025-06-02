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
        Schema::create('units', function (Blueprint $table) {
            $table->string('name')->primary();
            $table->decimal('conversion_to_base', 10, 2)->default(1.00); // Conversion factor to base unit
            $table->string('base_unit')->default('pcs'); // Default base unit
            $table->string('unit_type')->default('count'); // Type of unit (e.g., count, weight, volume)`
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
