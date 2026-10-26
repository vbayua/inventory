<?php

use App\Service\BatchPolicies\ContributePackagingBatchPolicy;
use App\Service\BatchPolicies\DefaultBatchPolicy;
use App\Service\BatchPolicies\FinishedGoodsBatchPolicy;
use App\Service\BatchPolicies\PrimaryPackagingBatchPolicy;
use App\Service\BatchPolicies\RawMaterialBatchPolicy;
use App\Service\BatchPolicies\SecondaryPackagingBatchPolicy;
use App\Service\BatchPolicies\TertiaryPackagingBatchPolicy;

return [
    /*
    |--------------------------------------------------------------------------
    | Batch Policy Configuration
    |--------------------------------------------------------------------------
    | Map product type codes to policy classes. A default policy is used when
    | a product type does not have a specific policy mapping.
    */
    'default' => DefaultBatchPolicy::class,
    'policies' => [
        'raw_material' => RawMaterialBatchPolicy::class,
        'packaging_primary' => PrimaryPackagingBatchPolicy::class,
        'packaging_secondary' => SecondaryPackagingBatchPolicy::class,
        'packaging_contribute' => ContributePackagingBatchPolicy::class,
        'packaging_tertiary' => TertiaryPackagingBatchPolicy::class,
        'finished_goods' => FinishedGoodsBatchPolicy::class,
        // Add more product type codes and their corresponding policies here
    ],

    'default_expiry_date' => env('BATCH_DEFAULT_EXPIRY_DATE', 365), // Default expiry days for batches
];
