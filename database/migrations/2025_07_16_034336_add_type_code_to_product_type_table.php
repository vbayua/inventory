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
        Schema::table('product_types', function (Blueprint $table) {
            $table->string('type_code')->nullable()->after('prefix');
            $table->unique(['name', 'type_code'], 'unique_name_type_code');
            $table->index('type_code', 'index_type_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_types', function (Blueprint $table) {
            $table->dropUnique('unique_name_type_code');
            $table->dropIndex('index_type_code');
            $table->dropColumn('type_code');
        });
    }
};
