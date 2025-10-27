<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use \App\Models\Warehouse;

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
