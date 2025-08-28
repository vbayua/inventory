<?php

namespace App\Service;

use App\Models\Batch;
use App\Models\Product;
use App\Service\BatchPolicies\BatchPolicyInterface;
use Illuminate\Support\Arr;

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
        $typeCode = optional($product->productType)->type_code;
        $policyClass = Arr::get($this->policies, $typeCode, $this->defaultPolicy);
        return app($policyClass);
    }

    public function determineBatch(Product|int $product, ?int $requestedBatchId = null, string $operationType = 'inbound', ?string $operationDate = null): ?int
    {
        $productId = $product instanceof Product ? $product->id : (int) $product;
        $product = Product::with(['productType', 'batches', 'operations'])->findOrFail($productId);

        $policy = $this->resolvePolicy($product);

        if ($operationType !== 'inbound' || $requestedBatchId) {
            return $policy->determineBatch($product, $requestedBatchId);
        }

        $interval = (int) ($product->productType->batch_interval_days ?? 0);
        $operationDate = $operationDate ? \Carbon\Carbon::parse($operationDate) : now();

        $lastInbound = $product->operations()
            ->where('operation_type', 'inbound')
            ->latest('operation_date')
            ->first();

        if ($lastInbound && $lastInbound->batch_id && $interval > 0) {
            $diff = $lastInbound->operation_date->diffInDays($operationDate);
            if ($diff < $interval) {
                return $policy->determineBatch($product, $lastInbound->batch_id);
            }
        }


        $proposedNumber = $product->sku;
        // $proposedNumber = ($product->productType->type_code ?? 'DEFAULT') . '-' . $product->sku;
        $batchNumber = $policy->generateBatchNumber($product, $proposedNumber);
        $expiryDate = $product->productType->defaultExpiryDate();

        if ($expiryDate) {
            $expiryDate = now()->addDays($expiryDate);
        }

        $newBatch = Batch::create([
            'product_id' => $product->id,
            'batch_number' => $batchNumber,
            'expiry_date' => $expiryDate ?? null,
        ]);

        // dd($newBatch);

        return $policy->determineBatch($product, $newBatch->id);
    }

    public function generateBatchNumber(int $productId, string $proposedNumber): string
    {
        $product = Product::with(['productType'])->findOrFail($productId);
        $policy = $this->resolvePolicy($product);

        return $policy->generateBatchNumber($product, $proposedNumber);
    }
}
