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
        \App\Models\ProductType::create([
            'name' => 'Raw Material',
            'description' => 'Produk Bahan Kemas',
            'type_code' => 'RMP',
            'batch_interval_days' => 90, // Default batch interval for raw materials
        ]);

        \App\Models\ProductType::create([
            'name' => 'Primary Packaging',
            'description' => 'Produk Bahan Kemas Primer',
            'type_code' => 'PP',
            'batch_interval_days' => 0, // No batch interval for primary packaging
        ]);

        \App\Models\ProductType::create([
            'name' => 'Secondary Packaging',
            'description' => 'Produk Bahan Kemas Sekunder',
            'type_code' => 'PS',
            'batch_interval_days' => 0, // No batch interval for secondary packaging
        ]);

        \App\Models\ProductType::create([
            'name' => 'Tertiary Packaging',
            'description' => 'Produk Bahan Kemas Tersier',
            'type_code' => 'PT',
            'batch_interval_days' => 0, // No batch interval for secondary packaging
        ]);

        \App\Models\ProductType::create([
            'name' => 'Packaging Contribute',
            'description' => 'Produk Bahan Kemas Kontribut',
            'type_code' => 'PC',
            'batch_interval_days' => 0, // No batch interval for secondary packaging
        ]);

    }
}
