<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    /** @use HasFactory<\Database\Factories\CategoryFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public static function booted(): void
    {
        static::creating(function (Category $category) {
            $category->slug = str($category->name)->slug();
        });
        static::updating(function (Category $category) {
            $category->slug = str($category->name)->slug();
        });
    }
}
