<?php

namespace App\Service\BatchPolicies;

use App\Models\Product;

interface BatchPolicyInterface
{
    /**
     * Determine the batch ID for a given product.
     *
     * @param Product $product
     */
    public function determineBatch(Product $product, ?int $requestedBatchId = null): ?int;

    /**
     * Generate a unique batch number for a product.
     *
     * @param Product $product
     * @return string
     */
    public function generateBatchNumber(Product $product, string $proposedNumber): string;
}
