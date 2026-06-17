<?php

namespace App\Service\BatchPolicies;

use App\Models\Batch;
use App\Models\Product;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class PrimaryPackagingBatchPolicy implements BatchPolicyInterface
{
    public function determineBatch(Product $product, ?int $requestedBatchId = null): ?int
    {
        return $requestedBatchId;
    }

    public function generateBatchNumber(Product $product, string $proposedNumber, ?int $supplierId = null, ?string $operationDate): string
    {
        $opDate = $operationDate ? Carbon::parse($operationDate) : Carbon::now();
        $year = $opDate->format('y');
        $basePrefix = "{$year}-{$product->sku}";

        // Fetch existing batches for this product+year, most recent first
        $series = Batch::query()
            ->where('product_id', $product->id)
            ->where('batch_number', 'like', "{$basePrefix}-%")
            ->orderBy('id', 'desc')
            ->get(['batch_number', 'created_at']);

        // Parse valid YEAR-SKU-LOT-SEQ entries (LOT = second-to-last, SEQ = last)
        $parsed = [];
        foreach($series as $row) {
            $parts = explode('-', $row->batch_number);
            if(\count($parts) < 4) continue;
            $seq = (int) \end($parts);
            $lot = $parts[\count($parts) - 2];
            if ($seq > 0 && ctype_alpha($lot))
            {
                $parsed[] = [
                    'batch_number' => $row->batch_number,
                    'lot' => $lot,
                    'seq' => $seq,
                    'created_at' => $row->created_at,
                ];
            }
        }

        if(empty($parsed))
        {
            // No batches yet for this product+year -> first ever
            return "{$basePrefix}-A-1";
        }

        // Latest batch is first (ordered by id desc)
        $latest = $parsed[0];
        $lastSeq = $latest['seq'];
        $daysDiff = $latest['created_at']->diffInDays($opDate);

        if($daysDiff > 90)
        {
            return "{$basePrefix}-A-" . ($lastSeq + 1);
        }

        // Same 90-day window -> next LOT letter within this SEQUENCE
        $lotsInCurrentSeq = array_filter($parsed, fn($p) => $p['seq'] === $lastSeq);
        $nextLotNum = count($lotsInCurrentSeq) + 1;

        return "{$basePrefix}-" . $this->toLetters($nextLotNum) . "-" . $lastSeq;
    }

    private function toLetters (int $n): string {
        $letters = '';
        while ($n > 0) {
            $n--; // convert to 0-based
            $letters = \chr(65 + ($n % 26)).$letters; // 65 = 'A'
            $n = intdiv($n, 26);
        }

        return $letters;
    }
}
