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
        $YEAR = date('y');
        $YEAR_INDEX = 0;
        $SKU_INDEX = 1;
        $SEQUENCE_INDEX = 2;
        $VARIANT_INDEX = 3;

        $BASE_PREFIX = "$YEAR-$product->sku";

        $currentDefaultCount = null;
        $baseSupplierId = null;

        $series = Batch::query()
            ->where('product_id', $product->id)
            ->where('batch_number', 'like', $BASE_PREFIX.'%')
            ->orderBy('id')
            ->get(['batch_number', 'supplier_id']);

        foreach ($series as $row) {
            $parts = explode('-', $row->batch_number);
            if (\count($parts) === 2) {
                $currentDefaultCount = 1;
                $baseSupplierId = $row->supplier_id;
            } elseif (\count($parts) === 3 && is_numeric($parts[$SEQUENCE_INDEX])) {
                $count = (int) $parts[$SEQUENCE_INDEX];
                if ($currentDefaultCount === null || $count >= $currentDefaultCount) {
                    $currentDefaultCount = $count;
                    $baseSupplierId = $row->supplier_id;
                }
            }
        }

        if ($currentDefaultCount === null) {
            return $BASE_PREFIX.'-1';
        }

        if ($supplierId === null) {
            return $BASE_PREFIX.'-'.($currentDefaultCount + 1);
        }

        if ($baseSupplierId !== null && (int) $supplierId === (int) $baseSupplierId) {
            return $BASE_PREFIX.'-'.($currentDefaultCount + 1);
        }

        // Different supplier => variant of current default cycle
        $variantPrefix = "$BASE_PREFIX-$currentDefaultCount-";

        // Count existing variants in the current cycle
        $existingVariants = 0;
        foreach ($series as $row) {
            if (Str::startsWith($row->batch_number, $variantPrefix)) {
                $existingVariants++;
            }
        }

        // Compute next variant number (1-based), then convert to alphabetic code:
        // 1 -> A, 2 -> B, ..., 26 -> Z, 27 -> AA, 28 -> AB, ...
        $nextVariant = $existingVariants + 1;

        $toLetters = function (int $n): string {
            $letters = '';
            while ($n > 0) {
                $n--; // convert to 0-based
                $letters = \chr(65 + ($n % 26)).$letters; // 65 = 'A'
                $n = intdiv($n, 26);
            }

            return $letters;
        };

        return $variantPrefix.$toLetters($nextVariant);
    }
}
