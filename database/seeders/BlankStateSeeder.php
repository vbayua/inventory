<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BlankStateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            \Database\Seeders\UnitSeeder::class,
            \Database\Seeders\ProductTypeSeeder::class,
            \Database\Seeders\CategorySeeder::class,
            \Database\Seeders\PartnerSeeder::class,
            \Database\Seeders\WarehouseSeeder::class,
            \Database\Seeders\LocationSeeder::class,
            \Database\Seeders\UserSeeder::class,
            \Database\Seeders\AuthorizationSeeder::class,
        ]);
    }
}
