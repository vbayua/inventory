<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    /** @use HasFactory<\Database\Factories\PartnerFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    public function suppliers()
    {
        return $this->hasMany(Supplier::class);
    }

    public function manufacturers()
    {
        return $this->hasMany(Manufacturer::class);
    }
}
