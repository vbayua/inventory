<?php
namespace App\Policies;

use App\Models\ReceiveOrder;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ReceiveOrderPolicy
{
    use HandlesAuthorization;

    private function hasPermission(User $user, string $ability): bool
    {
        return $user->hasPermission("receive_order.{$ability}");
    }

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny');
    }

    public function view(User $user, ReceiveOrder $receiveOrder): bool
    {
        return $this->hasPermission($user, 'view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create');
    }

    public function update(User $user, ReceiveOrder $receiveOrder): bool
    {
        return $this->hasPermission($user, 'update');
    }

    public function delete(User $user, ReceiveOrder $receiveOrder): bool
    {
        return $this->hasPermission($user, 'delete');
    }

    public function restore(User $user, ReceiveOrder $receiveOrder): bool
    {
        return $this->hasPermission($user, 'restore');
    }

    public function forceDelete(User $user, ReceiveOrder $receiveOrder): bool
    {
        return $this->hasPermission($user, 'forceDelete');
    }
}
