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
    protected $fillable = ['name', 'conversion_to_base', 'base_unit', 'unit_type'];
}
