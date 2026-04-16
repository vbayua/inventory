<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReceiveOrder extends Model
{
    protected $fillable = [
        'purchase_order_id',
        'receive_number',
        'waybill_number',
        'receive_date',
        'notes',
        'user_id',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function receiveOrderItems(): HasMany
    {
        return $this->hasMany(ReceiveOrderItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function qcInspections(): HasMany
    {
        return $this->hasMany(QcInspection::class);
    }
}
