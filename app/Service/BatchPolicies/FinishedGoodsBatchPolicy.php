<?php

namespace App\Service\BatchPolicies;

use App\Models\Batch;
use App\Models\Product;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class FinishedGoodsBatchPolicy implements BatchPolicyInterface
{
    protected $keywords = [
        'IM',
        'PE',
        'RI',
        'AL',
        'KOS',
        'ME',
        'TI',
        'KA',
        'IN',
        'DO',
        'NE',
        'SIA',
    ];

    public function determineBatch(Product $product, ?int $requestedBatchId = null): ?int
    {
        return $requestedBatchId;
    }

    public function generateBatchNumber(Product $product, string $proposedNumber, ?int $supplierId, ?string $operationDate): string
    {
        $opDate = $operationDate ? Carbon::parse($operationDate) : Carbon::now();
        $year = $opDate->format('Y');
        $month = $opDate->month;

        $keywordOfTheMonth = $this->keywords[$month - 1];

        $prefix = "{$year}{$keywordOfTheMonth}{$product->sku}-";

        $lastSequence = Batch::query()
            ->where('product_id', $product->id)
            ->where('batch_number', 'like', "{$prefix}%")
            ->pluck('batch_number')
            ->map(fn (string $batchNumber): int => (int) Str::afterLast($batchNumber, '-'))
            ->max() ?? 0;

        $proposedNumber = $prefix.($lastSequence + 1);

        return $proposedNumber;
    }
}
