<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QcApproval extends Model
{
    protected $fillable = [
        'qc_inspection_id',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function qcInspection()
    {
        return $this->belongsTo(QcInspection::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
