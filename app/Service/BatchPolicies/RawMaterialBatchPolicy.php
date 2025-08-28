<?php

namespace App\Service\BatchPolicies;

use App\Models\Batch;
use App\Models\Product;

class RawMaterialBatchPolicy implements BatchPolicyInterface
{
    public function determineBatch(Product $product, ?int $requestedBatchId = null): ?int
    {
        return $requestedBatchId;
    }

    public function generateBatchNumber(Product $product, string $proposedNumber): string
    {
        $base = $proposedNumber;
        $newNumber = $base;
        $counter = 1;

        while (Batch::where('batch_number', $newNumber)->exists()) {
            $newNumber = $base . '-' . $counter;
            $counter++;
        }
        return $newNumber;
    }
}
