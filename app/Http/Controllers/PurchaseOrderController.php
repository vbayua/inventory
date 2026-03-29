<?php

namespace App\Http\Controllers;

use App\DTO\StockData;
use App\Http\Requests\ReceiveOrderStoreRequest;
use App\Http\Requests\StorePurchaseOrderRequest;
use App\Models\Batch;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\Location;
use App\Models\Product;
use App\Rules\Permissions\PurchaseOrderPermissions;
use App\Service\StockOperationService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(PurchaseOrder::class, 'purchase_order');
    }

    public function index(PurchaseOrderPermissions $permissions)
    {
        $purchaseOrders = PurchaseOrder::with('supplier:id,partner_id', 'supplier.partner:id,name')->latest()->get();
        return Inertia::render('PurchaseOrders/Index', [
            'purchaseOrders' => $purchaseOrders,
        ])->with($permissions);
    }

    public function create()
    {
        $suppliers = Supplier::with('partner:id,name', 'products:id,name,sku')->get();
        return Inertia::render('PurchaseOrders/Create', [
            'suppliers' => $suppliers,
            'products' => Product::all(),
        ]);
    }

    public function store(StorePurchaseOrderRequest $request)
    {
        // dd($request->all());
        $purchaseOrder = PurchaseOrder::create($request->except('items'));

        foreach ($request->items as $item) {
            $item['purchase_order_id'] = $purchaseOrder->id;
            $purchaseOrder->items()->create($item);
        }

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase order created successfully.');
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load('items', 'items.product:id,name,sku,unit', 'receive_orders', 'supplier:id,partner_id', 'supplier.partner:id,name');

        return Inertia::render('PurchaseOrders/Show', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function receive(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(
            'items:id,purchase_order_id,price,quantity,product_id',
            'items.product:id,name,sku,unit',
            'supplier',
            'items.receiveOrderItems'
        );

        $purchaseOrder->items->each(function ($item) {
            $item->quantity_received = $item->receiveOrderItems->sum('quantity_received');
        });

        // Filter batches based on the product IDs in the purchase order items
        $productIds = $purchaseOrder->items->pluck('product_id')->unique();
        $batches = Batch::whereIn('product_id', $productIds)->with('product')->get(['id', 'product_id', 'batch_number', 'expiry_date']);

        return Inertia::render('PurchaseOrders/Receive', [
            'purchaseOrder' => $purchaseOrder,
            'locations' => Location::all(),
            'batches' => $batches,
        ]);
    }

    public function receiveStore(ReceiveOrderStoreRequest $request, PurchaseOrder $purchaseOrder, StockOperationService $stockOperationService)
    {
        $receiveOrder = $request->validated();

        DB::transaction(function () use ($purchaseOrder, $receiveOrder, $stockOperationService) {
            $newReceiveOrder = $purchaseOrder->receive_orders()->create([
                'receive_number' => $receiveOrder['receive_order_number'],
                'reference_number' => $receiveOrder['reference_number'] ?? null,
                'receive_date' => Carbon::parse($receiveOrder['receive_date']),
                'notes' => $receiveOrder['notes'] ?? null,
            ]);

            foreach ($receiveOrder['items'] as $item) {
                $purchaseOrderItem = $purchaseOrder->items()->where('product_id', $item['product_id'])->first();

                if (!$purchaseOrderItem) {
                    continue; // Skip if the product is not part of the purchase order
                }

                $quantityToReceive = $item['quantity_received'];

                if ($quantityToReceive <= 0) {
                    continue; // Skip if there's nothing to receive
                }

                $newReceiveOrderItem = $purchaseOrderItem->receiveOrderItems()->create([
                    'receive_order_id' => $newReceiveOrder->id,
                    'quantity_received' => $quantityToReceive,
                    'location_id' => $item['location_id'],
                    'notes' => $item['notes'] ?? null,
                ]);

                // Update stock levels
                $stockData = StockData::fromArray([
                    'quantity' => $newReceiveOrderItem->quantity_received,
                    'unit' => $purchaseOrderItem->product->unit,
                    'location_id' => $item['location_id'],
                    'supplier_id' => $purchaseOrder->supplier_id,
                    'remarks' => 'Received via Purchase Order #' . $purchaseOrder->id,
                ]);

                $stockOperationService->createStockOperation(
                    'inbound',
                    $purchaseOrderItem->product,
                    $stockData,
                    $newReceiveOrderItem->quantity_received,
                    $stockData['unit'],
                    $stockData['remarks']
                );

                if ($purchaseOrderItem->quantity_received >= $purchaseOrderItem->quantity) {
                    $purchaseOrderItem->update(['status' => 'received']);
                } else {
                    $purchaseOrderItem->update(['status' => 'partially_received']);
                }
            }

            // Update the purchase order status based on all items' statuses
            $allItems = $purchaseOrder->items()->get(['status']);
            $allReceived = $allItems->every(fn($item) => $item->status === 'received');
            $anyReceived = $allItems->contains(fn($item) => in_array($item->status, ['received', 'partially_received']));

            if ($allReceived) {
                $purchaseOrder->update(['status' => 'received']);
            } elseif ($anyReceived) {
                $purchaseOrder->update(['status' => 'partially_received']);
            }

        });


        return redirect()->route('purchase-orders.show', $purchaseOrder)->with('success', 'Items received successfully.');
    }
}
