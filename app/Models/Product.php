<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    public function scopeFilter($query, $filters)
    {
        if (!empty($filters['name'])) {
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }
        if (!empty($filters['sku'])) {
            $query->where('sku', 'like', '%' . $filters['sku'] . '%');
        }
        if (!empty($sort = $filters['sort'] ?? null)) {
            $query->orderBy($sort, $filters['direction'] ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }
    }

    public function categories()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    public function operations()
    {
        return $this->hasMany(Operation::class);
    }

    public function stockAdjustments()
    {
        return $this->hasMany(StockAdjustment::class);
    }

    public function suppliers()
    {
        // return $this->belongsToMany(Supplier::class, '');
        return $this->belongsToMany(Supplier::class, 'products_suppliers', 'product_id', 'supplier_id')
            ->withPivot('price', 'created_at', 'updated_at');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit', 'name');
    }

    public function getUnitTypeAttribute()
    {
        return $this->unit ? $this->unit->unit_type : null;
    }

    public function getBaseUnitAttribute()
    {
        return $this->unit ? $this->unit->base_unit : null;
    }
}
