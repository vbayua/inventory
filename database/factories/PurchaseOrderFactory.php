<?php

namespace Database\Factories;

use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'po_number' => 'PO-' . $this->faker->unique()->numberBetween(1000, 9999),
            'supplier_id' => Supplier::factory(),
            'warehouse_id' => Warehouse::factory(),
            'order_date' => $this->faker->date(),
            'expected_delivery_date' => $this->faker->date(),
            'status' => 'pending',
            'notes' => $this->faker->sentence(),
        ];
    }
}
