<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QcApproval extends Model
{
    protected $fillable = [
        'qc_inspection_id',
        'status',
        'notes',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function qcInspection()
    {
        return $this->belongsTo(QcInspection::class, 'qc_inspection_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
