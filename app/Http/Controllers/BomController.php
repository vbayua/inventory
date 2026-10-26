<?php

namespace App\Http\Controllers;

use App\Enums\BomStatus;
use App\Models\Bom;
use App\Models\Product;
use App\Models\Unit;
use App\Service\ProductionOrderService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;

class BomController extends Controller
{
    public function index()
    {
        $boms = Bom::with(['product'])->get();

        return Inertia::render('Production/Bom/Index', [
            'boms' => $boms,
        ]);
    }

    public function show(Bom $bom)
    {
        $bom->load(
            [
                'product:id,name,sku',
                'lines.component:id,name,sku',
                'productionOrders',
            ]);

        return Inertia::render('Production/Bom/Show', [
            'bom' => $bom,
        ]);
    }

    /**
     * Make the BOM its product's only active BOM, retiring the one it replaces.
     */
    public function activateBom(Bom $bom): RedirectResponse
    {
        DB::transaction(function () use ($bom) {
            $bom = Bom::whereKey($bom->id)->lockForUpdate()->firstOrFail();

            if (! $bom->status->canTransition(BomStatus::Active)) {
                throw ValidationException::withMessages([
                    'status' => "A {$bom->status->value} BOM cannot be activated.",
                ]);
            }

            Bom::where('active_product_id', $bom->product_id)
                ->lockForUpdate()
                ->update(['status' => BomStatus::Retired]);

            $bom->update([
                'status' => BomStatus::Active,
                'activated_at' => now(),
                'activated_by' => Auth::id(),
            ]);
        });

        return redirect()->route('bom.show', $bom)->with('success', 'BOM activated successfully');
    }

    public function create()
    {
        $finishedGoods = Product::whereHas('productType', function ($query) {
            $query->where('type_code', 'FG');
        })->get();
        $materials = Product::with(['unit:name,base_unit,unit_type'])->whereHas('productType', function ($query) {
            $query->whereNot('type_code', 'FG');
        })->select(['id', 'name', 'sku', 'unit'])->orderBy('sku')->get();
        $units = Unit::select('name', 'base_unit', 'unit_type')->get();

        return Inertia::render('Production/Bom/Create',
            [
                'finishedGoods' => $finishedGoods,
                'materials' => $materials,
                'units' => $units,
            ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => [
                'required',
                'integer',
                'exists:products,id',
            ],
            'materials' => 'required|array',
            'materials.*.product_id' => 'required|integer|distinct|exists:products,id',
            'materials.*.quantity_per_unit' => 'required|integer',
            'materials.*.unit' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $status = BomStatus::Draft;
        $user = Auth::id();

        try {
            DB::transaction(function () use ($data, $status, $user) {
                $bom = Bom::create([
                    'product_id' => $data['product_id'],
                    'version' => (Bom::where('product_id', $data['product_id'])->max('version') ?? 0) + 1,
                    'status' => $status,
                    'created_by' => $user,
                ]);
                foreach ($data['materials'] as $material) {
                    $bom->lines()->create([
                        'component_product_id' => $material['product_id'],
                        'quantity_per_unit' => $material['quantity_per_unit'],
                        'unit' => $material['unit'],
                    ]);
                }
            });
        } catch (UniqueConstraintViolationException) {
            return redirect()->back()->with('error', 'Another BOM version was saved for this product at the same time. Please try again.');
        } catch (Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'The BOM could not be saved. Please try again.');
        }

        return redirect()->route('bom.index')->with('success', 'BOM created successfully');
    }

    public function createProductionOrder(Request $request, Bom $bom, ProductionOrderService $productionOrderService): RedirectResponse
    {
        $data = $request->validate([
            'target_quantity' => 'required|numeric|gt:0',
            'notes' => 'nullable|string',
            'order_number' => 'nullable|string',
        ]);

        if ($bom->status !== BomStatus::Active) {
            throw ValidationException::withMessages([
                'bom' => 'Production orders can only be created from the product\'s active BOM.',
            ]);
        }

        $productionOrder = $productionOrderService->createForProduct($bom->product, $data);

        return redirect()->route('production.show', $productionOrder)->with('success', 'Production order created successfully');
    }

    public function destroy(Bom $bom)
    {
        $hasProductionOrders = $bom->productionOrders()->exists();
        if ($hasProductionOrders) {
            return redirect()->route('bom.index')->with('error', 'Cannot delete BOM with production orders');
        }

        $bomStatusActive = $bom->status === BomStatus::Active;
        if ($bomStatusActive) {
            return redirect()->route('bom.index')->with('error', 'Cannot delete active BOM');
        }

        $bom->delete();

        return redirect()->route('bom.index')->with('success', 'BOM deleted successfully');
    }
}
