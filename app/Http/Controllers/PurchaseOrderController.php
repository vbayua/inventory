<?php

namespace App\Http\Controllers;

use App\DTO\StockData;
use App\Http\Requests\ReceiveOrderStoreRequest;
use App\Http\Requests\StorePurchaseOrderRequest;
use App\Http\Requests\UpdatePurchaseOrderRequest;
use App\Models\Batch;
use App\Models\PurchaseOrder;
use App\Models\QcInspection;
use App\Models\Supplier;
use App\Models\Location;
use App\Models\Product;
use App\Rules\Permissions\PurchaseOrderPermissions;
use App\Service\StockOperationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

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
        $purchaseOrder->load('items', 'items.product:id,name,sku,unit', 'supplier:id,partner_id', 'supplier.partner:id,name', 'user:id,name');

        $receiveOrders = $purchaseOrder->receive_orders()->latest()->get();
        $receiveOrders->load('user:id,name');

        return Inertia::render('PurchaseOrders/Show', [
            'purchaseOrder' => $purchaseOrder,
            'receiveOrders' => $receiveOrders,
        ]);
    }

    public function update(UpdatePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->update($request->validated());
        return redirect()->back()->with('success', 'Purchase order updated successfully.');
    }

    public function receive(PurchaseOrder $purchaseOrder): Response
    {
        $purchaseOrder->load(
            'items:id,purchase_order_id,price,quantity,product_id',
            'items.product:id,name,sku,unit,product_type_id',
            'items.product.productType:id,default_location_id',
            'items.product.productType.defaultLocation:id,name',
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
            'locations' => Location::with('warehouse:id,name')->get(),
            'batches' => $batches,
        ]);
    }

    public function receiveStore(ReceiveOrderStoreRequest $request, PurchaseOrder $purchaseOrder, StockOperationService $stockOperationService): RedirectResponse
    {
        $receiveOrder = array_merge($request->validated(), ['user_id' => Auth::id()]);


        DB::transaction(function () use ($purchaseOrder, $receiveOrder, $stockOperationService) {
            $newReceiveOrder = $purchaseOrder->receive_orders()->create([
                'receive_number' => $receiveOrder['receive_order_number'],
                'reference_number' => $receiveOrder['reference_number'] ?? null,
                'receive_date' => Carbon::parse($receiveOrder['receive_date']),
                'notes' => $receiveOrder['notes'] ?? null,
                'user_id' => $receiveOrder['user_id'] ?? null,
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

                // Create a QC inspection record for this receive order item
                QcInspection::create([
                    'receive_order_id'      => $newReceiveOrder->id,
                    'receive_order_item_id' => $newReceiveOrderItem->id,
                    'status'                => 'pending',
                ]);

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
