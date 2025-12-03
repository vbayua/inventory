<?php

namespace Database\Seeders;

use App\Models\ProductType;
use Illuminate\Database\Seeder;

class ProductTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ProductType::factory()->create([
            'name' => 'Raw Material',
            'description' => 'This is a raw material product type.',
            'type_code' => 'RMP',
            'batch_interval_days' => 90, // Default batch interval for raw materials
        ]);

        ProductType::factory()->create([
            'name' => 'Primary Packaging',
            'description' => 'This is a Primary Packaging product type.',
            'type_code' => 'PP',
            'batch_interval_days' => 0, // No batch interval for primary packaging
        ]);

        ProductType::factory()->create([
            'name' => 'Secondary Packaging',
            'description' => 'This is a Secondary Packaging product type.',
            'type_code' => 'PS',
            'batch_interval_days' => 0, // No batch interval for secondary packaging
        ]);

        ProductType::factory()->create([
            'name' => 'Tertiary Packaging',
            'description' => 'This is a Tertiary Packaging product type.',
            'type_code' => 'PT',
            'batch_interval_days' => 0, // No batch interval for secondary packaging
        ]);

        ProductType::factory()->create([
            'name' => 'Packaging Consume',
            'description' => 'This is a Consume Packaging product type.',
            'type_code' => 'PC',
            'batch_interval_days' => 0, // No batch interval for secondary packaging
        ]);

    }
}
