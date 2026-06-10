<?php

namespace App\Http\Requests;

use App\Models\Unit;
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
     *21
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return
        [
             'operationType' => 'required|in:inbound,outbound,adjustment,transfer,return',
             'product' => 'required|exists:products,id',
             'location' => 'required_unless:operationType,transfer|nullable|exists:locations,id',
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

    /**
     * Configure the validator instance.
     */
    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function (\Illuminate\Validation\Validator $validator) {
            $unitName = $this->input('unit');
            $quantity = $this->input('quantity');

            if ($unitName && $quantity !== null) {
                $unit = Unit::find($unitName);

                if ($unit && $unit->unit_type === 'item' && floor((float) $quantity) != (float) $quantity) {
                    $validator->errors()->add('quantity', 'Quantity must be a whole number when unit type is item.');
                }
            }
        });
    }
}
