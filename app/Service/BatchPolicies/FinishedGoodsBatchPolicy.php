<?php

namespace App\Service\BatchPolicies;

use App\Models\Product;

class FinishedGoodsBatchPolicy implements BatchPolicyInterface
{
    public function determineBatch(Product $product, ?int $requestedBatchId = null): ?int
    {
        return $requestedBatchId;
    }

    public function generateBatchNumber(Product $product, string $proposedNumber, ?int $supplierId = null, ?string $operationDate): string
    {
        return $proposedNumber;
    }
}
