<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Http\Requests\StoreLocationRequest;
use App\Http\Requests\UpdateLocationRequest;

class LocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // $filters = request()->only(['name', 'warehouse_id']);
        // $query = Location::with(['warehouse'])->orderBy('created_at', 'desc');
        $locations = Location::with(['warehouse'])->orderBy('created_at', 'desc');
        // $locations = $query->filter($filters)
        //     ->paginate(10)
        //     ->appends($filters)
        //     ->withQueryString()
        //     ->through(fn($location) => [
        //         'id' => $location->id,
        //         'name' => $location->name,
        //         'warehouse' => [
        //             'id' => $location->warehouse->id,
        //             'name' => $location->warehouse->name,
        //         ],
        //         'created_at' => $location->created_at,
        //         'updated_at' => $location->updated_at,
        //     ]);

        return Inertia('Locations/Index', [
            'locations' => $locations->get(),
            'name' => request()->name,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia('Locations/Create', [
            'warehouses' => \App\Models\Warehouse::all()->map(fn($warehouse) => [
                'id' => $warehouse->id,
                'name' => $warehouse->name,
            ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLocationRequest $request)
    {
        Location::create($request->validated());
        return redirect()->route('location.index')->with('success', 'Location created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Location $location)
    {
        $location->load([
            'warehouse',
            'stocks' => function ($q) {
                $q->with([
                    'product',
                    'batch',
                ]);
            },
        ]);
        return Inertia('Locations/Show', [
            'location' => $location,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Location $location)
    {
        return Inertia('Locations/Edit', [
            'location' => $location->load(['warehouse']),
            'warehouses' => \App\Models\Warehouse::all()->map(fn($warehouse) => [
                'id' => $warehouse->id,
                'name' => $warehouse->name,
            ]),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLocationRequest $request, Location $location)
    {
        $location->update($request->validated());
        return redirect()->route('location.show', $location->id)->with('success', 'Location updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Location $location)
    {
        $location->delete();
        return redirect()->route('location.index')->with('success', 'Location deleted successfully.');
    }
}
