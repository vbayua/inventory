<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class OperationDetail extends Model
{
   protected $guarded = ['id'];

   public function operation(): BelongsTo
   {
       return $this->belongsTo(Operation::class);
   }

   public function context(): MorphTo
   {
        return $this->morphTo();
   }
}
