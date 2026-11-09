<?php

namespace App\Models;

use App\Enums\ProductionOrderIssueType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use LogicException;

class ProductionOrderIssue extends Model
{
    public const UPDATED_AT = null;

    protected $guarded = ['id'];

    protected $casts = [
        'type' => ProductionOrderIssueType::class,
    ];

    public function productionOrder(): BelongsTo
    {
        return $this->belongsTo(ProductionOrder::class, 'production_order_id', 'id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(ProductionOrderMaterial::class, 'production_order_material_id', 'id');
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'batch_id', 'id');
    }

    public function suggestedBatch(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'suggested_batch_id', 'id');
    }

    public function operation(): BelongsTo
    {
        return $this->belongsTo(Operation::class, 'operation_id', 'id');
    }

    public function operationContext(): MorphOne
    {
        return $this->morphOne(OperationDetail::class, 'context');
    }

    protected static function booted(): void
    {
        static::updating(fn () => throw new LogicException('Issues are append only'));
        static::deleting(fn () => throw new LogicException('Issues are append only'));
    }
}
