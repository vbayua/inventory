<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Unit::upsert([
            ['name' => 'ml', 'conversion_to_base' => 1, 'base_unit' => 'ml', 'unit_type' => 'volume'],
            ['name' => 'liter', 'conversion_to_base' => 1000, 'base_unit' => 'ml', 'unit_type' => 'volume'],
            ['name' => 'gallon', 'conversion_to_base' => 3785.41, 'base_unit' => 'ml', 'unit_type' => 'volume'],
            ['name' => 'kg', 'conversion_to_base' => 1000, 'base_unit' => 'g', 'unit_type' => 'weight'],
            ['name' => 'g', 'conversion_to_base' => 1, 'base_unit' => 'g', 'unit_type' => 'weight'],
            ['name' => 'bottle', 'conversion_to_base' => 1, 'base_unit' => 'item', 'unit_type' => 'item'],
            ['name' => 'box', 'conversion_to_base' => 1, 'base_unit' => 'item', 'unit_type' => 'item'],
            ['name' => 'drum', 'conversion_to_base' => 1, 'base_unit' => 'item', 'unit_type' => 'item'],
            ['name' => 'pcs', 'conversion_to_base' => 1, 'base_unit' => 'item', 'unit_type' => 'item'],
        ], ['name'], ['conversion_to_base', 'base_unit', 'unit_type']);
    }
}
