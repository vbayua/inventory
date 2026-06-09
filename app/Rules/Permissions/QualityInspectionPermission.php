<?php
namespace App\Rules\Permissions;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Inertia\ProvidesInertiaProperties;
use Inertia\RenderContext;

class QualityInspectionPermission implements ProvidesInertiaProperties
{
    public function __construct(#[CurrentUser] protected ?User $user)
    {
        $this->user = $user;
    }

    public function toInertiaProperties(RenderContext $context): array
    {
        return [
            'permissions' => [
                'viewAny' => $this->user?->hasPermission('qc_inspection.viewAny') ?? false,
                'view' => $this->user?->hasPermission('qc_inspection.view') ?? false,
                'create' => $this->user?->hasPermission('qc_inspection.create') ?? false,
                'update' => $this->user?->hasPermission('qc_inspection.update') ?? false,
                'delete' => $this->user?->hasPermission('qc_inspection.delete') ?? false,
                'restore' => $this->user?->hasPermission('qc_inspection.restore') ?? false,
                'forceDelete' => $this->user?->hasPermission('qc_inspection.forceDelete') ?? false,
            ],
        ];
    }
}
