<?php

use App\Models\Batch;
use App\Models\Location;
use App\Models\Operation;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\ReceiveOrder;
use App\Models\ReceiveOrderItem;
use App\Models\Stock;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use App\Service\BatchAssignmentService;
use App\Service\StockOperationService;
use Database\Seeders\BlankStateSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);
    $this->service = app(StockOperationService::class);
    $this->batchService = app(BatchAssignmentService::class);
});

// ---------------------------------------------------------------------------
// Helper: create a full PO with items ready for testing
// ---------------------------------------------------------------------------
function createPurchaseOrderWithItems(
    ?Supplier $supplier = null,
    int $itemCount = 2,
    int $quantityPerItem = 50,
): array {
    $supplier ??= Supplier::factory()->create();

    $products = collect();
    $itemsPayload = [];

    for ($i = 0; $i < $itemCount; $i++) {
        $product = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
        $products->push($product);
        $itemsPayload[] = [
            'product_id' => $product->id,
            'quantity' => $quantityPerItem,
            'price' => fake()->randomFloat(2, 10, 500),
        ];
    }

    return [
        'supplier' => $supplier,
        'products' => $products,
        'itemsPayload' => $itemsPayload,
        'poPayload' => [
            'po_number' => 'PO-' . fake()->unique()->numberBetween(1000, 9999),
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'expected_delivery_date' => now()->addDays(7)->toDateString(),
            'notes' => 'Test purchase order',
            'items' => $itemsPayload,
        ],
    ];
}

