<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Category::create([
            'name' => 'Aromatics',
            'slug' => 'aromatics',
        ]);
        \App\Models\Category::create([
            'name' => 'Emollients',
            'slug' => 'emollients',
        ]);
        \App\Models\Category::create([
            'name' => 'Surfactants',
            'slug' => 'surfactants',
        ]);
        \App\Models\Category::create([
            'name' => 'Preservatives',
            'slug' => 'preservatives',
        ]);
        \App\Models\Category::create([
            'name' => 'Humectants',
            'slug' => 'humectants',
        ]);
        \App\Models\Category::create([
            'name' => 'Emulsifiers',
            'slug' => 'emulsifiers',
        ]);
        \App\Models\Category::create([
            'name' => 'Thickeners',
            'slug' => 'thickeners',
        ]);
        \App\Models\Category::create([
            'name' => 'Essential Oils',
            'slug' => 'essential-oils',
        ]);
        \App\Models\Category::create([
            'name' => 'Colorants',
            'slug' => 'colorants',
        ]);
        \App\Models\Category::create([
            'name' => 'Fragrance Oils',
            'slug' => 'fragrance-oils',
        ]);
        \App\Models\Category::create([
            'name' => 'Active Ingredients',
            'slug' => 'active-ingredients',
        ]);
    }
}
