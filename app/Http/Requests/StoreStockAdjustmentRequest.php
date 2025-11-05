<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockAdjustmentRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'stock_id' => ['required', 'exists:stocks,id'],
            'quantity' => ['required', 'numeric'],
            'unit' => ['required', 'string', 'max:10'],
            'adjustment_type' => ['required', 'in:addition,subtraction'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
