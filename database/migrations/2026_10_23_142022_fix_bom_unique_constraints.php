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
        Schema::table('boms', function (Blueprint $table) {
            $table->unique(['product_id', 'version'], 'boms_product_version_unique');
            $table->dropUnique(['product_id']);
        });

        Schema::table('bom_lines', function (Blueprint $table) {
            $table->unique(['bom_id', 'component_product_id'], 'bom_lines_bom_component_unique');
            $table->dropUnique(['component_product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bom_lines', function (Blueprint $table) {
            $table->unique(['component_product_id']);
            $table->dropUnique('bom_lines_bom_component_unique');
        });

        Schema::table('boms', function (Blueprint $table) {
            $table->unique(['product_id']);
            $table->dropUnique('boms_product_version_unique');
        });
    }
};
