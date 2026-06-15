<?php

namespace App\Service;

use App\Models\Batch;
use App\Models\Product;
use App\Models\Supplier;
use App\Service\BatchPolicies\BatchPolicyInterface;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class BatchAssignmentService
{
    protected array $policies;

    protected string $defaultPolicy;

    /**
     * BatchAssigmentService constructor.
     */
    public function __construct()
    {
        $config = config('batch');
        $this->policies = $config['policies'] ?? [];
        $this->defaultPolicy = $config['default'] ?? \App\Service\BatchPolicies\DefaultBatchPolicy::class;
    }

    protected function resolvePolicy(Product $product): BatchPolicyInterface
    {
        if ($product->productType === null) {
            return app($this->defaultPolicy);
        }

        if ($product->productType->name === 'Finished Goods') {
            return app(Arr::get($this->policies, 'finished_goods', $this->defaultPolicy));
        }

        $typeCode = optional($product->productType)->type_code;
        switch($typeCode) {
            case 'RMP':
                $policyClass = Arr::get($this->policies, 'raw_material', $this->defaultPolicy);
                break;
            case 'PP':
                $policyClass = Arr::get($this->policies, 'packaging_primary', $this->defaultPolicy);
                break;
            case 'PS':
                $policyClass = Arr::get($this->policies, 'packaging_secondary', $this->defaultPolicy);
                break;
            case 'PT':
                $policyClass = Arr::get($this->policies, 'packaging_tertiary', $this->defaultPolicy);
                break;
            default:
                throw ValidationException::withMessages([
                    'product_type' => "Unsupported product type: {$typeCode}",
                ]);
        }
        // $policyClass = Arr::get($this->policies, $typeCode, $this->defaultPolicy);

        return app($policyClass);
    }

    /**
     * Determines the appropriate batch ID for a given product and operation context.
     * @param  Product|int  $product  The product instance or product ID.
     * @param  int|null  $requestedBatchId  Optional. The specific batch ID requested for the operation.
     * @param  string  $operationType  Optional. The type of operation ('inbound', 'initial', etc.). Defaults to 'inbound'.
     * @param  string|null  $operationDate  Optional. The date of the operation. Defaults to current date/time if not provided.
     * @param  int|null  $supplierId  Optional. The supplier ID to associate with the batch, if applicable.
     * @return int|null The determined batch ID, or null if no suitable batch is found.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If the product is not found.
     * @throws \Illuminate\Validation\ValidationException If the supplier is not associated with the product.
     */

    public function determineBatch(
        Product|int $product,
        ?int $requestedBatchId = null,
        string $operationType = 'inbound',
        ?string $operationDate = null,
        ?int $supplierId = null,
        ?int $minQty = 0,
        ?string $manufactureDate = null,
        ?string $expiryDate = null
        ): ?int
    {
        if ($product instanceof Product) {
            // Load ProductType, Batch, Operation relationship
            $product->load(['productType', 'batches', 'operations']);
        }
        else {
            // Query ProductType, Batch, Operation relationship
            $product = Product::with(['productType', 'batches', 'operations'])->findOrFail((int) $product);
        }

        // Check if supplier exist
        $supplierExists = $supplierId ? DB::table('products_suppliers')
            ->where('product_id', $product->id)
            ->where('supplier_id', $supplierId)
            ->exists()
            : false;

        $policy = $this->resolvePolicy($product);

        if ($operationType === 'inbound' && ! $supplierExists && ! $requestedBatchId) {
            throw ValidationException::withMessages([
                'supplier_id' => "Supplier does not exist or not associated",
            ]);
        }

        if ($requestedBatchId) {
            return $policy->determineBatch($product, $requestedBatchId);
        }

        // Check product interval setting for batch
        $interval = (int) ($product->productType->batch_interval_days ?? 0);
        $operationDate = $operationDate ? \Carbon\Carbon::parse($operationDate) : now();

        // Search last received batch
        $lastInbound = $product->operations()
            ->where('operation_type', 'inbound')
            ->latest('operation_date')
            ->first();

        // If there is interval in the last received stock, check the interval.
        if ($lastInbound?->batch_id && $interval > 0) {
            $diff = $lastInbound->operation_date->diffInDays($operationDate);
            if ($diff < $interval) {
                return $policy->determineBatch($product, $lastInbound->batch_id);
            }
        }

        $proposedBatchNumber = $product->sku;
        $batchNumber = $policy->generateBatchNumber(
            $product,
            $proposedBatchNumber,
            $supplierId,
            $operationDate->toDateString()
        );

        $manufactureDate = $manufactureDate ? Carbon::parse($manufactureDate) : null;
        $expiryDate = $expiryDate ? Carbon::parse($expiryDate) : null;

        if ($manufactureDate && $expiryDate && $manufactureDate > $expiryDate) {
            throw ValidationException::withMessages(['expiryDate' => 'Expiry date must be after manufacture date']);
        }

        if ($manufactureDate && !$expiryDate) {
            $expiryDate = Carbon::parse($manufactureDate)->addDays($product->productType->defaultExpiryDate());
        }

        $newBatch = Batch::create([
            'product_id' => $product->id,
            'batch_number' => $batchNumber,
            'manufacture_date' => $manufactureDate ?? null,
            'expiry_date' => $expiryDate ?? null,
            'minimum_quantity' => $minQty,
            'supplier_id' => $supplierId,
            'user_id' => Auth::id(),
        ]);

        return $policy->determineBatch($product, $newBatch->id);
    }

    public function generateBatchNumber(Product $product, string $proposedNumber, ?int $supplierId = null, ?string $operationDate = null): string
    {
        $policy = $this->resolvePolicy($product);

        return $policy->generateBatchNumber($product, $proposedNumber, $supplierId, $operationDate);
    }

    // public function generateBatchNumber(int $productId, string $proposedNumber): string
    // {
    //     $product = Product::with(['productType'])->findOrFail($productId);
    //     $policy = $this->resolvePolicy($product);

    //     return $policy->generateBatchNumber($product, $proposedNumber);
    // }
}
