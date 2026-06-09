<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QcChecklist extends Model
{
    protected $fillable = ['name', 'description', 'product_type_id', 'is_active', 'user_id'];

    protected $casts = ['is_active' => 'boolean'];

    public function productType(): BelongsTo
    {
        return $this->belongsTo(ProductType::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(QcChecklistItem::class)->orderBy('sort_order');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(QcInspection::class);
    }
}
