<?php

namespace App\Exports;

use App\Models\Operation;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StockCardExport implements FromCollection, WithHeadings, WithMapping
{
    protected $stockOperations;

    public function __construct(Operation $stockOperations)
    {
        $this->stockOperations = $stockOperations;
    }


    public function headings(): array
    {
        return [
            'Nama Produk',
            'No. Batch',
            'Lokasi',
            'Quantity',
            'Operasi Stok',
            'Oleh',
            'Dibuat',
            'Diubah',
        ];
    }

    public function map($operation): array
    {
        return [
            $operation->product->name,
            $operation->batch->batch_number,
            $operation->location->name,
            $operation->quantity,
            $operation->operation_type,
            $operation->user->name,
            $operation->created_at,
            $operation->updated_at,
        ];
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->stockOperations;
    }


}
