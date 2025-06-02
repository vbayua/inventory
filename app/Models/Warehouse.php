<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    /** @use HasFactory<\Database\Factories\WarehouseFactory> */
    use HasFactory;

    public $guarded = ['id'];

    public function locations()
    {
        return $this->hasMany(Location::class);
    }
}