// ===========================================================================
// SECTION 1: Managing Purchase Orders (CRUD + Status)
// ===========================================================================
describe('Purchase Order Management', function () {

    // -----------------------------------------------------------------------
    // Authorization
    // -----------------------------------------------------------------------
    describe('Authorization', function () {
        test('admin can view purchase orders index', function () {
            asAdmin()
                ->get(route('purchase-orders.index'))
                ->assertOk();
        });

        test('admin can access create purchase order page', function () {
            asAdmin()
                ->get(route('purchase-orders.create'))
                ->assertOk();
        });

        test('user without permissions cannot view purchase orders', function () {
            asNoRole()
                ->get(route('purchase-orders.index'))
                ->assertForbidden();
        });

        test('user without permissions cannot create purchase order', function () {
            asNoRole()
                ->post(route('purchase-orders.store'), [])
                ->assertForbidden();
        });
    });

    // -----------------------------------------------------------------------
    // Creating Purchase Orders
    // -----------------------------------------------------------------------
    describe('Creating Purchase Orders', function () {
        test('admin can create a purchase order with items', function () {
            $setup = createPurchaseOrderWithItems();

            asAdmin()
                ->post(route('purchase-orders.store'), $setup['poPayload'])
                ->assertRedirect(route('purchase-orders.index'))
                ->assertSessionHas('success');

            assertDatabaseHas('purchase_orders', [
                'po_number' => $setup['poPayload']['po_number'],
                'supplier_id' => $setup['supplier']->id,
                'status' => 'pending',
            ]);

            // Verify all line items were created
            $po = PurchaseOrder::where('po_number', $setup['poPayload']['po_number'])->first();
            expect($po->items)->toHaveCount(count($setup['itemsPayload']));

            $poItems = $po->items()->get();
            $poItems
                ->each(fn ($item) => expect($item)->toBeInstanceOf(PurchaseOrderItem::class))
                ->each(fn ($item) => expect($item->quantity_received)->toBe(0));

            assertDatabaseCount('purchase_order_items', count($setup['itemsPayload']));

            // foreach ($setup['itemsPayload'] as $itemData) {
            //     assertDatabaseHas('purchase_order_items', [
            //         'purchase_order_id' => $po->id,
            //         'product_id' => $itemData['product_id'],
            //         'quantity' => $itemData['quantity'],
            //         'price' => $itemData['price'],
            //         'quantity_received' => 0,
            //     ]);
            // }
        });

        test('purchase order defaults to pending status on creation', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);

            asAdmin()->post(route('purchase-orders.store'), $setup['poPayload']);

            $po = PurchaseOrder::where('po_number', $setup['poPayload']['po_number'])->first();
            expect($po->status)->toBe('pending');
        });

        test('po_number must be unique', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);

            asAdmin()->post(route('purchase-orders.store'), $setup['poPayload']);

            // Try to create another PO with the same number
            $setup2 = createPurchaseOrderWithItems(itemCount: 1);
            $setup2['poPayload']['po_number'] = $setup['poPayload']['po_number'];

            asAdmin()
                ->post(route('purchase-orders.store'), $setup2['poPayload'])
                ->assertSessionHasErrors('po_number');
        });
    });

    // -----------------------------------------------------------------------
    // Validation
    // -----------------------------------------------------------------------
    describe('Validation', function () {
        test('purchase order requires po_number', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);
            unset($setup['poPayload']['po_number']);

            asAdmin()
                ->post(route('purchase-orders.store'), $setup['poPayload'])
                ->assertSessionHasErrors('po_number');
        });

        test('purchase order requires supplier_id', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);
            unset($setup['poPayload']['supplier_id']);

            asAdmin()
                ->post(route('purchase-orders.store'), $setup['poPayload'])
                ->assertSessionHasErrors('supplier_id');
        });

        test('purchase order requires order_date', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);
            unset($setup['poPayload']['order_date']);

            asAdmin()
                ->post(route('purchase-orders.store'), $setup['poPayload'])
                ->assertSessionHasErrors('order_date');
        });

        test('purchase order requires at least one item', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);
            $setup['poPayload']['items'] = [];

            asAdmin()
                ->post(route('purchase-orders.store'), $setup['poPayload'])
                ->assertSessionHasErrors('items');
        });

        test('each item requires product_id, quantity, and price', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);
            $setup['poPayload']['items'] = [
                [
                    // Missing product_id, quantity, price
                ],
            ];

            asAdmin()
                ->post(route('purchase-orders.store'), $setup['poPayload'])
                ->assertSessionHasErrors([
                    'items.0.product_id',
                    'items.0.quantity',
                    'items.0.price',
                ]);
        });

        test('item quantity must be at least 1', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);
            $setup['poPayload']['items'][0]['quantity'] = 0;

            asAdmin()
                ->post(route('purchase-orders.store'), $setup['poPayload'])
                ->assertSessionHasErrors('items.0.quantity');
        });

        test('item price must be non-negative', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);
            $setup['poPayload']['items'][0]['price'] = -10;

            asAdmin()
                ->post(route('purchase-orders.store'), $setup['poPayload'])
                ->assertSessionHasErrors('items.0.price');
        });

        test('supplier_id must exist in database', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);
            $setup['poPayload']['supplier_id'] = 99999;

            asAdmin()
                ->post(route('purchase-orders.store'), $setup['poPayload'])
                ->assertSessionHasErrors('supplier_id');
        });


    });

    // -----------------------------------------------------------------------
    // Viewing Purchase Orders
    // -----------------------------------------------------------------------
    describe('Viewing Purchase Orders', function () {
        test('admin can view a single purchase order', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);
            asAdmin()->post(route('purchase-orders.store'), $setup['poPayload']);

            $po = PurchaseOrder::where('po_number', $setup['poPayload']['po_number'])->first();

            asAdmin()
                ->get(route('purchase-orders.show', $po))
                ->assertOk();
        });

        test('purchase order show loads items, supplier, and location', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 2);
            asAdmin()->post(route('purchase-orders.store'), $setup['poPayload']);

            $po = PurchaseOrder::where('po_number', $setup['poPayload']['po_number'])->first();
            $po->load('items.product', 'supplier', 'location');

            expect($po->items)->toHaveCount(2);
            expect($po->supplier)->not->toBeNull();
            expect($po->location)->not->toBeNull();
        });
    });

    // -----------------------------------------------------------------------
    // Status Transitions
    // -----------------------------------------------------------------------
    describe('Status Transitions', function () {
        test('new purchase order has pending status', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);
            asAdmin()->post(route('purchase-orders.store'), $setup['poPayload']);

            $po = PurchaseOrder::where('po_number', $setup['poPayload']['po_number'])->first();

            expect($po->status)->toBe('pending');
        });

        test('purchase order status can be updated to cancelled', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);
            asAdmin()->post(route('purchase-orders.store'), $setup['poPayload']);

            $po = PurchaseOrder::where('po_number', $setup['poPayload']['po_number'])->first();
            $po->update(['status' => 'cancelled']);
            $po->refresh();

            expect($po->status)->toBe('cancelled');
        });

        test('purchase order tracks all valid statuses', function () {
            $validStatuses = ['pending', 'partially_received', 'received', 'cancelled'];

            $setup = createPurchaseOrderWithItems(itemCount: 1);
            asAdmin()->post(route('purchase-orders.store'), $setup['poPayload']);

            $po = PurchaseOrder::where('po_number', $setup['poPayload']['po_number'])->first();

            foreach ($validStatuses as $status) {
                $po->update(['status' => $status]);
                $po->refresh();
                expect($po->status)->toBe($status);
            }
        });
    });

    // -----------------------------------------------------------------------
    // Relationships
    // -----------------------------------------------------------------------
    describe('Relationships', function () {
        test('purchase order belongs to a supplier', function () {
            $supplier = Supplier::factory()->create();
            $location = Location::factory()->create();

            $setup = createPurchaseOrderWithItems(supplier: $supplier, location: $location, itemCount: 1);
            asAdmin()->post(route('purchase-orders.store'), $setup['poPayload']);

            $po = PurchaseOrder::where('po_number', $setup['poPayload']['po_number'])->first();

            expect($po->supplier)->toBeInstanceOf(Supplier::class);
            expect($po->supplier->id)->toBe($supplier->id);
        });

        test('purchase order belongs to a location', function () {
            $location = Location::factory()->create();

            $setup = createPurchaseOrderWithItems(location: $location, itemCount: 1);
            asAdmin()->post(route('purchase-orders.store'), $setup['poPayload']);

            $po = PurchaseOrder::where('po_number', $setup['poPayload']['po_number'])->first();

            expect($po->location)->toBeInstanceOf(Location::class);
            expect($po->location->id)->toBe($location->id);
        });

        test('purchase order has many items', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 3);
            asAdmin()->post(route('purchase-orders.store'), $setup['poPayload']);

            $po = PurchaseOrder::where('po_number', $setup['poPayload']['po_number'])->first();

            expect($po->items)->toHaveCount(3);
            expect($po->items->first())->toBeInstanceOf(PurchaseOrderItem::class);
        });

        test('purchase order has many receive orders', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);
            asAdmin()->post(route('purchase-orders.store'), $setup['poPayload']);

            $po = PurchaseOrder::where('po_number', $setup['poPayload']['po_number'])->first();

            expect($po->receiveOrders)->toBeEmpty();
            expect($po->receiveOrders())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
        });

        test('purchase order item belongs to a product', function () {
            $setup = createPurchaseOrderWithItems(itemCount: 1);
            asAdmin()->post(route('purchase-orders.store'), $setup['poPayload']);

            $po = PurchaseOrder::where('po_number', $setup['poPayload']['po_number'])->first();
            $poItem = $po->items->first();

            expect($poItem->product)->toBeInstanceOf(Product::class);
            expect($poItem->product->id)->toBe($setup['products']->first()->id);
        });
    });
});

