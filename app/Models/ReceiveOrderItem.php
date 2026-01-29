<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReceiveOrderItem extends Model
{
    protected $fillable = [
        'receive_order_id',
        'purchase_order_item_id',
        'quantity_received',
    ];

    public function receiveOrder()
    {
        return $this->belongsTo(ReceiveOrder::class);
    }

    public function purchaseOrderItem()
    {
        return $this->belongsTo(PurchaseOrderItem::class);
    }
}
