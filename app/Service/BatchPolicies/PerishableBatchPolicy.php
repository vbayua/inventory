<?php

namespace App\Service\BatchPolicies;

use App\Models\Batch;
use App\Models\Product;

class PerishableBatchPolicy implements BatchPolicyInterface
{
    public function determineBatch(Product $product, ?int $requestedBatchId = null): ?int
    {
        if ($requestedBatchId) {
            return $requestedBatchId;
        }
        $batch = $product->batches()
            ->orderBy('expiry_date')
            ->first();

        return $batch?->id;
    }

    public function generateBatchNumber(Product $product, string $proposedNumber): string
    {
        $base = 'P-' . $proposedNumber;
        $newNumber = $base;
        $counter = 1;

        while (Batch::where('batch_number', $newNumber)->exists()) {

            $newNumber = $base . '-' . $counter;
            $counter++;
        }
        return $newNumber;
    }
}