// ===========================================================================
// SECTION 2: Receiving Purchase Orders
// ===========================================================================
describe('Receiving Purchase Orders', function () {

    // -----------------------------------------------------------------------
    // Helper: create a persisted PO with items in the database
    // -----------------------------------------------------------------------
    function createPersistedPO(int $itemCount = 2, int $qty = 50): array
    {
        $setup = createPurchaseOrderWithItems(itemCount: $itemCount, quantityPerItem: $qty);
        asAdmin()->post(route('purchase-orders.store'), $setup['poPayload']);
        $po = PurchaseOrder::where('po_number', $setup['poPayload']['po_number'])->with('items')->first();

        return [...$setup, 'po' => $po];
    }

    // -----------------------------------------------------------------------
    // Receive Order Model & Relationships
    // -----------------------------------------------------------------------
    describe('Receive Order model relationships', function () {
        test('receive order belongs to a purchase order', function () {
            $data = createPersistedPO(itemCount: 1);
            $po = $data['po'];

            $receiveOrder = ReceiveOrder::create([
                'purchase_order_id' => $po->id,
                'receive_number' => 'RCV-0001',
                'receive_date' => now()->toDateString(),
                'notes' => 'Test receive',
            ]);

            expect($receiveOrder->purchaseOrder)->toBeInstanceOf(PurchaseOrder::class);
            expect($receiveOrder->purchaseOrder->id)->toBe($po->id);
        });

        test('receive order has many receive order items', function () {
            $data = createPersistedPO(itemCount: 2);
            $po = $data['po'];

            $receiveOrder = ReceiveOrder::create([
                'purchase_order_id' => $po->id,
                'receive_number' => 'RCV-0002',
                'receive_date' => now()->toDateString(),
            ]);

            foreach ($po->items as $poItem) {
                ReceiveOrderItem::create([
                    'receive_order_id' => $receiveOrder->id,
                    'purchase_order_item_id' => $poItem->id,
                    'quantity_received' => 10,
                ]);
            }

            $receiveOrder->load('receiveOrderItems');
            expect($receiveOrder->receiveOrderItems)->toHaveCount(2);
        });

        test('receive order item belongs to a purchase order item', function () {
            $data = createPersistedPO(itemCount: 1);
            $po = $data['po'];

            $receiveOrder = ReceiveOrder::create([
                'purchase_order_id' => $po->id,
                'receive_number' => 'RCV-0003',
                'receive_date' => now()->toDateString(),
            ]);

            $roItem = ReceiveOrderItem::create([
                'receive_order_id' => $receiveOrder->id,
                'purchase_order_item_id' => $po->items->first()->id,
                'quantity_received' => 25,
            ]);

            expect($roItem->purchaseOrderItem)->toBeInstanceOf(PurchaseOrderItem::class);
            expect($roItem->purchaseOrderItem->id)->toBe($po->items->first()->id);
        });
    });

    // -----------------------------------------------------------------------
    // PO Item quantity tracking
    // -----------------------------------------------------------------------
    describe('PO Item quantity tracking', function () {
        test('purchase order item tracks quantity_received via receive order items', function () {
            $data = createPersistedPO(itemCount: 1, qty: 100);
            $po = $data['po'];
            $poItem = $po->items->first();

            $receiveOrder = ReceiveOrder::create([
                'purchase_order_id' => $po->id,
                'receive_number' => 'RCV-0010',
                'receive_date' => now()->toDateString(),
            ]);

            ReceiveOrderItem::create([
                'receive_order_id' => $receiveOrder->id,
                'purchase_order_item_id' => $poItem->id,
                'quantity_received' => 40,
            ]);

            // The accessor sums from related receive_order_items
            expect($poItem->quantity_received)->toBe(40);
            expect($poItem->remaining_quantity)->toBe(60);
        });

        test('purchase order item remaining_quantity is never negative', function () {
            $data = createPersistedPO(itemCount: 1, qty: 20);
            $po = $data['po'];
            $poItem = $po->items->first();

            $receiveOrder = ReceiveOrder::create([
                'purchase_order_id' => $po->id,
                'receive_number' => 'RCV-0011',
                'receive_date' => now()->toDateString(),
            ]);

            // Receive more than ordered (edge case)
            ReceiveOrderItem::create([
                'receive_order_id' => $receiveOrder->id,
                'purchase_order_item_id' => $poItem->id,
                'quantity_received' => 30,
            ]);

            expect($poItem->remaining_quantity)->toBe(0);
        });

        test('multiple receive orders accumulate quantity_received for a PO item', function () {
            $data = createPersistedPO(itemCount: 1, qty: 100);
            $po = $data['po'];
            $poItem = $po->items->first();

            // First partial receive
            $ro1 = ReceiveOrder::create([
                'purchase_order_id' => $po->id,
                'receive_number' => 'RCV-0012',
                'receive_date' => now()->toDateString(),
            ]);
            ReceiveOrderItem::create([
                'receive_order_id' => $ro1->id,
                'purchase_order_item_id' => $poItem->id,
                'quantity_received' => 30,
            ]);

            // Second partial receive
            $ro2 = ReceiveOrder::create([
                'purchase_order_id' => $po->id,
                'receive_number' => 'RCV-0013',
                'receive_date' => now()->addDay()->toDateString(),
            ]);
            ReceiveOrderItem::create([
                'receive_order_id' => $ro2->id,
                'purchase_order_item_id' => $poItem->id,
                'quantity_received' => 25,
            ]);

            expect($poItem->quantity_received)->toBe(55);
            expect($poItem->remaining_quantity)->toBe(45);
        });
    });

    // -----------------------------------------------------------------------
    // receiveStore controller action
    // (Note: route must be registered; tests are marked ->todo() if route is missing)
    // -----------------------------------------------------------------------
    describe('receiveStore endpoint', function () {
        // TODO: Register the receive routes in web.php, e.g.:
        //   Route::get('/{purchase_order}/receive', [PurchaseOrderController::class, 'receive'])->name('purchase-orders.receive');
        //   Route::post('/{purchase_order}/receive', [PurchaseOrderController::class, 'receiveStore'])->name('purchase-orders.receiveStore');

        test('full receive updates PO status to received', function () {
            $data = createPersistedPO(itemCount: 2, qty: 50);
            $po = $data['po'];

            $receivePayload = [
                'items' => $po->items->map(fn ($item) => [
                    'purchase_order_item_id' => $item->id,
                    'quantity_received' => $item->quantity, // receive everything
                ])->toArray(),
            ];

            asAdmin()
                ->post(route('purchase-orders.receiveStore', $po), $receivePayload)
                ->assertRedirect(route('purchase-orders.show', $po))
                ->assertSessionHas('success');

            $po->refresh();
            expect($po->status)->toBe('received');
        })->todo();

        test('partial receive updates PO status to partially_received', function () {
            $data = createPersistedPO(itemCount: 1, qty: 100);
            $po = $data['po'];

            $receivePayload = [
                'items' => [
                    [
                        'purchase_order_item_id' => $po->items->first()->id,
                        'quantity_received' => 40, // partial
                    ],
                ],
            ];

            asAdmin()
                ->post(route('purchase-orders.receiveStore', $po), $receivePayload)
                ->assertRedirect(route('purchase-orders.show', $po));

            $po->refresh();
            expect($po->status)->toBe('partially_received');
        })->todo();

        test('receiving zero quantity does not change PO status', function () {
            $data = createPersistedPO(itemCount: 1, qty: 50);
            $po = $data['po'];

            $receivePayload = [
                'items' => [
                    [
                        'purchase_order_item_id' => $po->items->first()->id,
                        'quantity_received' => 0,
                    ],
                ],
            ];

            asAdmin()
                ->post(route('purchase-orders.receiveStore', $po), $receivePayload);

            $po->refresh();
            expect($po->status)->toBe('pending');
        })->todo();

        test('multiple partial receives eventually mark PO as received', function () {
            $data = createPersistedPO(itemCount: 1, qty: 100);
            $po = $data['po'];
            $poItem = $po->items->first();

            // First partial receive: 60 of 100
            asAdmin()->post(route('purchase-orders.receiveStore', $po), [
                'items' => [[
                    'purchase_order_item_id' => $poItem->id,
                    'quantity_received' => 60,
                ]],
            ]);

            $po->refresh();
            expect($po->status)->toBe('partially_received');

            // Second receive: remaining 40
            asAdmin()->post(route('purchase-orders.receiveStore', $po), [
                'items' => [[
                    'purchase_order_item_id' => $poItem->id,
                    'quantity_received' => 40,
                ]],
            ]);

            $po->refresh();
            expect($po->status)->toBe('received');
        })->todo();

        test('receiveStore validates items array is required and non-empty', function () {
            $data = createPersistedPO(itemCount: 1);
            $po = $data['po'];

            asAdmin()
                ->post(route('purchase-orders.receiveStore', $po), ['items' => []])
                ->assertSessionHasErrors('items');
        })->todo();

        test('receiveStore validates purchase_order_item_id exists', function () {
            $data = createPersistedPO(itemCount: 1);
            $po = $data['po'];

            asAdmin()
                ->post(route('purchase-orders.receiveStore', $po), [
                    'items' => [[
                        'purchase_order_item_id' => 99999,
                        'quantity_received' => 10,
                    ]],
                ])
                ->assertSessionHasErrors('items.0.purchase_order_item_id');
        })->todo();

        test('receiveStore validates quantity_received is non-negative integer', function () {
            $data = createPersistedPO(itemCount: 1);
            $po = $data['po'];

            asAdmin()
                ->post(route('purchase-orders.receiveStore', $po), [
                    'items' => [[
                        'purchase_order_item_id' => $po->items->first()->id,
                        'quantity_received' => -5,
                    ]],
                ])
                ->assertSessionHasErrors('items.0.quantity_received');
        })->todo();
    });
});

