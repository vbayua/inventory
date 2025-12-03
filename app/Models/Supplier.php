<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Supplier extends Model
{
    /** @use HasFactory<\Database\Factories\SupplierFactory> */
    use HasFactory;

    public $guarded = ['id'];

    // public function scopeFilter($query, $filters)
    // {
    //     if (!empty($filters['name'])) {
    //         $query->where('name', 'like', '%' . $filters['name'] . '%');
    //     }
    // }

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'products_suppliers', 'supplier_id', 'product_id')
            ->withPivot('price')
            ->withTimestamps();
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    public static function booted(): void
    {
        static::saved(function (Supplier $supplier) {
            Cache::forget('suppliers_list');
        });

        static::deleted(function (Supplier $supplier) {
            Cache::forget('suppliers_list');
        });
    }
}
