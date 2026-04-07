<?php

declare(strict_types=1);

namespace App\DTO;

use App\Models\Batch;
use App\Models\Location;
use App\Models\Stock;
use App\Models\Supplier;
use ArrayAccess;

/**
 * Immutable value object that carries all stock-related input data through
 * StockOperationService. Replaces the loosely-typed array that was previously
 * threaded through every method.
 *
 * Implements ArrayAccess so that internal service code that still uses
 * $stockData['key'] notation continues to work without modification.
 * The DTO is intentionally immutable – use with() to produce a modified copy.
 */
readonly class StockData implements ArrayAccess
{
    public function __construct(
        public int $location_id,

        /** Primary key of an existing Stock row, when the record already exists. */
        public ?int $id = null,

        /** Batch this stock entry is associated with. */
        public ?int $batch_id = null,

        /** Supplier linked to the operation (used for initial/inbound stock). */
        public ?int $supplier_id = null,

        /** Unit name for the quantity being operated on (e.g. 'kg', 'pcs'). */
        public string $unit,

        /** Quantity involved in the operation. */
        public float $quantity,

        /** Threshold below which the stock is considered low. */
        public ?float $minimum_quantity = 0,

        /**
         * Date string (Y-m-d or any Carbon-parseable value) of the operation.
         * Null defaults to "now" inside the service.
         */
        public ?string $date = null,

        /** Free-form remarks or notes attached to the stock entry. */
        public ?string $remarks = null,

        /**
         * When true, the service calculates quantity from container units
         * rather than raw quantity units.
         */
        public bool $with_container = false,

        /** How many base units one container holds (e.g. 1 drum = 200 L). */
        public ?float $container_capacity = null,

        /** Unit name for the container (e.g. 'drum', 'pallet'). */
        public ?string $container_unit = null,

        public ?int $user_id = null,
    ) {}

    // -------------------------------------------------------------------------
    // Static factories
    // -------------------------------------------------------------------------

    /**
     * Build a StockData from a plain associative array (the previous convention).
     * Only `location_id` is strictly required; everything else falls back to a
     * sensible default.
     *
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        if (! isset($data['location_id'])) {
            throw new \InvalidArgumentException('StockData requires a location_id.');
        }

        if (! isset($data['quantity'])) {
            throw new \InvalidArgumentException('StockData requires a quantity.');
        }

        if (! isset($data['unit'])) {
            throw new \InvalidArgumentException('StockData requires a unit.');
        }

        $batch = isset($data['batch_id']) ? ($data['batch_id'] instanceof Batch ? $data['batch_id']->id : $data['batch_id']) : null;
        $location = isset($data['location_id']) ? ($data['location_id'] instanceof Location ? $data['location_id']->id : $data['location_id']) : null;
        $supplier = isset($data['supplier_id']) ? ($data['supplier_id'] instanceof Supplier ? $data['supplier_id']->id : $data['supplier_id']) : null;

        return new self(
            location_id: (int) $location,
            id: isset($data['id']) ? (int) $data['id'] : null,
            batch_id: (int) $batch,
            supplier_id: (int) $supplier,
            unit: isset($data['unit']) ? (string) $data['unit'] : null,
            quantity: isset($data['quantity']) ? (float) $data['quantity'] : 0.0,
            minimum_quantity: isset($data['minimum_quantity']) ? (float) $data['minimum_quantity'] : 0.0,
            date: isset($data['date']) ? (string) $data['date'] : null,
            remarks: isset($data['remarks']) ? (string) $data['remarks'] : null,
            with_container: (bool) ($data['with_container'] ?? false),
            container_capacity: isset($data['container_capacity']) ? (float) $data['container_capacity'] : null,
            container_unit: isset($data['container_unit']) ? (string) $data['container_unit'] : null,
            user_id: isset($data['user_id']) ? (int) $data['user_id'] : null,
        );
    }

    /**
     * Derive a StockData from an existing Stock Eloquent model.
     * Useful when internal service helpers need to forward a Stock instance
     * as typed StockData to another private method.
     */
    public static function fromStock(Stock $stock): self
    {
        if (! isset($stock->location_id)) {
            throw new \InvalidArgumentException('StockData requires a location_id.');
        }

        if (! isset($stock->quantity)) {
            throw new \InvalidArgumentException('StockData requires a quantity.');
        }

        if (! isset($stock->unit)) {
            throw new \InvalidArgumentException('StockData requires a unit.');
        }
        return new self(
            location_id: (int) $stock->location_id,
            id: (int) $stock->id,
            batch_id: $stock->batch_id !== null ? (int) $stock->batch_id : null,
            supplier_id: null,
            unit: $stock->unit !== null ? (string) $stock->unit : null,
            quantity: (float) $stock->quantity,
            minimum_quantity: (float) ($stock->minimum_quantity ?? 0.0),
            date: null,
            remarks: $stock->remarks !== null ? (string) $stock->remarks : null,
            with_container: false,
            container_capacity: $stock->container_capacity !== null ? (float) $stock->container_capacity : null,
            container_unit: $stock->container_unit !== null ? (string) $stock->container_unit : null,
            user_id: $stock->user_id !== null ? (int) $stock->user_id : null,
        );
    }

    // -------------------------------------------------------------------------
    // Wither – produces a modified immutable copy
    // -------------------------------------------------------------------------

    /**
     * Return a new StockData instance with the supplied fields overridden.
     * All other fields are carried over from the current instance unchanged.
     *
     * Example:
     *   $stockData = $stockData->with(['batch_id' => 42]);
     *
     * @param  array<string, mixed>  $overrides
     */
    public function with(array $overrides): self
    {
        return new self(
            location_id: isset($overrides['location_id'])
                ? (int) $overrides['location_id']
                : $this->location_id,

            id: array_key_exists('id', $overrides)
                ? ($overrides['id'] !== null ? (int) $overrides['id'] : null)
                : $this->id,

            batch_id: array_key_exists('batch_id', $overrides)
                ? ($overrides['batch_id'] !== null ? (int) $overrides['batch_id'] : null)
                : $this->batch_id,

            supplier_id: array_key_exists('supplier_id', $overrides)
                ? ($overrides['supplier_id'] !== null ? (int) $overrides['supplier_id'] : null)
                : $this->supplier_id,

            unit: array_key_exists('unit', $overrides)
                ? ($overrides['unit'] !== null ? (string) $overrides['unit'] : null)
                : $this->unit,

            quantity: isset($overrides['quantity'])
                ? (float) $overrides['quantity']
                : $this->quantity,

            minimum_quantity: isset($overrides['minimum_quantity'])
                ? (float) $overrides['minimum_quantity']
                : $this->minimum_quantity,

            date: array_key_exists('date', $overrides)
                ? ($overrides['date'] !== null ? (string) $overrides['date'] : null)
                : $this->date,

            remarks: array_key_exists('remarks', $overrides)
                ? ($overrides['remarks'] !== null ? (string) $overrides['remarks'] : null)
                : $this->remarks,

            with_container: isset($overrides['with_container'])
                ? (bool) $overrides['with_container']
                : $this->with_container,

            container_capacity: array_key_exists('container_capacity', $overrides)
                ? ($overrides['container_capacity'] !== null ? (float) $overrides['container_capacity'] : null)
                : $this->container_capacity,

            container_unit: array_key_exists('container_unit', $overrides)
                ? ($overrides['container_unit'] !== null ? (string) $overrides['container_unit'] : null)
                : $this->container_unit,
        );
    }

    // -------------------------------------------------------------------------
    // ArrayAccess – backward-compatible array-notation read access
    // -------------------------------------------------------------------------

    /**
     * Returns true only when the property both exists and is non-null,
     * matching the isset() / ?? semantics callers relied on with plain arrays.
     */
    public function offsetExists(mixed $offset): bool
    {
        return property_exists($this, (string) $offset) && $this->{$offset} !== null;
    }

    /** Read a property via $stockData['key'] notation. */
    public function offsetGet(mixed $offset): mixed
    {
        if (! property_exists($this, (string) $offset)) {
            return null;
        }

        return $this->{$offset};
    }

    /** StockData is immutable – mutation via array notation is not permitted. */
    public function offsetSet(mixed $offset, mixed $value): void
    {
        throw new \RuntimeException(
            sprintf('StockData is immutable. Use with([\'%s\' => $value]) to create a modified copy.', $offset)
        );
    }

    /** StockData is immutable – unsetting via array notation is not permitted. */
    public function offsetUnset(mixed $offset): void
    {
        throw new \RuntimeException(
            sprintf('StockData is immutable. Use with([\'%s\' => null]) to create a modified copy.', $offset)
        );
    }

    // -------------------------------------------------------------------------
    // Convenience helpers
    // -------------------------------------------------------------------------

    /**
     * Export the DTO back to a plain associative array.
     * Handy for logging, testing, or bridging legacy code paths.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id'                 => $this->id,
            'location_id'        => $this->location_id,
            'batch_id'           => $this->batch_id,
            'supplier_id'        => $this->supplier_id,
            'unit'               => $this->unit,
            'quantity'           => $this->quantity,
            'minimum_quantity'   => $this->minimum_quantity,
            'date'               => $this->date,
            'remarks'            => $this->remarks,
            'with_container'     => $this->with_container,
            'container_capacity' => $this->container_capacity,
            'container_unit'     => $this->container_unit,
            'user_id'            => $this->user_id,
        ];
    }
}
