<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $userIsLoggedIn = $request->user() !== null;
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'viewPermissions' => $userIsLoggedIn ? [
                    'product' => $request->user()->hasPermission('product.viewAny') ?? false,
                    'warehouse' => $request->user()->hasPermission('warehouse.viewAny') ?? false,
                    'location' => $request->user()->hasPermission('location.viewAny') ?? false,
                    'stock' => $request->user()->hasPermission('stock.viewAny') ?? false,
                    'operation' => $request->user()->hasPermission('operation.viewAny') ?? false,
                    'supplier' => $request->user()->hasPermission('supplier.viewAny') ?? false,
                    'partner' => $request->user()->hasPermission('partner.viewAny') ?? false,
                ]: []
            ],
            'uri' => $request->route()?->uri,
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => function () {
                return [
                    'success' => session('success'),
                ];
            }
        ];
    }
}
