<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
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
        ];
    }
}
