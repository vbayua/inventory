<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockAdjustment extends Model
{
    /** @use HasFactory<\Database\Factories\StockAdjustmentFactory> */
    use HasFactory;

    protected $fillable = ['product_id', 'batch_id', 'location_id', 'quantity', 'unit', 'adjustment_type', 'remarks'];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit' => 'string',
        'adjustment_type' => 'string',
    ];
    protected $attributes = [
        'unit' => 'pcs', // Default unit
        'adjustment_type' => 'addition', // Default adjustment type
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    protected static function booted()
    {
        static::created(function ($adjustment) {
            $stock = Stock::firstOrCreate(
                [
                    'product_id' => $adjustment->product_id,
                    'batch_id' => $adjustment->batch_id,
                    'location_id' => $adjustment->location_id,
                    'unit' => $adjustment->unit,
                ],
                ['quantity' => 0]
            );

            if ($stock->quantity + $adjustment->quantity < 0) {
                throw new \Exception('Adjustment would result in negative stock for batch: ' . ($adjustment->batch->batch_number ?? 'N/A'));
            }

            $stock->increment('quantity', $adjustment->quantity); // Handles positive/negative
        });
    }
}
