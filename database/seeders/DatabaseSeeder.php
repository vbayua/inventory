<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use App\Service\StockOperationService;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Add other seeders here
            // \Database\Seeders\RoleSeeder::class,
            // \Database\Seeders\PermissionSeeder::class,
            // \Database\Seeders\RolePermissionSeeder::class,
            // \Database\Seeders\UserSeeder::class,
            \Database\Seeders\AuthorizationSeeder::class,
            \Database\Seeders\UnitSeeder::class,
        ]);
        $warehouse = \App\Models\Warehouse::factory()->create([
            'name' => 'Main Warehouse',
        ]);
        \App\Models\Location::factory()->create([
            'name' => 'Main Location',
            'warehouse_id' => $warehouse->id,
        ]);

        \App\Models\Category::factory()->count(5)->create();
        \App\Models\Supplier::factory()->count(5)->create();


        $rawMaterial =  \App\Models\ProductType::factory()->create([
            'name' => 'Raw Material',
            'description' => 'This is a raw material product type.',
            'type_code' => 'RMP',
        ]);

        $packagingMaterial1 = \App\Models\ProductType::factory()->create([
            'name' => 'Primary Packaging Material',
            'description' => 'This is a Primary Packaging product type.',
            'type_code' => 'PP',
        ]);

        $packagingMaterial2 = \App\Models\ProductType::factory()->create([
            'name' => 'Secondary Packaging Material',
            'description' => 'This is a Secondary Packaging product type.',
            'type_code' => 'PS',
        ]);

        $productTypes = [
            $rawMaterial,
            $packagingMaterial1,
            $packagingMaterial2,
        ];


        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);
        $service =  app(StockOperationService::class);
        // Raw Material Products
        Product::factory()->count(10)->create()->each(function ($product) use ($service, $productTypes) {
            $product->suppliers()->attach(\App\Models\Supplier::inRandomOrder()->first());
            $product->productType()->associate($productTypes['0']); // Raw Material
            $product->brand_name = 'Brand ' . $product->name;
            $product->scientific_name = 'Scientific ' . $product->name;
            $product->sku = 'RMP' . rand(1000, 9999); // Generate a random SKU
            $product->save();

            // Create a default batch for each product
            $batch = \App\Models\Batch::factory()->create([
                'product_id' => $product->id,
                'batch_number' => '25' . 'RMP' . $product->sku,
                'expiry_date' => now()->addYear(),
            ]);
            // Create initial stock for each product
            $service->createInitialStock($product, [
                'location_id' => \App\Models\Location::first()->id,
                'batch_id' => $batch->id,
                'quantity' => rand(10, 100),
                'minimum_quantity' => rand(1, 15),
            ]);
        });

        // Packaging Material Products
        Product::factory()->count(10)->create()->each(function ($product) use ($service, $productTypes) {
            $product->suppliers()->attach(\App\Models\Supplier::inRandomOrder()->first());
            $product->productType()->associate($productTypes['1']); // Primary Packaging Material
            $product->brand_name = 'Brand ' . $product->name;
            $product->scientific_name = 'Scientific ' . $product->name;
            $product->unit = 'pcs'; // Assuming unit is 'pcs' for packaging materials
            $product->sku = 'PP' . rand(1000, 9999); // Generate a random SKU
            $product->save();

            // Create a default batch for each product
            $batch = \App\Models\Batch::factory()->create([
                'product_id' => $product->id,
                'batch_number' => '25' . 'PP' . $product->sku,
                'expiry_date' => now()->addYear(),
            ]);
            // Create initial stock for each product
            $service->createInitialStock($product, [
                'location_id' => \App\Models\Location::first()->id,
                'batch_id' => $batch->id,
                'quantity' => rand(10, 100),
                'minimum_quantity' => rand(1, 15),
            ]);
        });
        // Product::factory()->count(10)->create()->each(function ($product) use ($service, $productTypes) {
        //     $product->suppliers()->attach(\App\Models\Supplier::inRandomOrder()->first());
        //     $product->productType()->associate($productTypes[array_rand($productTypes)]);
        //     $product->save();

        //     // Create a default batch for each product
        //     $batch = \App\Models\Batch::factory()->create([
        //         'product_id' => $product->id,
        //         'batch_number' => '25' . $product->sku,
        //         'expiry_date' => now()->addYear(),
        //     ]);
        //     // Create initial stock for each product
        //     $service->createInitialStock($product, [
        //         'location_id' => \App\Models\Location::first()->id,
        //         'batch_id' => $batch->id,
        //         'quantity' => rand(10, 100),
        //         'minimum_quantity' => rand(1, 15),
        //     ]);
        // });
    }
}
