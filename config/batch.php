<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Batch Policy Configuration
    |--------------------------------------------------------------------------
    | Map product type codes to policy classes. A default policy is used when
    | a product type does not have a specific policy mapping.
    */
    'default' => \App\Service\BatchPolicies\DefaultBatchPolicy::class,
    'policies' => [
        'raw_material' => \App\Service\BatchPolicies\RawMaterialBatchPolicy::class,
        'packaging_primary' => \App\Service\BatchPolicies\PrimaryPackagingBatchPolicy::class,
        'packaging_secondary' => \App\Service\BatchPolicies\SecondaryPackagingBatchPolicy::class,
        'packaging_tertiary' => \App\Service\BatchPolicies\TertiaryPackagingBatchPolicy::class,
        // 'finished_product' => \App\Service\BatchPolicies\FinishedProductBatchPolicy::class
        // Add more product type codes and their corresponding policies here
    ],

    'default_expiry_date' => env('BATCH_DEFAULT_EXPIRY_DATE', 365), // Default expiry days for batches
];
