<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qc_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receive_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('receive_order_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('qc_checklist_id')->nullable()->constrained('qc_checklists')->nullOnDelete();
            $table->foreignId('inspector_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('pending'); // pending, checking, pass, reject
            $table->timestamp('inspection_date')->nullable();
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qc_inspections');
    }
};
