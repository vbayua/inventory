<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Warehouse::factory()->create([
            'name' => 'Raw Material Warehouse',
        ]);
        Warehouse::factory()->create([
            'name' => 'Finished Goods Warehouse',
        ]);
        Warehouse::factory()->create([
            'name' => 'Packaging Material Warehouse',
        ]);
    }
}
