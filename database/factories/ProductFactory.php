<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->text(10),
            'sku' => fake()->unique()->word(),
            'unit' => fake()->randomElement(['kg', 'g', 'l', 'ml', 'pcs']),
            'price' => fake()->randomFloat(2, 1, 1000),
        ];
    }
}
