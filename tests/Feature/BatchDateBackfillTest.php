<?php

use App\Models\Batch;
use App\Models\Location;
use App\Models\Operation;
use Database\Seeders\BlankStateSeeder;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);
    $this->migration = require database_path('migrations/2026_11_12_102126_add_batch_date_to_batches_table.php');
    $this->batchCreatedOn = function (string $createdAt, ?string $firstOperationDate = null): Batch {
        $batch = Batch::factory()->create();
        DB::table('batches')->where('id', $batch->id)->update(['created_at' => $createdAt]);

        if ($firstOperationDate !== null) {
            Operation::factory()->create([
                'product_id' => $batch->product_id,
                'batch_id' => $batch->id,
                'location_id' => Location::factory()->create()->id,
                'operation_type' => 'initial',
                'unit' => 'pcs',
                'quantity' => 1,
                'operation_date' => $firstOperationDate,
            ]);
        }

        return $batch;
    };
});

it('backfills the batch date from the earlier of the first operation and the creation date', function () {
    $importedBatch = ($this->batchCreatedOn)('2026-07-24 10:00:00', '2026-11-11 08:23:47');
    $backdatedBatch = ($this->batchCreatedOn)('2026-11-12 09:00:00', '2026-11-01 09:00:00');
    $batchWithoutOperations = ($this->batchCreatedOn)('2026-10-20 10:00:00');

    $this->migration->down();
    $this->migration->up();

    expect(DB::table('batches')->pluck('batch_date', 'id')->all())->toMatchArray([
        $importedBatch->id => '2026-07-24',
        $backdatedBatch->id => '2026-11-01',
        $batchWithoutOperations->id => '2026-10-20',
    ]);
});
