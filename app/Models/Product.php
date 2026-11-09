<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Cache;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    public function scopeFilter($query, $filters)
    {
        if (! empty($filters['name'])) {
            $query->where('name', 'like', '%'.$filters['name'].'%');
        }
        if (! empty($filters['sku'])) {
            $query->where('sku', 'like', '%'.$filters['sku'].'%');
        }
        if (! empty($sort = $filters['sort'] ?? null)) {
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
        return $this->belongsToMany(Supplier::class, 'products_suppliers', 'product_id', 'supplier_id')
            ->withPivot('price')
            ->withTimestamps();
    }

    public function productionOrders()
    {
        return $this->hasMany(ProductionOrder::class);
    }

    public function bom(): HasMany
    {
        return $this->hasMany(Bom::class);
    }

    public function activeBom(): HasOne
    {
        return $this->hasOne(Bom::class, 'active_product_id', 'id');
    }

    public function bomLines(): HasMany
    {
        return $this->hasMany(BomLine::class, 'component_product_id', 'id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit', 'name');
    }

    public function productType()
    {
        return $this->belongsTo(ProductType::class, 'product_type_id', 'id');
    }

    public function getProductTypeDefaultLocationAttribute()
    {
        return $this->productType()->defaultLocation();
    }

    public function getUnitTypeAttribute()
    {
        $unit = $this->getRelationValue('unit'); // explicitly fetch relation

        return $unit ? $unit->unit_type : null;
    }

    public function getBaseUnitAttribute()
    {
        $unit = $this->getRelationValue('unit'); // explicitly fetch relation

        return $unit ? $unit->base_unit : null;
    }

    public function getAllStockQty()
    {
        return $this->relationLoaded('stocks')
            ? (int) $this->stocks->sum('quantity')
            : (int) $this->stocks()->sum('quantity');
    }

    public static function booted(): void
    {
        static::saved(function (Product $product) {
            Cache::forget('products_index');
        });

        static::deleted(function (Product $product) {
            Cache::forget('products_index');
        });
    }
}
