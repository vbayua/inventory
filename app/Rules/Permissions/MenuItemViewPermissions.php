<?php

namespace App\Rules\Permissions;

use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Inertia\ProvidesInertiaProperties;
use Inertia\RenderContext;

class MenuItemViewPermissions implements ProvidesInertiaProperties
{
    public function __construct(#[CurrentUser] protected ?User $user)
    {
        //
    }

    public function toInertiaProperties(RenderContext $context): array
    {
        return [
            'permissions' => [
                'products' => [
                    'viewAny' => $this->user?->hasPermission('product.viewAny') ?? false,
                    'view' => $this->user?->hasPermission('product.view') ?? false,
                ],
                'warehouse' => [
                    'viewAny' => $this->user?->hasPermission('warehouse.viewAny') ?? false,
                    'view' => $this->user?->hasPermission('warehouse.view') ?? false,
                ],
                'location' => [
                    'viewAny' => $this->user?->hasPermission('location.viewAny') ?? false,
                    'view' => $this->user?->hasPermission('location.view') ?? false,
                ],
                'stock' => [
                    'viewAny' => $this->user?->hasPermission('stock.viewAny') ?? false,
                    'view' => $this->user?->hasPermission('stock.view') ?? false,
                ],
                'operations' => [
                    'viewAny' => $this->user?->hasPermission('operation.viewAny') ?? false,
                    'view' => $this->user?->hasPermission('operation.view') ?? false,
                ],
                'purchase_order' => [
                    'viewAny' => $this->user?->hasPermission('purchase_order.viewAny') ?? false,
                    'view' => $this->user?->hasPermission('purchase_order.view') ?? false,
                ],
                // Add other resource permissions here as needed
            ],
        ];
    }
}
