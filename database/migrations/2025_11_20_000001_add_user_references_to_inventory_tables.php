<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('remarks')->constrained()->nullOnDelete();
        });

        Schema::table('stocks', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('remarks')->constrained()->nullOnDelete();
        });

        Schema::table('batches', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('expiry_date')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });

        Schema::table('stocks', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });

        Schema::table('batches', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
