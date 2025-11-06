<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;

class SupplierBelongsToProduct implements ValidationRule
{
    public function __construct(protected int $productId) {}

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (empty($value)) {
            return;
        }

        $exists = DB::table('products_suppliers')
            ->where('product_id', $this->productId)
            ->where('supplier_id', $value)
            ->exists();

        if (!$exists) {
            $fail('The selected supplier is not associated with the chosen product.');
        }
    }
}
