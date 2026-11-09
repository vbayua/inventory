<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
            'name' => ['required'],
            'sku' => ['required', 'string', 'unique:products,sku,'.$this->product->id],
            'unit' => ['required', 'string'],
            'is_active' => ['nullable', 'boolean'],
            'brand_name' => ['nullable', 'string'],
            'scientific_name' => ['nullable', 'string'],
            'suppliers' => ['nullable', 'array'],
            'suppliers.*.id' => [
                'required',
                'integer',
                Rule::exists('products_suppliers', 'supplier_id')->where('product_id', $this->product->id),
            ],
            'suppliers.*.price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
