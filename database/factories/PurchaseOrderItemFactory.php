<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseOrderItem>
 */
class PurchaseOrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'purchase_order_id' => PurchaseOrder::factory(),
            'product_id' => Product::factory(),
            'quantity' => $this->faker->numberBetween(1, 100),
            'price' => $this->faker->randomFloat(2, 1, 1000),
            'quantity_received' => 0,
        ];
    }
}
