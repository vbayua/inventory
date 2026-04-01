<?php

namespace App\Http\Controllers;

use App\Models\ReceiveOrder;
use App\Models\ReceiveOrderItem;
use App\Rules\Permissions\ReceiveOrderPermissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReceiveOrderController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(ReceiveOrder::class, 'receive_order');
    }

    public function index(ReceiveOrderPermissions $permissions)
    {
        $receiveOrders = ReceiveOrder::with(
            'purchaseOrder:id,po_number,supplier_id',
            'purchaseOrder.supplier:id,partner_id',
            'purchaseOrder.supplier.partner:id,name',
        )->latest()->get();
        return Inertia::render('ReceiveOrders/Index', [
            'receiveOrders' => $receiveOrders,
            'permissions' => $permissions,
        ]);
    }

    public function create()
    {
        // return Inertia::render('ReceiveOrders/Create');
    }

    public function store(Request $request)
    {
        //
    }

    public function show(ReceiveOrder $receive_order)
    {
        $receive_order->load(
            'receiveOrderItems',
            'receiveOrderItems.location:id,name',
            'receiveOrderItems.purchaseOrderItem:id,product_id,quantity',
            'receiveOrderItems.purchaseOrderItem.product:id,name'
        );
        $receive_order->load(
            'purchaseOrder:id,po_number,supplier_id',
            'purchaseOrder.supplier.partner'
        );
        // dd($receive_order);
        return Inertia::render('ReceiveOrders/Show', [
            'receiveOrder' => $receive_order,
        ]);
    }

    public function showItem(ReceiveOrder $receive_order, ReceiveOrderItem $item)
    {
        return Inertia::render('ReceiveOrders/Item', [
            'receive_order' => $receive_order,
            'item' => $item,
        ]);
    }

    public function edit(ReceiveOrder $receive_order)
    {
        return Inertia::render('ReceiveOrders/Edit', [
            'receive_order' => $receive_order,
        ]);
    }

    public function update(Request $request, ReceiveOrder $receive_order)
    {
       $receive_order->update($request->validate([
           'notes' => 'nullable|string',
       ]));

       return redirect()->back()->with('success', 'Receive order updated successfully.');
    }

    public function receive(ReceiveOrder $receive_order)
    {
        return Inertia::render('ReceiveOrders/Receive', [
            'receive_order' => $receive_order,
        ]);
    }

    public function receiveStore(Request $request, ReceiveOrder $receive_order)
    {
        //
    }
}
