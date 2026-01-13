<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Location::create([
            'name' => 'Default Raw Material Location',
            'warehouse_id' => \App\Models\Warehouse::where('name', 'Raw Material Warehouse')->first()->id,
        ]);
        \App\Models\Location::create([
            'name' => 'Default Finished Goods Location',
            'warehouse_id' => \App\Models\Warehouse::where('name', 'Finished Goods Warehouse')->first()->id,
        ]);
        \App\Models\Location::create([
            'name' => 'Default Packaging Material Location',
            'warehouse_id' => \App\Models\Warehouse::where('name', 'Packaging Material Warehouse')->first()->id,
        ]);
    }
}
