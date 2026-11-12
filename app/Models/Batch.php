<?php

namespace App\Models;

use Database\Factories\BatchFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Batch extends Model
{
    /** @use HasFactory<BatchFactory> */
    use HasFactory;

    protected $fillable = ['product_id', 'parent_batch_id', 'batch_number', 'batch_date', 'supplier_id', 'manufacture_date', 'expiry_date', 'user_id', 'minimum_quantity'];

    protected $casts = [
        'batch_date' => 'date',
        'manufacture_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * The batch this one was split or derived from.
     *
     * @return BelongsTo<Batch, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'parent_batch_id');
    }

    /**
     * Batches split or derived from this one.
     *
     * @return HasMany<Batch, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(Batch::class, 'parent_batch_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    public function operations(): HasMany
    {
        return $this->hasMany(Operation::class);
    }

    public function stockAdjustments(): HasMany
    {
        return $this->hasMany(StockAdjustment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function issuedFrom(): HasMany
    {
        return $this->hasMany(ProductionOrderIssue::class);
    }

    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date < now();
    }

    protected static function booted(): void
    {
        static::deleted(function (Batch $batch) {
            $current = (string) $batch->batch_number;
            Cache::forget("batch:{$current}");
        });
    }
}
