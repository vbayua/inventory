<?php

namespace App\Models\Concerns;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasRoles
{
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function hasRole(string|Role $role): bool
    {
        $name = $role instanceof Role ? $role->name : $role;
        return $this->roles->contains(fn ($r) => $r->name === $name);
    }

    public function assignRole(string $role): static
    {
        $roleModel = $role instanceof Role ? $role : Role::where('name', $role)->firstOrFail();
        $this->roles()->syncWithoutDetaching($roleModel);
        return $this;
    }

    public function removeRole(string|Role $role): static
    {
        $roleModel = $role instanceof Role ? $role : Role::where('name', $role)->firstOrFail();
        $this->roles()->detach($roleModel);
        return $this;
    }

    public function permissions()
    {
        // Assuming Role has a permissions() belongsToMany relationship
        return $this->roles()->with('permissions')->get()
            ->flatMap(fn ($role) => $role->permissions)
            ->unique('id');
    }

    public function hasPermission(string $permission): bool
    {
        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permission) {
                $query->where('name', $permission);
            })
            ->exists();
    }
}
