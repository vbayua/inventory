<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Manufacturer extends Model
{
    /** @use HasFactory<\Database\Factories\ManufacturerFactory> */
    use HasFactory;

    public $guarded = ['id'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }
}
