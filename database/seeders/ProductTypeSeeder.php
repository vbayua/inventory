<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductType;

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
            'name' => 'Primary Packaging Material',
            'description' => 'This is a Primary Packaging product type.',
            'type_code' => 'PP',
            'batch_interval_days' => 0, // No batch interval for primary packaging
        ]);

        ProductType::factory()->create([
            'name' => 'Secondary Packaging Material',
            'description' => 'This is a Secondary Packaging product type.',
            'type_code' => 'PS',
            'batch_interval_days' => 0, // No batch interval for secondary packaging
        ]);
    }
}
