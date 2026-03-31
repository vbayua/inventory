<?php

namespace App\Http\Controllers;

use App\Models\ReceiveOrder;
use App\Rules\Permissions\ReceiveOrderPermissions;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReceiveOrderController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(ReceiveOrder::class, 'receive_order');
    }

    public function index(ReceiveOrderPermissions $permissions)
    {
        $receiveOrders = ReceiveOrder::with('purchaseOrder')->latest()->get();
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
        return Inertia::render('ReceiveOrders/Show', [
            'receive_order' => $receive_order,
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
        //
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
