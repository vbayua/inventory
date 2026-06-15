<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductTypeRequest extends FormRequest
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
            'name' => ['required', 'unique:product_types,name', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'disable_type_code' => ['required', 'boolean'],
            'type_code' => ['required_if:disable_type_code,false', 'unique:product_types,type_code', 'nullable', 'string'],
        ];
    }
}
