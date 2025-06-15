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

        Product::factory()->count(10)->create()->each(function ($product) {
            $product->suppliers()->attach(\App\Models\Supplier::inRandomOrder()->first());

            // Create initial stock for each product
            (new StockOperationService)->createInitialStock($product, [
                'location_id' => \App\Models\Location::first()->id,
                'batch_id' => null,
                'quantity' => rand(10, 100),
            ]);
        });
    }
}
