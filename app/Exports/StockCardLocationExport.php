<?php

namespace App\Exports;

use App\Models\Operation;
use App\Models\Stock;
use Illuminate\Database\Eloquent\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
class StockCardLocationExport implements FromCollection, WithHeadings, WithMapping
{
    protected $stockOperations;
    protected $openingBalance;
    protected $stock;


    public function __construct(Collection $stockOperations, Stock $stockData ,float $openingBalance)
    {
        $this->stockOperations = $stockOperations;
        $this->openingBalance = $openingBalance;
        $this->stock = $stockData;
    }

    public function headings(): array
    {
        return [
            'Nama Produk',
            'No. Batch',
            'Lokasi',
            'Operasi Stok',
            'Quantity',
            'Balance',
            'Oleh',
            'Remarks',
            'Dibuat',
            'Diubah',
        ];
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->stockOperations;
    }

    public function map($operation): array
    {
        return [
            $operation->product->name,
            $operation->batch->batch_number,
            $operation->location->name,
            $operation->operation_type,
            $operation->quantity,
            $operation->balance,
            $operation->user->name,
            $operation->remarks,
            $operation->created_at,
        ];
    }
}
