<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
            'name' => ['required'],
            'sku' => ['nullable', 'string'],
            'unit' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'is_active' => ['nullable', 'boolean'],
            'with_begin_stock' => ['nullable', 'boolean'],
            // 'location_id' => ['required_if:with_begin_stock,true', 'exists:locations,id'],
            // 'quantity' => ['required_if:with_begin_stock,true', 'numeric', 'min:0'],
            // 'stockUnit' => ['required_if:with_begin_stock,true', 'string'],
        ];
    }
}