// ===========================================================================
// SECTION 3: Stock Creation and Update after Receiving an Order
// ===========================================================================
describe('Stock Creation and Update after Receiving', function () {

    // -----------------------------------------------------------------------
    // Helper: set up initial stock for a product at a location with a batch
    // -----------------------------------------------------------------------
    function setupInitialStock(
        StockOperationService $service,
        BatchAssignmentService $batchService,
        Product $product,
        Location $location,
        int $initialQty = 100,
    ): Stock {
        $supplier = $product->suppliers->first();
        $batchId = $batchService->determineBatch(
            product: $product,
            requestedBatchId: null,
            operationType: 'initial',
            operationDate: now(),
            supplierId: $supplier->id,
            minQty: 10
        );

        $stockData = [
            'product_id' => $product->id,
            'location_id' => $location->id,
            'warehouse_id' => $location->warehouse_id,
            'quantity' => $initialQty,
            'supplier_id' => $supplier->id,
            'batch_id' => $batchId,
            'minimum_quantity' => 10,
        ];

        $service->createInitialStock($product, $stockData);

        return Stock::where('product_id', $product->id)
            ->where('location_id', $location->id)
            ->where('batch_id', $batchId)
            ->firstOrFail();
    }

    // -----------------------------------------------------------------------
    // Inbound stock operations triggered by receiving
    // -----------------------------------------------------------------------
    describe('Inbound stock creation on receive', function () {
        test('receiving creates an inbound operation record', function () {
            $product = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
            $location = Location::factory()->create();
            $stock = setupInitialStock($this->service, $this->batchService, $product, $location, 100);

            $this->service->createInboundOperation(
                $stock->product,
                $stock,
                50,
                'pcs',
                'Received from PO #TEST-001',
                now()
            );

            assertDatabaseHas('operations', [
                'product_id' => $product->id,
                'location_id' => $location->id,
                'quantity' => 50,
                'operation_type' => 'inbound',
            ]);
        });

        test('receiving increments existing stock quantity', function () {
            $product = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
            $location = Location::factory()->create();
            $stock = setupInitialStock($this->service, $this->batchService, $product, $location, 100);

            $this->service->createInboundOperation(
                $stock->product,
                $stock,
                50,
                'pcs',
                'Received from PO #TEST-002',
                now()
            );

            $stock->refresh();
            expect($stock->quantity)->toBe(150.0);
        });

        test('multiple receives accumulate stock correctly', function () {
            $product = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
            $location = Location::factory()->create();
            $stock = setupInitialStock($this->service, $this->batchService, $product, $location, 100);

            // First receive
            $this->service->createInboundOperation($stock->product, $stock, 30, 'pcs', 'Receive #1');
            $stock->refresh();
            expect($stock->quantity)->toBe(130.0);

            // Second receive
            $this->service->createInboundOperation($stock->product, $stock, 20, 'pcs', 'Receive #2');
            $stock->refresh();
            expect($stock->quantity)->toBe(150.0);
        });

        test('each receive creates a separate operation record', function () {
            $product = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
            $location = Location::factory()->create();
            $stock = setupInitialStock($this->service, $this->batchService, $product, $location, 100);

            $this->service->createInboundOperation($stock->product, $stock, 30, 'pcs', 'Receive #1');
            $this->service->createInboundOperation($stock->product, $stock, 20, 'pcs', 'Receive #2');

            $operations = Operation::where('product_id', $product->id)
                ->where('operation_type', 'inbound')
                ->get();

            expect($operations)->toHaveCount(2);
            expect($operations->pluck('quantity')->sort()->values()->all())->toBe([20.0, 30.0]);
        });
    });

    // -----------------------------------------------------------------------
    // Stock status after receiving
    // -----------------------------------------------------------------------
    describe('Stock status updates', function () {
        test('stock status is available when quantity exceeds minimum', function () {
            $product = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
            $location = Location::factory()->create();
            $stock = setupInitialStock($this->service, $this->batchService, $product, $location, 100);

            $stock->refresh();
            expect($stock->status)->toBe('available');
        });

        test('stock status reflects correctly after inbound operation', function () {
            $product = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
            $location = Location::factory()->create();
            $stock = setupInitialStock($this->service, $this->batchService, $product, $location, 5);

            // Stock should be low initially (5 < minimum of 10)
            $stock->refresh();
            expect($stock->status)->toBe('low_stock');

            // After receiving enough to exceed minimum
            $this->service->createInboundOperation($stock->product, $stock, 50, 'pcs', 'Restocking');
            $stock->refresh();
            expect($stock->quantity)->toBe(55.0);
            expect($stock->status)->toBe('available');
        });
    });

    // -----------------------------------------------------------------------
    // End-to-end: PO → Receive → Stock
    // -----------------------------------------------------------------------
    describe('End-to-end PO receive to stock flow', function () {
        test('full flow: create PO, receive items, verify stock incremented', function () {
            // 1. Create product with initial stock
            $product = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
            $supplier = $product->suppliers->first();
            $location = Location::factory()->create();
            $stock = setupInitialStock($this->service, $this->batchService, $product, $location, 100);

            // 2. Create a purchase order
            $po = PurchaseOrder::create([
                'po_number' => 'PO-E2E-001',
                'supplier_id' => $supplier->id,
                'location_id' => $location->id,
                'order_date' => now()->toDateString(),
                'expected_delivery_date' => now()->addDays(7)->toDateString(),
                'status' => 'pending',
                'notes' => 'End-to-end test PO',
            ]);

            $poItem = $po->items()->create([
                'product_id' => $product->id,
                'quantity' => 50,
                'price' => 25.00,
                'quantity_received' => 0,
            ]);

            expect($po->status)->toBe('pending');

            // 3. Simulate receiving: create inbound stock operation
            $this->service->createInboundOperation(
                $product,
                $stock,
                50,
                'pcs',
                "Received from PO #{$po->po_number}"
            );

            // 4. Update PO item tracking
            $poItem->increment('quantity_received', 50);

            // 5. Update PO status
            $totalOrdered = $po->items->sum('quantity');
            $totalReceived = $po->items()->sum('quantity_received');

            if ($totalReceived >= $totalOrdered) {
                $po->update(['status' => 'received']);
            }

            // 6. Assert everything
            $stock->refresh();
            expect($stock->quantity)->toBe(150.0);

            $po->refresh();
            expect($po->status)->toBe('received');

            $poItem->refresh();
            expect($poItem->quantity_received)->toBe(50);

            assertDatabaseHas('operations', [
                'product_id' => $product->id,
                'location_id' => $location->id,
                'quantity' => 50,
                'operation_type' => 'inbound',
            ]);
        });

        test('full flow: partial receive across multiple deliveries', function () {
            $product = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
            $supplier = $product->suppliers->first();
            $location = Location::factory()->create();
            $stock = setupInitialStock($this->service, $this->batchService, $product, $location, 100);

            $po = PurchaseOrder::create([
                'po_number' => 'PO-E2E-002',
                'supplier_id' => $supplier->id,
                'location_id' => $location->id,
                'order_date' => now()->toDateString(),
                'status' => 'pending',
            ]);

            $poItem = $po->items()->create([
                'product_id' => $product->id,
                'quantity' => 80,
                'price' => 15.00,
                'quantity_received' => 0,
            ]);

            // --- Delivery 1: receive 30 of 80 ---
            $this->service->createInboundOperation($product, $stock, 30, 'pcs', "PO #{$po->po_number} delivery 1");
            $poItem->increment('quantity_received', 30);

            $po->update(['status' => 'partially_received']);
            $po->refresh();
            $stock->refresh();

            expect($po->status)->toBe('partially_received');
            expect($stock->quantity)->toBe(130.0);

            // --- Delivery 2: receive remaining 50 of 80 ---
            $this->service->createInboundOperation($product, $stock, 50, 'pcs', "PO #{$po->po_number} delivery 2");
            $poItem->increment('quantity_received', 50);

            $totalOrdered = $po->items->sum('quantity');
            $totalReceived = $po->items()->sum('quantity_received');

            if ($totalReceived >= $totalOrdered) {
                $po->update(['status' => 'received']);
            }

            $po->refresh();
            $stock->refresh();

            expect($po->status)->toBe('received');
            expect($stock->quantity)->toBe(180.0);
            expect($poItem->fresh()->quantity_received)->toBe(80);

            // Two inbound operations created
            $inboundOps = Operation::where('product_id', $product->id)
                ->where('operation_type', 'inbound')
                ->get();
            expect($inboundOps)->toHaveCount(2);
        });

        test('full flow: PO with multiple items, each partially received', function () {
            $product1 = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
            $product2 = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
            $supplier = Supplier::factory()->create();
            $location = Location::factory()->create();

            $stock1 = setupInitialStock($this->service, $this->batchService, $product1, $location, 50);
            $stock2 = setupInitialStock($this->service, $this->batchService, $product2, $location, 50);

            $po = PurchaseOrder::create([
                'po_number' => 'PO-E2E-003',
                'supplier_id' => $supplier->id,
                'location_id' => $location->id,
                'order_date' => now()->toDateString(),
                'status' => 'pending',
            ]);

            $poItem1 = $po->items()->create([
                'product_id' => $product1->id,
                'quantity' => 40,
                'price' => 10.00,
                'quantity_received' => 0,
            ]);

            $poItem2 = $po->items()->create([
                'product_id' => $product2->id,
                'quantity' => 60,
                'price' => 20.00,
                'quantity_received' => 0,
            ]);

            // Receive item 1 fully, item 2 partially
            $this->service->createInboundOperation($product1, $stock1, 40, 'pcs', 'Receive item 1');
            $poItem1->increment('quantity_received', 40);

            $this->service->createInboundOperation($product2, $stock2, 30, 'pcs', 'Receive item 2 partial');
            $poItem2->increment('quantity_received', 30);

            $totalOrdered = $po->items->sum('quantity');
            $totalReceived = $po->items()->sum('quantity_received');

            if ($totalReceived >= $totalOrdered) {
                $po->update(['status' => 'received']);
            } elseif ($totalReceived > 0) {
                $po->update(['status' => 'partially_received']);
            }

            $po->refresh();
            expect($po->status)->toBe('partially_received');

            $stock1->refresh();
            $stock2->refresh();
            expect($stock1->quantity)->toBe(90.0);
            expect($stock2->quantity)->toBe(80.0);

            // Now receive the rest of item 2
            $this->service->createInboundOperation($product2, $stock2, 30, 'pcs', 'Receive item 2 remainder');
            $poItem2->increment('quantity_received', 30);

            $totalReceived = $po->items()->sum('quantity_received');
            if ($totalReceived >= $totalOrdered) {
                $po->update(['status' => 'received']);
            }

            $po->refresh();
            $stock2->refresh();
            expect($po->status)->toBe('received');
            expect($stock2->quantity)->toBe(110.0);
        });
    });

    // -----------------------------------------------------------------------
    // Edge cases
    // -----------------------------------------------------------------------
    describe('Edge cases', function () {
        test('receiving does not affect stock of other products', function () {
            $product1 = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
            $product2 = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
            $location = Location::factory()->create();

            $stock1 = setupInitialStock($this->service, $this->batchService, $product1, $location, 100);
            $stock2 = setupInitialStock($this->service, $this->batchService, $product2, $location, 100);

            // Only receive for product 1
            $this->service->createInboundOperation($product1, $stock1, 50, 'pcs', 'Only product 1');

            $stock1->refresh();
            $stock2->refresh();

            expect($stock1->quantity)->toBe(150.0);
            expect($stock2->quantity)->toBe(100.0); // unchanged
        });

        test('receiving does not affect stock at other locations', function () {
            $product = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
            $location1 = Location::factory()->create();
            $location2 = Location::factory()->create();

            $stock1 = setupInitialStock($this->service, $this->batchService, $product, $location1, 100);
            $stock2 = setupInitialStock($this->service, $this->batchService, $product, $location2, 100);

            // Only receive at location 1
            $this->service->createInboundOperation($product, $stock1, 50, 'pcs', 'Location 1 only');

            $stock1->refresh();
            $stock2->refresh();

            expect($stock1->quantity)->toBe(150.0);
            expect($stock2->quantity)->toBe(100.0); // unchanged
        });

        test('product total stock aggregates across all locations', function () {
            $product = productWithSupplier(['unit' => 'pcs', 'product_type_id' => 2]);
            $location1 = Location::factory()->create();
            $location2 = Location::factory()->create();

            setupInitialStock($this->service, $this->batchService, $product, $location1, 100);
            setupInitialStock($this->service, $this->batchService, $product, $location2, 75);

            $product->refresh();
            $totalQty = $product->getAllStockQty();

            expect($totalQty)->toBe(175);
        });
    });
});
