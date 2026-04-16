<?php

namespace App\Http\Controllers;

use App\Models\ProductType;
use App\Models\QcChecklist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QcChecklistController extends Controller
{
    public function index()
    {
        $checklists = QcChecklist::with('productType:id,name', 'user:id,name')
            ->withCount('items')
            ->latest()
            ->get();

        return Inertia::render('Qc/Checklists/Index', [
            'checklists' => $checklists,
        ]);
    }

    public function create()
    {
        return Inertia::render('Qc/Checklists/Create', [
            'productTypes' => ProductType::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                   => 'required|string|max:255',
            'description'            => 'nullable|string',
            'product_type_id'        => 'nullable|exists:product_types,id',
            'is_active'              => 'boolean',
            'items'                  => 'required|array|min:1',
            'items.*.item_name'      => 'required|string|max:255',
            'items.*.description'    => 'nullable|string',
            'items.*.is_required'    => 'boolean',
            'items.*.sort_order'     => 'integer|min:0',
        ]);

        $checklist = QcChecklist::create([
            'name'            => $data['name'],
            'description'     => $data['description'] ?? null,
            'product_type_id' => $data['product_type_id'] ?? null,
            'is_active'       => $data['is_active'] ?? true,
            'user_id'         => Auth::id(),
        ]);

        foreach ($data['items'] as $index => $item) {
            $checklist->items()->create([
                'item_name'   => $item['item_name'],
                'description' => $item['description'] ?? null,
                'is_required' => $item['is_required'] ?? true,
                'sort_order'  => $item['sort_order'] ?? $index,
            ]);
        }

        return redirect()->route('qc.checklists.index')
            ->with('success', 'Checklist created successfully.');
    }

    public function show(QcChecklist $checklist)
    {
        $checklist->load('items', 'productType:id,name', 'user:id,name');

        return Inertia::render('Qc/Checklists/Show', [
            'checklist' => $checklist,
        ]);
    }

    public function edit(QcChecklist $checklist)
    {
        $checklist->load('items');

        return Inertia::render('Qc/Checklists/Edit', [
            'checklist'    => $checklist,
            'productTypes' => ProductType::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, QcChecklist $checklist)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'product_type_id' => 'nullable|exists:product_types,id',
            'is_active'       => 'boolean',
        ]);

        $checklist->update($data);

        return redirect()->back()->with('success', 'Checklist updated.');
    }

    public function destroy(QcChecklist $checklist)
    {
        $checklist->delete();

        return redirect()->route('qc.checklists.index')
            ->with('success', 'Checklist deleted.');
    }
}
