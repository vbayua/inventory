<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    /** @use HasFactory<\Database\Factories\SupplierFactory> */
    use HasFactory;


    public $guarded = ['id'];

    public function scopeFilter($query, $filters)
    {
        if (!empty($filters['name'])) {
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }
    }
    /**
     * The products that belong to the supplier.
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'products_suppliers', 'supplier_id', 'product_id')
            ->withPivot('price', 'created_at', 'updated_at');
    }
}
