<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Mpdf\Tag\P;

class AuthorizationSeeder extends Seeder
{
    public function run(): void
    {
        $resources = ['product', 'partner', 'stock', 'supplier', 'operation', 'warehouse', 'location', 'category', 'productType', 'unit', 'adjustment', 'purchase_order'];
        $actions = ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'];

        $permissions = collect($resources)->flatMap(
            fn(string $resource) =>
            collect($actions)->map(
                fn(string $action) =>
                Permission::firstOrCreate(
                    ['name' => "{$resource}.{$action}"],
                    ['description' => ucfirst($action).' '.$resource]
                )
            )
        );

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

        User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);

        User::factory()->operator()->create([
            'name' => 'Operator User',
            'email' => 'operator@example.com',
        ]);

        $this->command->info('Authorization seeding completed successfully.');
    }
}
