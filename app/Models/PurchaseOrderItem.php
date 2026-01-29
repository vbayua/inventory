<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'quantity',
        'price',
        'quantity_received',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function receiveOrderItems()
    {
        return $this->hasMany(ReceiveOrderItem::class);
    }

    public function getQuantityReceivedAttribute()
    {
        return $this->receiveOrderItems()->sum('quantity_received');
    }

    public function getRemainingQuantityAttribute()
    {
        return max(0, $this->quantity - $this->quantity_received);
    }
}
