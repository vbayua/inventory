<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Old statuses: available, reserved, expired, out_of_stock, low_stock
     * New statuses: pending, checking, pass, reject, reserved
     *
     * Mapping:
     *   available    → pass
     *   out_of_stock → pending
     *   low_stock    → pass
     *   expired      → reject
     *   reserved     → reserved (unchanged)
     */
    public function up(): void
    {
        // Step 1: Migrate existing data to new status values.
        // SQLite stores enum as plain string, so UPDATE works fine.
        DB::statement("
            UPDATE stocks
            SET status = CASE
                WHEN status = 'available'    THEN 'pass'
                WHEN status = 'out_of_stock' THEN 'pending'
                WHEN status = 'low_stock'    THEN 'pass'
                WHEN status = 'expired'      THEN 'reject'
                ELSE status
            END
        ");

        // Step 2: Change the column definition to a plain string with the new default.
        // Using string() instead of enum() for full SQLite compatibility.
        Schema::table('stocks', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * Best-effort rollback: maps new statuses back to old ones.
     * Data that had no exact reverse mapping defaults to 'available'.
     */
    public function down(): void
    {
        DB::statement("
            UPDATE stocks
            SET status = CASE
                WHEN status = 'pass'     THEN 'available'
                WHEN status = 'pending'  THEN 'out_of_stock'
                WHEN status = 'reject'   THEN 'expired'
                WHEN status = 'checking' THEN 'available'
                ELSE status
            END
        ");

        Schema::table('stocks', function (Blueprint $table) {
            $table->string('status')->default('available')->change();
        });
    }
};
