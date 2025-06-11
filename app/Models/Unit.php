<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public static function booted(): void
    {
        static::creating(function ($unit) {
            $unit->name = strtolower($unit->name);
        });
    }
}
