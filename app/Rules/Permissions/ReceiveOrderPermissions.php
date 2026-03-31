<?php
namespace App\Rules\Permissions;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Inertia\ProvidesInertiaProperties;
use Inertia\RenderContext;

class ReceiveOrderPermissions implements ProvidesInertiaProperties
{
    public function __construct(#[CurrentUser] protected ?User $user)
    {
        //
    }

    public function toInertiaProperties(RenderContext $context): array
    {
        return [
            'permissions' => [
                'viewAny' => $this->user?->hasPermission('receive_order.viewAny') ?? false,
                'view' => $this->user?->hasPermission('receive_order.view') ?? false,
                'create' => $this->user?->hasPermission('receive_order.create') ?? false,
                'update' => $this->user?->hasPermission('receive_order.update') ?? false,
                'delete' => $this->user?->hasPermission('receive_order.delete') ?? false,
                'restore' => $this->user?->hasPermission('receive_order.restore') ?? false,
                'forceDelete' => $this->user?->hasPermission('receive_order.forceDelete') ?? false,
            ],
        ];
    }
}
