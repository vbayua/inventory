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
            'name' => ['required', 'string',],
            'sku' => ['required', 'unique:products,sku', 'string'],
            'unit' => ['required', 'string'],
            'is_active' => ['required', 'boolean'],
            'product_type_id' => ['required', 'exists:product_types,id'],
            'with_begin_stock' => ['required', 'boolean'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'brand_name' => ['nullable', 'string'],
            'manufacturer' => ['nullable', 'string'],
            'scientific_name' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'supplier_id' => ['nullable', 'required_if:has_supplier,true', 'required_if:with_begin_stock,true', 'exists:suppliers,id'],
            'warehouse_id' => ['nullable', 'required_if:with_begin_stock,true', 'exists:warehouses,id'],
            'location_id' => ['nullable', 'required_if:with_begin_stock,true', 'exists:locations,id'],
            'quantity' => ['nullable', 'required_if:with_begin_stock,true', 'numeric', 'min:0'],
            'minimum_quantity' => ['nullable', 'required_if:with_begin_stock,true', 'numeric', 'min:0'],
            'container_capacity' => ['nullable', 'numeric', 'min:0'],
            'container_unit' => ['nullable', 'string'],
        ];
    }
}
