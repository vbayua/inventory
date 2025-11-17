<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProductPolicy
{
    use HandlesAuthorization;

    private function hasPermission(User $user, string $ability): bool
    {
        return $user->hasPermission("product.{$ability}");
    }

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny');
    }

    public function view(User $user, Product $product): bool
    {
        return $this->hasPermission($user, 'view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create');
    }

    public function update(User $user, Product $product): bool
    {
        return $this->hasPermission($user, 'update');
    }

    public function delete(User $user, Product $product): bool
    {
        return $this->hasPermission($user, 'delete');
    }

    public function restore(User $user, Product $product): bool
    {
        return $this->hasPermission($user, 'restore');
    }

    public function forceDelete(User $user, Product $product): bool
    {
        return $this->hasPermission($user, 'forceDelete');
    }
}
