<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductType extends Model
{
    /** @use HasFactory<\Database\Factories\ProductTypeFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type_code',
        'batch_interval_days',
        'default_location_id',
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'product_type_id', 'id');
    }

    public function defaultLocation()
    {
        return $this->belongsTo(Location::class, 'default_location_id', 'id');
    }

    public function defaultExpiryDate(): int
    {
        return (int) config('batch.default_expiry_date');
    }
}
