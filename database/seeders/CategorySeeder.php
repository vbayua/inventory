<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::factory()->create([
            'name' => 'Aromatics',
            'slug' => 'aromatics',
        ]);
        Category::factory()->create([
            'name' => 'Emollients',
            'slug' => 'emollients',
        ]);
        Category::factory()->create([
            'name' => 'Surfactants',
            'slug' => 'surfactants',
        ]);
        Category::factory()->create([
            'name' => 'Preservatives',
            'slug' => 'preservatives',
        ]);
        Category::factory()->create([
            'name' => 'Humectants',
            'slug' => 'humectants',
        ]);
        Category::factory()->create([
            'name' => 'Emulsifiers',
            'slug' => 'emulsifiers',
        ]);
        Category::factory()->create([
            'name' => 'Thickeners',
            'slug' => 'thickeners',
        ]);
        Category::factory()->create([
            'name' => 'Essential Oils',
            'slug' => 'essential-oils',
        ]);
        Category::factory()->create([
            'name' => 'Colorants',
            'slug' => 'colorants',
        ]);
        Category::factory()->create([
            'name' => 'Fragrance Oils',
            'slug' => 'fragrance-oils',
        ]);
        Category::factory()->create([
            'name' => 'Active Ingredients',
            'slug' => 'active-ingredients',
        ]);
    }
}
