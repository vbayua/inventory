<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AuthorizationSeeder extends Seeder
{
    public function run(): void
    {
        $resources = ['product', 'partner', 'stock', 'supplier', 'operation', 'warehouse', 'location', 'category', 'productType', 'unit', 'adjustment'];
        $actions = ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'];

        $permissions = collect($resources)->flatMap(function (string $resource) use ($actions) {
            return collect($actions)->map(function (string $action) use ($resource) {
                return Permission::firstOrCreate(
                    ['name' => "{$resource}.{$action}"],
                    ['description' => ucfirst($action).' '.$resource]
                );
            });
        });

        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            ['description' => 'System administrator with full permissions']
        );

        $operatorRole = Role::firstOrCreate(
            ['name' => 'operator'],
            ['description' => 'Operator with limited permissions']
        );

        $adminRole->permissions()->sync($permissions->pluck('id')->all());
        $operatorRole->permissions()->sync(
            $permissions->whereIn('name', [
                'product.viewAny',
                'product.view',
                'operation.viewAny',
                'operation.view',
                'operation.create',
                'stock.view',
                'stock.viewAny',
                'stock.create',
                'stock.update',
                'operation.update',
            ])->pluck('id')->all()
        );

        $adminUser = User::where('email', 'admin@example.com')->first();
        if ($adminUser) {
            $adminUser->roles()->syncWithoutDetaching([$adminRole->id]);
        }

        $operatorUser = User::where('email', 'operator@example.com')->first();
        if ($operatorUser) {
            $operatorUser->roles()->syncWithoutDetaching([$operatorRole->id]);
        }
    }
}
