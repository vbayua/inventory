<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOperationRequest extends FormRequest
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
        return
        [
             'operationType' => 'required|in:inbound,outbound,adjustment,transfer,return',
             'product' => 'required|exists:products,id',
             'location' => 'required_unless:operationType,transfer|exists:locations,id',
             'batch' => 'required|exists:batches,id',
             'quantity' => 'required|numeric|min:0',
             'unit' => 'required|exists:units,name',
             'date' => 'required|date',
             'remarks' => 'nullable|string|max:255',
             'adjustmentType' => 'nullable|required_if:operationType,adjustment|in:addition,subtraction',
             'source_location' => 'nullable|required_if:operationType,transfer|exists:locations,id',
             'destination_location' => 'nullable|required_if:operationType,transfer|exists:locations,id',
             'with_container' => 'nullable|boolean',
             'container_quantity' => 'nullable|numeric|min:0',
             'container_unit' => 'nullable|exists:units,name',
        ];
    }
}
