<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SubmitQcInspectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'notes'                          => 'nullable|string',
            'rejection_reason'               => 'nullable|string',
            'results'                        => 'nullable|array',
            'results.*.qc_checklist_item_id' => 'nullable|exists:qc_checklist_items,id',
            'results.*.item_name'            => 'required|string|max:255',
            'results.*.result'               => 'required|in:pass,fail,na',
            'results.*.notes'                => 'nullable|string',
            'overall_result'                 => 'nullable|in:pass,fail,na',
            'quantity_passed'                => 'nullable|integer|min:0',
            'quantity_rejected'              => 'nullable|integer|min:0',
        ];
    }
}
