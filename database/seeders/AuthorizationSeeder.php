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
        $resources = [
            'product',
            'partner',
            'stock',
            'supplier',
            'operation',
            'warehouse',
            'location',
            'category',
            'productType',
            'unit',
            'adjustment',
            'purchase_order',
            'receive_order',
            'user',
            'qc_checklist',
            'qc_inspection'
        ];
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

        $adminUser = User::where('email', 'admin@example.com')->first();
        $operatorUser = User::where('email', 'operator@example.com')->first();
        if ($adminUser) {
            $this->command->info('Admin user exists');
        } else {
            $adminUser = User::factory()->admin()->create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
            ]);
            $this->command->info('Created admin user');
        }

        if ($operatorUser) {
            $this->command->info('Operator user exists');
        } else {
            $operatorUser = User::factory()->operator()->create([
                'name' => 'Operator User',
                'email' => 'operator@example.com',
            ]);
            $this->command->info('Created operator user');
        }

        $adminUser->assignRole('admin');
        $operatorUser->assignRole('operator');


        $this->command->info('Authorization seeding completed successfully.');
    }
}
