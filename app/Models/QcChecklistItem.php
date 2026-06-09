<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QcChecklistItem extends Model
{
    protected $fillable = ['qc_checklist_id', 'item_name', 'description', 'is_required', 'sort_order'];

    protected $casts = ['is_required' => 'boolean', 'sort_order' => 'integer'];

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(QcChecklist::class, 'qc_checklist_id');
    }

    public function inspectionResults(): HasMany
    {
        return $this->hasMany(QcInspectionResult::class);
    }
}
