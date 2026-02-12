<?php

namespace App\Exports;

use App\Models\Operation;
use App\Models\Stock;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StockExport implements FromCollection, WithMapping, WithHeadings, ShouldAutoSize
{
    protected $stock;
    protected $cutoffDate;
    public function __construct(Stock $stock, $cutoffDate)
    {
        $this->stock = $stock;
        $this->cutoffDate = $cutoffDate;
    }

    public function headings(): array
    {
        return [
            'Tanggal Operasi',
            ['Nama Produk',
            'SKU'],
            'No. Batch',
            'Supplier',
            'Lokasi',
            'Delta IN',
            'Delta OUT',
            'Balance',
            'Oleh',
        ];
    }

    public function map($operation): array
    {
        $deltaIn = $operation->delta > 0 ? $operation->delta : 0;
        $deltaOut = $operation->delta < 0 ? abs($operation->delta) : 0;

        return [
            Carbon::parse($operation->operation_date)->format('Y-m-d H:i:s'),
            [$operation->product->name,
            $operation->product->sku],
            $operation->batch->batch_number,
            $operation->batch->supplier->partner->name ?? 'N/A',
            $operation->location->name,
            $deltaIn,
            $deltaOut,
            $operation->balance,
            $operation->user->name,
            Carbon::parse($operation->created_at)->format('Y-m-d H:i:s'),
        ];
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        $operations = Operation::with([
            'product:id,name,sku,product_type_id',
            'product.productType:id,name,type_code',
            'location:id,name,warehouse_id',
            'location.warehouse:id,name',
            'batch:id,batch_number,supplier_id',
            'batch.supplier:id,partner_id',
            'batch.supplier.partner:id,name',
            'user:id,name'
        ])
        ->where('product_id', $this->stock->product_id)
        ->where('batch_id', $this->stock->batch_id)
        ->whereBetween('operation_date', [($this->cutoffDate ?? \Carbon\Carbon::parse('1900-01-01')), now()])
        ->orderBy('operation_date', 'asc')
        ->orderBy('id', 'asc')
        ->get();

        $operationDeltas = $operations->map(function ($op) {
            $type = $op->operation_type;

            // Normalize types to your domain semantics
            // inbound => +qty, outbound => -qty, adjustment(addition) => +qty, adjustment(subtraction) => -qty,
            // return => +qty, transfer => 0 (when aggregating across locations)
            $qty = (float) $op->quantity;

            $delta = 0.0;
            if ($type === 'initial') {
                $delta = +$qty;
            } elseif ($type === 'inbound') {
                $delta = +$qty;
            } elseif ($type === 'outbound') {
                $delta = -$qty;
            } elseif ($type === 'adjustment') {
                // When stored, remarks or a dedicated field may indicate addition/subtraction.
                // If you persist adjustmentType, use it here; otherwise infer from remarks.
                // Example assumes you have "addition"/"subtraction" in remarks, adjust to your actual data.
                $adj = null;
                if (isset($op->remarks)) {
                    $r = strtolower($op->remarks);
                    if (str_contains($r, 'addition')) $adj = 'addition';
                    if (str_contains($r, 'subtraction')) $adj = 'subtraction';
                }
                if ($adj === 'subtraction') {
                    $delta = -$qty;
                } else {
                    $delta = +$qty;
                }
            } elseif ($type === 'return') {
                $delta = +$qty;
            } elseif ($type === 'transfer') {
                // Aggregated card across locations: neutralize transfers
                $delta = 0.0;
            } elseif($type === 'transfer_in') {
                $delta = +$qty;
            } elseif($type === 'transfer_out') {
                $delta = -$qty;
            } else {
                // Unknown type -> neutral
                $delta = 0.0;
            }

            // Attach the computed delta
            $op->delta = $delta;
            return $op;
        });

        $netSum = $operationDeltas->sum('delta');

        // Opening balance so final balance equals current total in location
        $openingBalance = (float) $this->stock->total_quantity - (float) $netSum;

        // Build running balance sequence
        $running = 0.0;
        $operationsWithBalance = $operationDeltas->map(function ($op) use (&$running, $openingBalance) {
            $running += (float) $op->delta;
            $op->balance = $openingBalance + $running;
            return $op;
        });

        return $operationsWithBalance;
    }
}
