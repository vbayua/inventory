<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductionOrderMaterial extends Model
{
    protected $guarded = ['id'];

    public function production()
    {
        return $this->belongsTo(ProductionOrder::class, 'production_order_id', 'id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'component_product_id', 'id');
    }
}
