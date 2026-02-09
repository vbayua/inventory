<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\Location;
use App\Models\Product;
use App\Rules\Permissions\PurchaseOrderPermissions;
use App\Service\StockOperationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(PurchaseOrder::class, 'purchase_order');
    }

    public function index(PurchaseOrderPermissions $permissions)
    {
        $purchaseOrders = PurchaseOrder::with('supplier', 'location', 'location.warehouse:id,name')->latest();
        return Inertia::render('PurchaseOrders/Index', [
            'purchaseOrders' => $purchaseOrders,
        ])->with($permissions);
    }

    public function create()
    {
        $this->authorize('create', PurchaseOrder::class);
        $suppliers = Supplier::with('partner:id,name', 'products:id,name,sku')->get();
        $locations = Location::with('warehouse')->get();
        return Inertia::render('PurchaseOrders/Create', [
            'suppliers' => $suppliers,
            'locations' => $locations,
            'products' => Product::all(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', PurchaseOrder::class);
        $request->validate([
            'po_number' => 'required|unique:purchase_orders',
            'supplier_id' => 'required|exists:suppliers,id',
            'location_id' => 'required|exists:locations,id',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $purchaseOrder = PurchaseOrder::create($request->except('items'));

        foreach ($request->items as $item) {
            $purchaseOrder->items()->create($item);
        }

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase order created successfully.');
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('view', $purchaseOrder);
        $purchaseOrder->load('items.product', 'supplier', 'location');

        return Inertia::render('PurchaseOrders/Show', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function receive(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load('items.product', 'supplier', 'location');

        return Inertia::render('PurchaseOrders/Receive', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function receiveStore(Request $request, PurchaseOrder $purchaseOrder, StockOperationService $stockOperationService)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'items.*.quantity_received' => 'required|integer|min:0',
        ]);

        foreach ($request->items as $itemData) {
            $poItem = $purchaseOrder->items()->findOrFail($itemData['purchase_order_item_id']);

            if ($itemData['quantity_received'] > 0) {
                $stockData = [
                    'location_id' => $purchaseOrder->location->first()->id,
                    'batch_id' => null, // Let the service handle batch creation
                ];

                $stockOperationService->createInboundOperation(
                    $poItem->product,
                    $stockData,
                    $itemData['quantity_received'],
                    $poItem->product->unit->name,
                    "Received from PO #{$purchaseOrder->po_number}"
                );

                $poItem->increment('quantity_received', $itemData['quantity_received']);
            }
        }

        $totalOrdered = $purchaseOrder->items->sum('quantity');
        $totalReceived = $purchaseOrder->items->sum('quantity_received');

        if ($totalReceived >= $totalOrdered) {
            $purchaseOrder->update(['status' => 'received']);
        } elseif ($totalReceived > 0) {
            $purchaseOrder->update(['status' => 'partially_received']);
        }

        return redirect()->route('purchase-orders.show', $purchaseOrder)->with('success', 'Items received successfully.');
    }
}
