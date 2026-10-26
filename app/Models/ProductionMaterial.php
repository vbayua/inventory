<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductionMaterial extends Model
{
    protected $guarded = ['id'];

    public function production()
    {
        return $this->belongsTo(Production::class);
    }
}
