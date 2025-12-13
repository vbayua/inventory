<?php

namespace App\Exports;

use App\Models\Stock;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Collection;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class StockCardViewAllExport implements FromView, ShouldAutoSize
{
    protected Collection $data;
    protected Stock $stock;
    protected $period;
    public function __construct(Collection $data, Stock $stock, $period = null)
    {
        $this->data = $data;
        $this->stock = $stock;
        $this->period = $period;
    }
    public function view(): View
    {
       return view('exports.stock-all', [
                    'operations' => $this->data,
                    'stock' => $this->stock,
                    'period' => $this->period,
                ]);
    }
}
