<?php

namespace App\Service;

use App\Models\Batch;
use App\Models\Product;
use App\Models\Supplier;
use App\Service\BatchPolicies\BatchPolicyInterface;
use App\Service\BatchPolicies\DefaultBatchPolicy;
use App\Service\BatchPolicies\LotSequenceBatchPolicy;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

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
        $this->defaultPolicy = $config['default'] ?? DefaultBatchPolicy::class;
    }

    protected function resolvePolicy(Product $product): BatchPolicyInterface
    {
        if ($product->productType === null) {
            return app($this->defaultPolicy);
        }

        // if ($product->productType->name === 'Finished Goods') {
        //     return app(Arr::get($this->policies, 'finished_goods', $this->defaultPolicy));
        // }

        $typeCode = optional($product->productType)->type_code;
        switch ($typeCode) {
            case 'RMP':
                $policyClass = Arr::get($this->policies, 'raw_material', $this->defaultPolicy);
                break;
            case 'PP':
                $policyClass = Arr::get($this->policies, 'packaging_primary', $this->defaultPolicy);
                break;
            case 'PS':
                $policyClass = Arr::get($this->policies, 'packaging_secondary', $this->defaultPolicy);
                break;
            case 'PC':
                $policyClass = Arr::get($this->policies, 'packaging_contribute', $this->defaultPolicy);
                break;
            case 'PT':
                $policyClass = Arr::get($this->policies, 'packaging_tertiary', $this->defaultPolicy);
                break;
            case 'FG':
                $policyClass = Arr::get($this->policies, 'finished_goods', $this->defaultPolicy);
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
     *
     * @param  Product|int  $product  The product instance or product ID.
     * @param  int|null  $requestedBatchId  Optional. The specific batch ID requested for the operation.
     * @param  string  $operationType  Optional. The type of operation ('inbound', 'initial', etc.). Defaults to 'inbound'.
     * @param  string|null  $operationDate  Optional. The date of the operation. Defaults to current date/time if not provided.
     * @param  int|null  $supplierId  Optional. The supplier ID to associate with the batch, if applicable.
     * @param  int|null  $parentBatchId  Optional. Create a child batch of this batch instead of a new root batch.
     * @return int|null The determined batch ID, or null if no suitable batch is found.
     *
     * @throws ModelNotFoundException If the product is not found.
     * @throws ValidationException If the supplier is not associated with the product.
     */
    public function determineBatch(
        Product|int $product,
        ?int $requestedBatchId = null,
        string $operationType = 'inbound',
        ?string $operationDate = null,
        ?int $supplierId = null,
        ?int $minQty = 0,
        ?string $manufactureDate = null,
        ?string $expiryDate = null,
        ?int $parentBatchId = null
    ): ?int {
        // Define product
        $product = $product instanceof Product
        ? $product->load(['productType', 'batches', 'operations'])
        : Product::with(['productType', 'batches', 'operations'])->findOrFail((int) $product);

        $policy = $this->resolvePolicy($product);

        $supplier = DB::table('products_suppliers')
            ->where('product_id', $product->id)
            ->where('supplier_id', $supplierId);

        if ($operationType === 'inbound'
        && ! $supplier->exists() && ! $requestedBatchId && ! $parentBatchId) {
            throw ValidationException::withMessages([
                'supplier_id' => 'Supplier does not exist or not associated',
            ]);
        }

        if ($requestedBatchId) {
            return $policy->determineBatch($product, $requestedBatchId);
        }

        if ($parentBatchId) {
            $parent = Batch::findOrFail($parentBatchId);

            if ($parent->product_id !== $product->id) {
                throw ValidationException::withMessages([
                    'parent_batch_id' => 'Parent batch belongs to a different product',
                ]);
            }

            return $policy->determineBatch($product, $this->createChildBatch($parent, minQty: $minQty)->id);
        }

        // Check product interval setting for batch
        $interval = (int) ($product->productType->batch_interval_days ?? 0);
        $operationDate = $operationDate ? \Carbon\Carbon::parse($operationDate) : now();

        // Search last received batch
        $lastInbound = $product->operations()
            ->where('operation_type', 'inbound')
            ->latest('operation_date')
            ->first();

        // Reuse the last received batch within the interval, except for lot-sequence
        // policies, which open a new lot for every inbound instead.
        if ($lastInbound?->batch_id && $interval > 0 && ! $policy instanceof LotSequenceBatchPolicy) {
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

        if ($manufactureDate && ! $expiryDate) {
            $expiryDate = Carbon::parse($manufactureDate)->addDays($product->productType->defaultExpiryDate());
        }

        $newBatch = Batch::create([
            'product_id' => $product->id,
            'batch_number' => $batchNumber,
            'batch_date' => $operationDate->toDateString(),
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

    /**
     * Create a batch split or derived from a parent batch.
     *
     * The child inherits the parent's product, supplier and dates. Its number is
     * the parent's number, the configured separator, then the given suffix or
     * the next numeric sequence among the parent's children.
     *
     * @throws ValidationException If the resulting batch number already exists.
     */
    public function createChildBatch(Batch|int $parent, ?string $suffix = null, ?int $minQty = null): Batch
    {
        $parent = $parent instanceof Batch ? $parent : Batch::findOrFail($parent);
        $prefix = $parent->batch_number.config('batch.child_separator', '.');

        if ($suffix === null) {
            $lastSequence = $parent->children()
                ->pluck('batch_number')
                ->map(fn (string $batchNumber): string => Str::after($batchNumber, $prefix))
                ->filter(fn (string $childSuffix): bool => ctype_digit($childSuffix))
                ->map(fn (string $childSuffix): int => (int) $childSuffix)
                ->max() ?? 0;

            $suffix = (string) ($lastSequence + 1);
        }

        $batchNumber = $prefix.$suffix;

        if (Batch::where('batch_number', $batchNumber)->exists()) {
            throw ValidationException::withMessages([
                'batch_number' => "Batch number {$batchNumber} already exists",
            ]);
        }

        return Batch::create([
            'product_id' => $parent->product_id,
            'parent_batch_id' => $parent->id,
            'batch_number' => $batchNumber,
            'batch_date' => $parent->batch_date,
            'supplier_id' => $parent->supplier_id,
            'manufacture_date' => $parent->manufacture_date,
            'expiry_date' => $parent->expiry_date,
            'minimum_quantity' => $minQty ?? $parent->minimum_quantity,
            'user_id' => Auth::id(),
        ]);
    }

    // public function generateBatchNumber(int $productId, string $proposedNumber): string
    // {
    //     $product = Product::with(['productType'])->findOrFail($productId);
    //     $policy = $this->resolvePolicy($product);

    //     return $policy->generateBatchNumber($product, $proposedNumber);
    // }
}
