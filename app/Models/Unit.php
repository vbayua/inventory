<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Unit extends Model
{
    /** @use HasFactory<\Database\Factories\UnitFactory> */
    use HasFactory;

    protected $primaryKey = 'name';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'base_unit',
        'unit_type',
        'conversion_to_base',
    ];

    protected $casts = [
        'conversion_to_base' => 'float',
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'unit', 'name');
    }

    protected static function booted(): void
    {
        static::creating(function ($unit) {
            $unit->name = strtolower($unit->name);
        });

        // Capture original name before update to invalidate
        static::updating(function (Unit $unit) {
            $unit->old_name = strtolower((string) $unit->getOriginal('name'));
        });

        static::saved(function (Unit $unit) {
            $current = strtolower($unit->name);
            Cache::forget("unit:name:{$current}");

            // If renamed, forget the old key
            if (! empty($unit->old_name) && $unit->old_name !== $current) {
                Cache::forget("unit:name:{$unit->old_name}");
            }
        });
        static::deleted(function (Unit $unit) {
            $current = strtolower($unit->name);
            Cache::forget("unit:name:{$current}");
        });
    }
}
