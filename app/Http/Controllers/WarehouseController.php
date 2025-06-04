<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use App\Http\Requests\StoreWarehouseRequest;
use App\Http\Requests\UpdateWarehouseRequest;

class WarehouseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia('Warehouses/Index', [
            'warehouses' => Warehouse::orderBy('created_at', 'desc')
                ->paginate(10)
                ->withQueryString()
                ->through(fn($warehouse) => [
                    'id' => $warehouse->id,
                    'name' => $warehouse->name,
                    'created_at' => $warehouse->created_at->diffForHumans(),
                    'updated_at' => $warehouse->updated_at->diffForHumans(),
                ]),
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

        return redirect()->route('warehouse.index')->with('success', 'Warehouse created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Warehouse $warehouse)
    {
        $warehouse->load('locations');
        return inertia('Warehouses/Show', [
            'warehouse' => $warehouse
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
