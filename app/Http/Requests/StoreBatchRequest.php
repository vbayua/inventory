<?php

namespace App\Http\Requests;

use App\Rules\SupplierBelongsToProduct;
use Illuminate\Foundation\Http\FormRequest;

class StoreBatchRequest extends FormRequest
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
            'batch_number' => ['nullable', 'string', 'max:255'],
            'product_id' => ['required', 'exists:products,id'],
            'manufacture_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date', 'after_or_equal:manufacture_date'],
            'supplier_id' => [
                'required',
                'integer',
                'exists:suppliers,id',
                new SupplierBelongsToProduct((int) $this->input('product_id'))
            ]
        ];
    }
}
