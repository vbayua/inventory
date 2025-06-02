<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Operation extends Model
{
    /** @use HasFactory<\Database\Factories\OperationFactory> */
    use HasFactory;

    protected $fillable = ['type', 'product_id', 'batch_id', 'location_id', 'quantity', 'operation_date'];

    protected $casts = [
        'type' => 'string',
        'operation_date' => 'date',
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
        static::created(function ($operation) {
            $stock = Stock::firstOrCreate(
                [
                    'product_id' => $operation->product_id,
                    'batch_id' => $operation->batch_id,
                    'location_id' => $operation->location_id,
                ],
                ['quantity' => 0]
            );

            if ($operation->type === 'receiving') {
                $stock->increment('quantity', $operation->quantity);
            } else {
                if ($stock->quantity < $operation->quantity) {
                    throw new \Exception('Insufficient stock for batch: ' . ($operation->batch->batch_number ?? 'N/A'));
                }
                $stock->decrement('quantity', $operation->quantity);
            }
        });
    }
}
