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

        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);
        $service =  app(StockOperationService::class);

        Product::factory()->count(10)->create()->each(function ($product) use ($service) {
            $product->suppliers()->attach(\App\Models\Supplier::inRandomOrder()->first());

            // Create a default batch for each product
            $batch = \App\Models\Batch::factory()->create([
                'product_id' => $product->id,
                'batch_number' => '25' . $product->sku,
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
    }
}
