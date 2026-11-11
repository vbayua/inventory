<?php

namespace Database\Seeders;

use App\Models\Batch;
use App\Models\Location;
use App\Models\Operation;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Service\StockOperationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class StockImportSeeder extends Seeder
{
    public const DEFAULT_WAREHOUSE = 'Packaging Material Warehouse';

    /**
     * Import opening stock from a CSV whose IDs match the current database.
     *
     * Rows without a product_id only register the product. Rows without a
     * batch_id get a batch from their batch number, and rows without a
     * location_id get a location in the packaging warehouse. Rows sharing a
     * product, batch and location are summed. Existing stock is left untouched.
     */
    public function run(?string $csvPath = null): void
    {
        $rows = $this->readRows($csvPath ?? database_path('seeders/data/stock_import.csv'));

        DB::transaction(function () use ($rows) {
            [$newProducts, $stockRows] = $rows->partition(fn (array $row) => $row['product_id'] === '');

            $newProducts->each(fn (array $row) => $this->registerProduct($row));

            $stockRows
                ->map(fn (array $row) => $this->resolveRow($row))
                ->groupBy(fn (array $row) => "{$row['product_id']}|{$row['batch_id']}|{$row['location_id']}")
                ->each(fn (Collection $group) => $this->seedStock($group->first(), (float) $group->sum('quantity')));
        });
    }

    /**
     * @param  array<string, string>  $row
     */
    private function registerProduct(array $row): void
    {
        Product::firstOrCreate(
            ['sku' => $row['sku']],
            ['name' => $row['name'], 'unit' => 'pcs', 'product_type_id' => $row['product_type_id']],
        );
    }

    /**
     * Fill the batch and location IDs of a stock row, creating them when missing.
     *
     * @param  array<string, string>  $row
     * @return array<string, mixed>
     */
    private function resolveRow(array $row): array
    {
        Product::findOrFail($row['product_id']);
        Supplier::findOrFail($row['supplier_id']);

        $batch = $row['batch_id'] === ''
            ? Batch::firstOrCreate(
                ['batch_number' => $row['batch_number']],
                ['product_id' => $row['product_id'], 'supplier_id' => $row['supplier_id'], 'user_id' => $row['user_id']],
            )
            : Batch::findOrFail($row['batch_id']);

        if ((string) $batch->product_id !== $row['product_id']) {
            throw new RuntimeException("Batch {$batch->batch_number} belongs to product {$batch->product_id}, not {$row['product_id']}.");
        }

        if ($batch->batch_number !== $row['batch_number']) {
            $batch->update(['batch_number' => $row['batch_number']]);
        }

        $location = $row['location_id'] === ''
            ? Location::firstOrCreate(
                ['name' => $row['location']],
                ['warehouse_id' => Warehouse::where('name', self::DEFAULT_WAREHOUSE)->firstOrFail()->id],
            )
            : Location::findOrFail($row['location_id']);

        return [...$row, 'batch_id' => $batch->id, 'location_id' => $location->id, 'minimum_quantity' => $batch->minimum_quantity];
    }

    /**
     * Create the stock row and its initial operation, unless the stock already exists.
     *
     * @param  array{product_id: string, batch_id: int, location_id: int, remarks: string, user_id: string, minimum_quantity: int}  $row
     */
    private function seedStock(array $row, float $quantity): void
    {
        $unit = Product::find($row['product_id'])->unit ?? 'pcs';
        $remarks = $row['remarks'] !== '' ? $row['remarks'] : 'Initial stock';

        $stock = Stock::firstOrCreate(
            ['product_id' => $row['product_id'], 'batch_id' => $row['batch_id'], 'location_id' => $row['location_id']],
            [
                'quantity' => $quantity,
                'unit' => $unit,
                'status' => app(StockOperationService::class)->setStockStatus($quantity, (float) $row['minimum_quantity']),
                'remarks' => $remarks,
                'user_id' => $row['user_id'],
            ],
        );

        if (! $stock->wasRecentlyCreated) {
            return;
        }

        Operation::create([
            'operation_type' => 'initial',
            'product_id' => $row['product_id'],
            'batch_id' => $row['batch_id'],
            'location_id' => $row['location_id'],
            'unit' => $unit,
            'quantity' => $quantity,
            'operation_date' => now(),
            'remarks' => $remarks,
            'user_id' => $row['user_id'],
        ]);
    }

    /**
     * @return Collection<int, array<string, string>>
     */
    private function readRows(string $csvPath): Collection
    {
        $handle = fopen($csvPath, 'r');
        $headers = fgetcsv($handle, null, ',', '"', '\\');
        $rows = collect();

        while (($values = fgetcsv($handle, null, ',', '"', '\\')) !== false) {
            if ($values !== [null]) {
                $rows->push(array_map('trim', array_combine($headers, $values)));
            }
        }

        fclose($handle);

        return $rows;
    }
}
