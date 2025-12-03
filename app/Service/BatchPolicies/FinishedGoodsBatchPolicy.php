<?php

namespace App\Service\BatchPolicies;

use App\Models\Product;

class FinishedGoodsBatchPolicy implements BatchPolicyInterface
{
    public function determineBatch(Product $product, ?int $requestedBatchId = null): ?int
    {
        throw new \Exception('Not implemented');
    }

    public function generateBatchNumber(Product $product, string $proposedNumber, ?int $supplierId = null): string
    {
        throw new \Exception('Not implemented');
    }
}
