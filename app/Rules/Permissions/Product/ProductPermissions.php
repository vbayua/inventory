<?php

namespace App\Rules\Permissions\Product;

use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Inertia\ProvidesInertiaProperties;
use Inertia\RenderContext;

class ProductPermissions implements ProvidesInertiaProperties
{
    public function __construct(#[CurrentUser] protected ?User $user)
    {
        //
    }

    public function toInertiaProperties(RenderContext $context): array
    {
        return [
            'permissions' => [
                'viewAny' => $this->user?->hasPermission('product.viewAny') ?? false,
                'view' => $this->user?->hasPermission('product.view') ?? false,
                'create' => $this->user?->hasPermission('product.create') ?? false,
                'update' => $this->user?->hasPermission('product.update') ?? false,
                'delete' => $this->user?->hasPermission('product.delete') ?? false,
                'restore' => $this->user?->hasPermission('product.restore') ?? false,
                'forceDelete' => $this->user?->hasPermission('product.forceDelete') ?? false,
            ],
        ];
    }
}
