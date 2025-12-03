<?php

namespace App\Rules\Permissions;

use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Inertia\ProvidesInertiaProperties;
use Inertia\RenderContext;

class WarehousePermissions implements ProvidesInertiaProperties
{
    public function __construct(#[CurrentUser] protected ?User $user)
    {
        //
    }

    public function toInertiaProperties(RenderContext $context): array
    {
        return [
            'permissions' => [
                'viewAny' => $this->user?->hasPermission('warehouse.viewAny') ?? false,
                'view' => $this->user?->hasPermission('warehouse.view') ?? false,
                'create' => $this->user?->hasPermission('warehouse.create') ?? false,
                'update' => $this->user?->hasPermission('warehouse.update') ?? false,
                'delete' => $this->user?->hasPermission('warehouse.delete') ?? false,
                'restore' => $this->user?->hasPermission('warehouse.restore') ?? false,
                'forceDelete' => $this->user?->hasPermission('warehouse.forceDelete') ?? false,
            ],
        ];
    }
}
