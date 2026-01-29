<?php
namespace App\Policies;

use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PurchaseOrderPolicy
{
    use HandlesAuthorization;

    private function hasPermission(User $user, string $ability): bool
    {
        return $user->hasPermission("purchase_order.{$ability}");
    }

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny');
    }

    public function view(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $this->hasPermission($user, 'view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create');
    }

    public function update(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $this->hasPermission($user, 'update');
    }

    public function delete(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $this->hasPermission($user, 'delete');
    }

    public function restore(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $this->hasPermission($user, 'restore');
    }

    public function forceDelete(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $this->hasPermission($user, 'forceDelete');
    }
}
