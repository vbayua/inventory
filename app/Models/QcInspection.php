<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QcInspection extends Model
{
    protected $fillable = [
        'receive_order_id', 'receive_order_item_id', 'qc_checklist_id',
        'inspector_user_id', 'status', 'inspection_date', 'notes', 'rejection_reason',
        'quantity_passed', 'quantity_rejected',
    ];

    protected $casts = ['inspection_date' => 'datetime'];

    public function receiveOrder(): BelongsTo
    {
        return $this->belongsTo(ReceiveOrder::class);
    }

    public function receiveOrderItem(): BelongsTo
    {
        return $this->belongsTo(ReceiveOrderItem::class);
    }

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(QcChecklist::class, 'qc_checklist_id');
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_user_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(QcInspectionResult::class);
    }
}
