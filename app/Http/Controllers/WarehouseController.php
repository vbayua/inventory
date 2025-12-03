<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWarehouseRequest;
use App\Http\Requests\UpdateWarehouseRequest;
use App\Models\Warehouse;
use App\Rules\Permissions\WarehousePermissions;
use Illuminate\Support\Facades\Cache;

class WarehouseController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Warehouse::class, 'warehouse');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(WarehousePermissions $permissions)
    {
        $warehouseData = Warehouse::with('locations')->orderBy('created_at', 'desc')->get();
        $warehouses = Cache::remember('warehouses_index', 3600, fn () => $warehouseData);

        return Inertia('Warehouses/Index', [
            'warehouses' => $warehouses,
            $permissions,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia('Warehouses/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreWarehouseRequest $request)
    {
        $validated = $request->validated();
        Warehouse::create($validated);
        Cache::forget('warehouses_index'); // Clear cache after creating a new warehouse

        return redirect()->route('warehouse.index')->with('success', 'Warehouse created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Warehouse $warehouse)
    {
        $warehouse->load('locations');
        $stocks = $warehouse->stocks->count();

        return inertia('Warehouses/Show', [
            'warehouse' => $warehouse,
            'stockCount' => $stocks,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Warehouse $warehouse)
    {
        return Inertia('Warehouses/Edit', [
            'warehouse' => $warehouse,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateWarehouseRequest $request, Warehouse $warehouse)
    {
        // dd($request);
        $validated = $request->validated();
        $warehouse->update($validated);
        Cache::forget('warehouses_index'); // Clear cache after updating a warehouse

        return redirect()->route('warehouse.show', $warehouse->id)
            ->with('success', 'Warehouse updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Warehouse $warehouse)
    {
        $warehouse->delete();

        return redirect()->route('warehouse.index')->with('success', 'Warehouse deleted successfully.');
    }
}
