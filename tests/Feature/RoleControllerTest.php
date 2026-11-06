<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function () {
    $this->seed(AuthorizationSeeder::class);
});

test('lists roles with their user and permission counts', function () {
    $role = Role::factory()->create(['name' => 'auditor']);
    $role->permissions()->attach(Permission::where('name', 'stock.viewAny')->value('id'));
    User::factory()->create()->roles()->attach($role);

    $response = asAdmin()->get(route('role.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Roles/Index')
        ->where('roles', fn ($roles) => collect($roles)->contains(fn (array $listed) => $listed['name'] === 'auditor'
            && $listed['users_count'] === 1
            && $listed['permissions_count'] === 1))
    );
});

test('renders the create role form', function () {
    $response = asAdmin()->get(route('role.create'));

    $response->assertInertia(fn (Assert $page) => $page->component('Roles/Create'));
});

test('creates a role and redirects to its permissions', function () {
    $response = asAdmin()->post(route('role.store'), [
        'name' => 'auditor',
        'description' => 'Read-only access for audits',
    ]);

    $role = Role::where('name', 'auditor')->firstOrFail();
    $response->assertRedirectToRoute('role.edit.permissions', $role);
    assertDatabaseHas('roles', ['name' => 'auditor', 'description' => 'Read-only access for audits']);
});

test('rejects a role name that already exists', function () {
    $response = asAdmin()->post(route('role.store'), [
        'name' => 'operator',
        'description' => 'Duplicate',
    ]);

    $response->assertSessionHasErrors(['name' => 'A role with this name already exists.']);
    assertDatabaseCount('roles', 2);
});

test('requires a name and description', function () {
    $response = asAdmin()->post(route('role.store'), []);

    $response->assertSessionHasErrors([
        'name' => 'The name field is required.',
        'description' => 'The description field is required.',
    ]);
    assertDatabaseCount('roles', 2);
});

test('forbids operators from creating roles', function () {
    $response = asNonAdmin()->post(route('role.store'), [
        'name' => 'auditor',
        'description' => 'Read-only access for audits',
    ]);

    $response->assertForbidden();
    assertDatabaseMissing('roles', ['name' => 'auditor']);
});

test('forbids operators from changing role permissions', function () {
    $operatorRole = Role::where('name', 'operator')->firstOrFail();
    $permissionCount = $operatorRole->permissions()->count();

    $response = asNonAdmin()->put(route('role.update.permissions', $operatorRole), [
        'permissions' => Permission::pluck('id')->all(),
    ]);

    $response->assertForbidden();
    expect($operatorRole->permissions()->count())->toBe($permissionCount);
});

test('forbids operators from opening role pages', function (string $routeName, bool $needsRole) {
    $role = Role::where('name', 'admin')->firstOrFail();

    $response = asNonAdmin()->get($needsRole ? route($routeName, $role) : route($routeName));

    $response->assertForbidden();
})->with([
    'index' => ['role.index', false],
    'create' => ['role.create', false],
    'show' => ['role.show', true],
    'edit' => ['role.edit', true],
    'edit permissions' => ['role.edit.permissions', true],
]);
