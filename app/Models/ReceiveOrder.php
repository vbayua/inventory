<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReceiveOrder extends Model
{
    protected $fillable = [
        'purchase_order_id',
        'receive_number',
        'waybill_number',
        'receive_date',
        'location_id',
        'notes',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function receiveOrderItems()
    {
        return $this->hasMany(ReceiveOrderItem::class);
    }
}
