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
        'RMP' => \App\Service\BatchPolicies\RawMaterialBatchPolicy::class,
        // 'PERISHABLE' => \App\Service\BatchPolicies\PerishableBatchPolicy::class,
        // Add more product type codes and their corresponding policies here
    ],


    'default_expiry_date' => env('BATCH_DEFAULT_EXPIRY_DATE', 365), // Default expiry days for batches
];
