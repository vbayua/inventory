<?php

namespace App\Models\Concerns;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

trait HasRoles
{
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function hasRole(string|Role $role): bool
    {
        $name = $role instanceof Role ? $role->name : $role;
        return $this->cachedRoleNames()->contains($name);    }

    public function assignRole(string $role): static
    {
        $roleModel = $role instanceof Role ? $role : Role::where('name', $role)->firstOrFail();
        $this->roles()->syncWithoutDetaching($roleModel);

        $this->forgetAuthorizationCache();
        return $this;
    }

    public function removeRole(string|Role $role): static
    {
        $roleModel = $role instanceof Role ? $role : Role::where('name', $role)->firstOrFail();
        $this->roles()->detach($roleModel);
        $this->forgetAuthorizationCache();
        return $this;
    }

    public function permissions()
    {
        // Assuming Role has a permissions() belongsToMany relationship
        $permissionIds = Cache::remember(
            $this->permissionCacheKey(),
            now()->addMinutes(10),
            fn () => $this->roles()->with('permissions')->get()
                ->flatMap(fn ($role) => $role->permissions)
                ->unique('id')
                ->pluck('id'),
        );
        return Permission::whereIn('id', $permissionIds);
    }

    public function hasPermission(string $permission): bool
    {
        return $this->cachedPermissionNames()->contains($permission);
    }

    public function cachedRoleNames(): Collection
    {
        return Cache::remember(
            $this->roleCacheKey(),
            now()->addMinutes(10),
            fn (): Collection => $this->roles()->pluck('name'),
        );
    }

    public function cachedPermissionNames(): Collection
    {
        $permissionNames =  Cache::remember(
            $this->permissionNameCacheKey(),
            now()->addMinutes(10),
            fn (): Collection => $this->permissions()->pluck('name'),
        );
        return $permissionNames;
    }

    public function forgetAuthorizationCache(): void
    {
        Cache::forget($this->roleCacheKey());
        Cache::forget($this->permissionCacheKey());
        Cache::forget($this->permissionNameCacheKey());
    }

    protected function roleCacheKey(): string
    {
        return 'authorization:user:'.$this->getKey().':roles';
    }

    protected function permissionCacheKey(): string
    {
        return 'authorization:user:'.$this->getKey().':permission-ids';
    }

    protected function permissionNameCacheKey(): string
    {
        return 'authorization:user:'.$this->getKey().':permissions';
    }
}
