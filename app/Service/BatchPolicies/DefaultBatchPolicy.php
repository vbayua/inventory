<?php

namespace App\Service\BatchPolicies;

use App\Models\Batch;
use App\Models\Product;

class DefaultBatchPolicy implements BatchPolicyInterface
{
    public function determineBatch(Product $product, ?int $requestedBatchId = null): ?int
    {
        return $requestedBatchId;
    }

    public function generateBatchNumber(Product $product, string $proposedNumber): string
    {
        $newNumber = $proposedNumber;
        $counter = 1;

        while (Batch::where('batch_number', $newNumber)->exists()) {
            $newNumber = $proposedNumber . '-' . $counter;
            $counter++;
        }
        return $newNumber;
    }
}
