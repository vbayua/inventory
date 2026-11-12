<?php

namespace App\Service\BatchPolicies;

use App\Models\Batch;
use App\Models\Product;
use Illuminate\Support\Carbon;

/**
 * Numbers root batches as YEAR-SKU-LOT-SEQ (e.g. 26-PP0218-B-1).
 *
 * A sequence opens with lot A. Every new batch dated within the product type's
 * batch interval, counted from the batch date of the sequence's first batch,
 * takes the next lot letter in that sequence. Once the interval has elapsed,
 * a new sequence starts again at lot A.
 *
 * Products under this policy get a new batch on every inbound without a
 * requested batch; BatchAssignmentService does not reuse the last one.
 */
abstract class LotSequenceBatchPolicy implements BatchPolicyInterface
{
    public function determineBatch(Product $product, ?int $requestedBatchId = null): ?int
    {
        return $requestedBatchId;
    }

    public function generateBatchNumber(Product $product, string $proposedNumber, ?int $supplierId = null, ?string $operationDate = null): string
    {
        $opDate = ($operationDate ? Carbon::parse($operationDate) : Carbon::now())->startOfDay();
        $basePrefix = $opDate->format('y')."-{$product->sku}";

        $parsed = Batch::query()
            ->where('product_id', $product->id)
            ->whereNull('parent_batch_id')
            ->where('batch_number', 'like', "{$basePrefix}-%")
            ->get(['batch_number', 'batch_date', 'created_at'])
            ->map(fn (Batch $batch): ?array => $this->parseLotSequence($batch))
            ->filter()
            ->values();

        if ($parsed->isEmpty()) {
            return "{$basePrefix}-A-1";
        }

        $currentSeq = $parsed->max('seq');
        $currentSeries = $parsed->where('seq', $currentSeq);
        $seriesStartedOn = $currentSeries->min('batch_date');

        $intervalDays = (int) ($product->productType?->batch_interval_days ?? 0);

        if ($seriesStartedOn->diffInDays($opDate) >= $intervalDays) {
            return "{$basePrefix}-A-".($currentSeq + 1);
        }

        $nextLot = $currentSeries->max('lot_index') + 1;

        return "{$basePrefix}-".$this->toLetters($nextLot).'-'.$currentSeq;
    }

    /**
     * @return array{lot_index: int, seq: int, batch_date: Carbon}|null
     */
    private function parseLotSequence(Batch $batch): ?array
    {
        $parts = explode('-', $batch->batch_number);
        if (\count($parts) < 4) {
            return null;
        }

        $seq = (int) end($parts);
        $lot = $parts[\count($parts) - 2];
        if ($seq <= 0 || ! ctype_alpha($lot)) {
            return null;
        }

        return [
            'lot_index' => $this->fromLetters(strtoupper($lot)),
            'seq' => $seq,
            'batch_date' => ($batch->batch_date ?? $batch->created_at)->copy()->startOfDay(),
        ];
    }

    private function toLetters(int $n): string
    {
        $letters = '';
        while ($n > 0) {
            $n--;
            $letters = \chr(65 + ($n % 26)).$letters;
            $n = intdiv($n, 26);
        }

        return $letters;
    }

    private function fromLetters(string $letters): int
    {
        $n = 0;
        foreach (str_split($letters) as $letter) {
            $n = $n * 26 + (\ord($letter) - 64);
        }

        return $n;
    }
}
