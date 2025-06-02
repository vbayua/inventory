<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
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

        Product::factory()->count(10)->create([
            'location_id' => 1, // Assuming the first location is the main one
        ]);
    }
}
