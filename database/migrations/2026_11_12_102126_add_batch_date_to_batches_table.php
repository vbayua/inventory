<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add the operation date a batch was opened on, backfilled from the
     * earlier of its first operation and its creation date. Imported batches
     * carry their real creation date but an opening-stock operation dated at
     * import time, so the first operation alone is not reliable.
     */
    public function up(): void
    {
        Schema::table('batches', function (Blueprint $table) {
            $table->date('batch_date')->nullable()->after('batch_number');
        });

        $firstOperationDates = DB::table('operations')
            ->whereNotNull('batch_id')
            ->groupBy('batch_id')
            ->pluck(DB::raw('MIN(operation_date)'), 'batch_id');

        DB::table('batches')
            ->select(['id', 'created_at'])
            ->orderBy('id')
            ->each(function (object $batch) use ($firstOperationDates): void {
                $openedOn = collect([$firstOperationDates[$batch->id] ?? null, $batch->created_at])
                    ->filter()
                    ->map(fn (string $date): Carbon => Carbon::parse($date))
                    ->min();

                if ($openedOn !== null) {
                    DB::table('batches')
                        ->where('id', $batch->id)
                        ->update(['batch_date' => $openedOn->toDateString()]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('batches', function (Blueprint $table) {
            $table->dropColumn('batch_date');
        });
    }
};
