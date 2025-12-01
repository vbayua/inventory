<?php

namespace App\Service\BatchPolicies;

use App\Models\Batch;
use App\Models\Product;
use Illuminate\Support\Str;

class DefaultBatchPolicy implements BatchPolicyInterface
{
    public function determineBatch(Product $product, ?int $requestedBatchId = null): ?int
    {
        return $requestedBatchId;
    }

    public function generateBatchNumber(Product $product, string $proposedNumber, ?int $supplierId = null): string
    {
        $year = date('y');
        $basePrefix = $year . '' . $product->sku;

        $currentDefaultCount = null;
        $baseSupplierId = null;

        $series = Batch::query()
            ->where('product_id', $product->id)
            ->where('batch_number', 'like', $basePrefix . '%')
            ->orderBy('id')
            ->get(['batch_number', 'supplier_id']);

        foreach ($series as $row) {
            $parts = explode('-', $row->batch_number);
            if (count($parts) === 1) {
                $currentDefaultCount = 0;
                $baseSupplierId = $row->supplier_id;
            } elseif (count($parts) === 2 && is_numeric($parts[1])) {
                $count = (int) $parts[1];
                if ($currentDefaultCount === null || $count >= $currentDefaultCount) {
                    $currentDefaultCount = $count;
                    $baseSupplierId = $row->supplier_id;
                }
            }
        }

        if ($currentDefaultCount === null) {
            return $basePrefix;
        }

        if ($supplierId === null) {
            return $basePrefix . '-' . ($currentDefaultCount + 1);
        }

        if ($baseSupplierId !== null && (int) $supplierId === (int) $baseSupplierId) {
            return $basePrefix . '-' . ($currentDefaultCount + 1);
        }

        // Different supplier => variant of current default cycle
        $variantPrefix = $basePrefix . '-' . $currentDefaultCount . '-';
        $existingVariants = 0;
        foreach ($series as $row) {
            if (Str::startsWith($row->batch_number, $variantPrefix)) {
                $existingVariants++;
            }
        }

        $nextVariant = $existingVariants + 1;

        return $variantPrefix . $nextVariant;
    }
}
