<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use App\Http\Requests\StorePartnerRequest;
use App\Http\Requests\UpdatePartnerRequest;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PartnerController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Partner::class);
        return Inertia::render('Partners/Index', [
            'partners' => Partner::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Partner::class);
        return Inertia::render('Partners/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePartnerRequest $request)
    {
        $this->authorize('create', Partner::class);
        DB::transaction(function () use ($request) {
            $validatedData = $request->validated();
            Partner::create($validatedData);
        });

        return redirect()->route('partners.index')->with('success', 'Partner created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Partner $partner)
    {
        $this->authorize('view', $partner);
        return Inertia::render('Partners/Show', [
            'partner' => $partner,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Partner $partner)
    {
        $this->authorize('update', $partner);
        return Inertia::render('Partners/Edit', [
            'partner' => $partner,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePartnerRequest $request, Partner $partner)
    {
        $this->authorize('update', $partner);
        DB::transaction(function () use ($request, $partner) {
            $validatedData = $request->validated();
            $partner->update($validatedData);
        });

        return redirect()->route('partners.index')->with('success', 'Partner updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Partner $partner)
    {
        $this->authorize('delete', $partner);

        DB::transaction(function () use ($partner) {
            $partner->delete();
        });

        return redirect()->route('partners.index')->with('success', 'Partner deleted successfully.');
    }
}
