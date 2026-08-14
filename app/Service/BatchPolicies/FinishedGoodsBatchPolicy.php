<?php

namespace App\Service\BatchPolicies;

use App\Models\Batch;
use App\Models\Product;
use Illuminate\Support\Carbon;

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
        'SIA,',
    ];

    public function determineBatch(Product $product, ?int $requestedBatchId = null): ?int
    {
        return $requestedBatchId;
    }

    public function generateBatchNumber(Product $product, string $proposedNumber, ?int $supplierId = null, ?string $operationDate): string
    {
        $opDate = $operationDate ? Carbon::parse($operationDate) : Carbon::now();
        $year = $opDate->format('Y');
        $month = $opDate->month;

        $keywordOfTheMonth = $this->keywords[$month - 1];

        $series = Batch::query()
            ->where('product_id', $product->id)
            ->whereHas('product.productType', function ($query) {
                $query->where('name', 'Finished Goods');
            })
            ->where('batch_number', 'like', "{$year}{$keywordOfTheMonth}%")
            ->count();

        $proposedNumber = "{$year}{$proposedNumber}-" . ($series + 1);

        return $proposedNumber;
    }
}
