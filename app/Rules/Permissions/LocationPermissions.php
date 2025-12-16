<?php

namespace App\Rules\Permissions;

use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Inertia\ProvidesInertiaProperties;
use Inertia\RenderContext;

class LocationPermissions implements ProvidesInertiaProperties
{
    public function __construct(#[CurrentUser] protected ?User $user)
    {
        //
    }

    public function toInertiaProperties(RenderContext $context): array
    {
        return [
            'permissions' => [
                'viewAny' => $this->user?->hasPermission('location.viewAny') ?? false,
                'view' => $this->user?->hasPermission('location.view') ?? false,
                'create' => $this->user?->hasPermission('location.create') ?? false,
                'update' => $this->user?->hasPermission('location.update') ?? false,
                'delete' => $this->user?->hasPermission('location.delete') ?? false,
                'restore' => $this->user?->hasPermission('location.restore') ?? false,
                'forceDelete' => $this->user?->hasPermission('location.forceDelete') ?? false,
            ],
        ];
    }
}
