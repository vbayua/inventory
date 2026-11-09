<?php

namespace App\Http\Controllers;

use App\Enums\ProductionOrderStatus;
use App\Models\Bom;
use App\Models\Product;
use App\Models\ProductionOrder;
use App\Models\ProductionOrderMaterial;
use App\Models\Stock;
use App\Service\ProductionIssueService;
use App\Service\ProductionOrderService;
use App\Service\ProductionOrderStatusService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductionOrderController extends Controller
{
    public function index()
    {
        $productionOrders = ProductionOrder::with([
            'product:id,name,sku,unit',
        ])->get();

        return Inertia::render('Production/Index', ['productionOrders' => $productionOrders]);
    }

    public function show(ProductionOrder $production)
    {
        $production->load([
            'product:id,name,sku,unit',
            'bom:id,version,status',
            'materials',
            'materials.product:id,name,sku,unit',
        ]);

        return Inertia::render('Production/Show', ['production' => $production]);
    }

    public function issue(ProductionOrder $production)
    {
        $production->load([
            'product:id,name,sku,unit',
            'bom:id,version,status',
            'issues',
        ]);
        dd($production);

        return Inertia::render('Production/Issue/Index', ['production' => $production]);
    }

    public function create()
    {
        $finishedGoods = Product::with([
            'productType',
            'activeBom.lines.component',
        ])->whereHas('productType', function ($query) {
            $query->where('assemblable', true);
        })->get();

        return Inertia::render('Production/Create', ['finishedGoods' => Inertia::optional(fn() => $finishedGoods)]);
    }

    public function store(Request $request, ProductionOrderService $productionOrderService): RedirectResponse
    {
        $request->mergeIfMissing([
            'bom_id' => Bom::where('active_product_id', $request->integer('product_id'))->value('id'),
        ]);

        $data = $request->validate([
            'product_id' => ['required', Rule::exists('products', 'id')],
            'bom_id' => ['required', Rule::exists('boms', 'id')->where('active_product_id', $request->integer('product_id'))],
            'target_quantity' => ['required', 'numeric', 'gt:0'],
            'notes' => ['nullable', 'string'],
            'order_number' => ['required', 'string', 'unique:production_orders,order_number'],
        ], [
            'bom_id.required' => 'This product has no active BOM.',
            'bom_id.exists' => 'The selected BOM is not the product\'s active BOM.',
            'order_number.unique' => 'This order number is already in use.',
        ]);
        $product = Product::findOrFail($data['product_id']);
        $productionOrder = $productionOrderService->createForProduct($product, $data);

        return redirect()->route('production.show', $productionOrder)->with('success', 'Production order created successfully.');
    }

    public function edit()
    {
        return Inertia::render('Production/Edit');
    }

    public function createIssue(ProductionOrder $production, ProductionOrderMaterial $material)
    {
        $production->load([
            'product:id,name,sku,unit',
            'bom:id,version,status',
        ]);

        $material->load([
            'product:id,name,sku,unit',
        ]);

        return Inertia::render('Production/Issue/Create', [
            'production' => $production,
            'material' => $material,
            'stocks' => $this->issuableStocksQuery($material)->get(),
            'suggestedBatch' => Inertia::optional(fn () => $this->issuableStocksQuery($material)->first()),
        ]);
    }

    public function updateStatus(Request $request, ProductionOrder $production, ProductionOrderStatusService $statusService)
    {
        $data = $request->validate([
            'status' => ['required', Rule::enum(ProductionOrderStatus::class)],
            'cancel_note' => ['nullable', 'string'],
        ]);

        $statusService->transition($production, ProductionOrderStatus::from($data['status']), $data['cancel_note'] ?? null);

        return redirect()->route('production.show', $production)->with('success', 'Production order status updated successfully.');
    }

    /**
     * Stocks of the material's component that can be issued, ordered FEFO:
     * earliest expiry first, batches without expiry last, then oldest manufactured.
     *
     * @return Builder<Stock>
     */
    private function issuableStocksQuery(ProductionOrderMaterial $material): Builder
    {
        return Stock::query()
            ->select('stocks.*')
            ->join('batches', 'batches.id', '=', 'stocks.batch_id')
            ->with([
                'product:id,name,sku,unit',
                'batch:id,product_id,batch_number,manufacture_date,expiry_date',
                'location:id,name,warehouse_id',
                'location.warehouse:id,name',
            ])
            ->where('stocks.product_id', $material->component_product_id)
            ->where('stocks.quantity', '>', 0)
            ->where(function (Builder $query) {
                $query->whereNull('batches.expiry_date')
                    ->orWhere('batches.expiry_date', '>=', now()->toDateString());
            })
            ->orderByRaw('batches.expiry_date is null')
            ->orderBy('batches.expiry_date')
            ->orderBy('batches.manufacture_date')
            ->orderBy('stocks.id');
    }

    public function storeIssue(Request $request, ProductionOrder $production, ProductionOrderMaterial $material, ProductionIssueService $issueService)
    {
        abort_unless((int) $material->production_order_id === $production->id, 404);

        $data = $request->validate([
            'request_uuid' => ['required', 'uuid'],
            'picks' => ['required', 'array', 'min:1'],
            'picks.*.stock_id' => ['required', 'integer', 'distinct', Rule::exists('stocks', 'id')],
            'picks.*.quantity' => ['required', 'numeric', 'gt:0'],
            'note' => ['nullable', 'string'],
        ]);

        $issueService->issue($production, $material, $data['request_uuid'], $data['picks'], $data['note'] ?? null);

        return redirect()->route('production.show', $production)->with('success', 'Material issued successfully.');
    }

    public function destroy(ProductionOrder $production)
    {
        $isDeleteable = $production->status !== 'draft';

        if (! $isDeleteable) {
            return redirect()->route('production.index')->with('error', 'Cannot delete a production order that is not in draft status.');
        }

        $production->delete();

        return redirect()->route('production.index')->with('success', 'Production order deleted successfully.');
    }
}
