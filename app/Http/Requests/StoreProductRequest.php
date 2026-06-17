<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

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
            'sku' => ['required', 'regex:/^[A-Z]+\d{4}[A-Z]?$/',
            function (string $attribute, mixed $value, \Closure $fail) {
                if (!is_string($value) || $value === '') {
                    return;
                }

                // If the selected product type is "finished goods", SKU prefix validation is skipped.
                $productTypeId = request('product_type_id');
                if ($productTypeId) {
                    $isFinishedGoods = DB::table('product_types')
                        ->where('id', $productTypeId)
                        ->whereRaw('LOWER(name) = ?', ['finished goods'])
                        ->exists();

                    if ($isFinishedGoods) {
                        return;
                    }
                }

                // Grab all type codes (e.g. RMP, PP, PS...)
                $typeCodes = DB::table('product_types')
                    ->whereNotNull('type_code')
                    ->pluck('type_code')
                    ->filter()
                    ->map(fn ($c) => strtoupper(trim((string) $c)))
                    ->values();

                // If there are no configured type codes, decide whether to fail or skip.
                if ($typeCodes->isEmpty()) {
                    $fail('No product type codes are configured, so SKU cannot be validated.');
                    return;
                }

                $sku = strtoupper($value);

                $matches = $typeCodes->contains(fn (string $code) => str_starts_with($sku, $code));
                if (!$matches) {
                    $fail('The SKU must start with a valid product type code.');
                }
            },

            'unique:products,sku', 'string'],
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
